const express = require("express");
const cors = require("cors");
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input validation middleware
const validateInput = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        next();
    };
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

// MySQL connection
const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Mharkarlo29.",
    database: process.env.DB_NAME || "lg"
};

let con;

const connectToDatabase = async () => {
    try {
        con = await mysql.createConnection(dbConfig);
        console.log("Connected to MySQL!");
    } catch (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    }
};

connectToDatabase();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// USERS ENDPOINTS

// POST /api/users - Create new user (Sign up)
app.post("/api/users", upload.single('image'), async (req, res) => {
    try {
        const { username, password, firstName, lastName, email } = req.body;
        
        // Validate required fields
        if (!username || !password || !firstName || !lastName || !email) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if user already exists
        const [existingUsers] = await con.execute(
            'SELECT userID FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        // Handle image upload
        let imgData = null;
        if (req.file) {
            const filePath = req.file.path;
            imgData = await fs.promises.readFile(filePath);
            // Clean up uploaded file
            await fs.promises.unlink(filePath);
        } else {
            // Use default image
            const fallbackImagePath = path.join('C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads', 'blank.webp');
            if (fs.existsSync(fallbackImagePath)) {
                imgData = await fs.promises.readFile(fallbackImagePath);
            }
        }

        // Insert new user
        const [result] = await con.execute(
            'INSERT INTO users (username, pass, firstName, lastName, email, img) VALUES (?, ?, ?, ?, ?, ?)',
            [username, password, firstName, lastName, email, imgData]
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { userID: result.insertId }
        });

    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// PUT /api/users/:id - Update user profile
app.put("/api/users/:id", upload.single('image'), async (req, res) => {
    try {
        const userID = req.params.id;
        const { username, password, firstName, lastName, email } = req.body;

        // Validate required fields
        if (!username || !password || !firstName || !lastName || !email) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if username or email exists for different user
        const [existingUsers] = await con.execute(
            'SELECT userID FROM users WHERE (username = ? OR email = ?) AND userID != ?',
            [username, email, userID]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username or email already in use'
            });
        }

        let updateQuery, updateParams;

        if (req.file) {
            const filePath = req.file.path;
            const imgData = await fs.promises.readFile(filePath);
            await fs.promises.unlink(filePath); // Clean up

            updateQuery = 'UPDATE users SET username = ?, pass = ?, firstName = ?, lastName = ?, email = ?, img = ? WHERE userID = ?';
            updateParams = [username, password, firstName, lastName, email, imgData, userID];
        } else {
            updateQuery = 'UPDATE users SET username = ?, pass = ?, firstName = ?, lastName = ?, email = ? WHERE userID = ?';
            updateParams = [username, password, firstName, lastName, email, userID];
        }

        const [result] = await con.execute(updateQuery, updateParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully'
        });

    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// POST /api/auth/login - User login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const [users] = await con.execute(
            'SELECT userID, username, firstName, lastName, email, img FROM users WHERE username = ? AND pass = ?',
            [username, password]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            data: users[0]
        });

    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// GET /api/users - Get all users
app.get("/api/users", async (req, res) => {
    try {
        const [users] = await con.execute('SELECT userID, username, firstName, lastName, email, rating FROM users');
        
        res.json({
            success: true,
            data: users
        });

    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// GET /api/users/:id - Get specific user
app.get("/api/users/:id", async (req, res) => {
    try {
        const userID = req.params.id;
        
        const [users] = await con.execute(
            'SELECT userID, username, firstName, lastName, email, rating, img FROM users WHERE userID = ?',
            [userID]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// CATEGORIES ENDPOINTS

// GET /api/categories - Get all categories
app.get("/api/categories", async (req, res) => {
    try {
        const [categories] = await con.execute('SELECT * FROM categories');
        
        res.json({
            success: true,
            data: categories
        });

    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// SERVICES ENDPOINTS

// GET /api/services - Get all services or by category
app.get("/api/services", async (req, res) => {
    try {
        const { category } = req.query;
        let query, params = [];
        
        if (category && category !== '0') {
            query = 'SELECT * FROM services WHERE catID = ?';
            params = [category];
        } else {
            query = 'SELECT * FROM services';
        }

        const [services] = await con.execute(query, params);
        
        res.json({
            success: true,
            data: services
        });

    } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch services',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// GET /api/services/:id - Get specific service
app.get("/api/services/:id", async (req, res) => {
    try {
        const serviceID = req.params.id;
        
        const [services] = await con.execute(
            'SELECT * FROM services WHERE serviceID = ?',
            [serviceID]
        );

        if (services.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            data: services[0]
        });

    } catch (err) {
        console.error('Error fetching service:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch service',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// GET /api/users/:id/services - Get services by user
app.get("/api/users/:id/services", async (req, res) => {
    try {
        const userID = req.params.id;
        
        const [services] = await con.execute(
            'SELECT * FROM services WHERE ownerID = ?',
            [userID]
        );

        res.json({
            success: true,
            data: services
        });

    } catch (err) {
        console.error('Error fetching user services:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user services',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// POST /api/services - Create new service
app.post('/api/services', upload.single('thumbnail'), async (req, res) => {
    try {
        const { serviceName, ownerID, price, catID } = req.body;

        // Validate required fields
        if (!serviceName || !ownerID || !price || !catID) {
            return res.status(400).json({
                success: false,
                message: 'Service name, owner ID, price, and category are required'
            });
        }

        let imgData = null;
        if (req.file) {
            const filePath = req.file.path;
            imgData = await fs.promises.readFile(filePath);
            await fs.promises.unlink(filePath); // Clean up
        } else {
            // Use default thumbnail
            const defaultThumbPath = path.join('C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads', 'blankthumb.jpg');
            if (fs.existsSync(defaultThumbPath)) {
                imgData = await fs.promises.readFile(defaultThumbPath);
            }
        }

        const [result] = await con.execute(
            'INSERT INTO services (serviceName, ownerID, price, catID, img) VALUES (?, ?, ?, ?, ?)',
            [serviceName, ownerID, price, catID, imgData]
        );

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: { serviceID: result.insertId }
        });

    } catch (err) {
        console.error('Error creating service:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to create service',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// DELETE /api/services/:id - Delete service
app.delete("/api/services/:id", async (req, res) => {
    try {
        const serviceID = req.params.id;
        
        const [result] = await con.execute(
            'DELETE FROM services WHERE serviceID = ?',
            [serviceID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            message: 'Service deleted successfully'
        });

    } catch (err) {
        console.error('Error deleting service:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to delete service',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// ORDERS ENDPOINTS

// POST /api/orders - Create new order
app.post("/api/orders", async (req, res) => {
    try {
        const { custID, lancerID, deadline, details, serviceID, title, custName, lancerName, price, status } = req.body;

        // Validate required fields
        const requiredFields = ['custID', 'lancerID', 'deadline', 'details', 'serviceID', 'title', 'custName', 'lancerName', 'price', 'status'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Insert the order
        const [result] = await con.execute(
            `INSERT INTO orders (custID, lancerID, deadline, details, serviceID, title, custName, lancerName, price, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [custID, lancerID, deadline, details, serviceID, title, custName, lancerName, price, status]
        );

        // Update order with service image
        await con.execute(
            `UPDATE orders o 
             JOIN services s ON o.serviceID = s.serviceID 
             SET o.img = s.img 
             WHERE o.orderID = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: { orderID: result.insertId }
        });

    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// GET /api/orders/:id - Get specific order
app.get("/api/orders/:id", async (req, res) => {
    try {
        const orderID = req.params.id;
        
        const [orders] = await con.execute(
            'SELECT * FROM orders WHERE orderID = ?',
            [orderID]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: orders[0]
        });

    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// GET /api/users/:id/orders - Get orders for freelancer (as lancer)
app.get("/api/users/:id/orders", async (req, res) => {
    try {
        const userID = req.params.id;
        
        const [orders] = await con.execute(
            'SELECT * FROM orders WHERE lancerID = ?',
            [userID]
        );

        res.json({
            success: true,
            data: orders
        });

    } catch (err) {
        console.error('Error fetching user orders:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user orders',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// GET /api/users/:id/requests - Get requests for customer (as customer)
app.get("/api/users/:id/requests", async (req, res) => {
    try {
        const userID = req.params.id;
        
        const [requests] = await con.execute(
            'SELECT * FROM orders WHERE custID = ?',
            [userID]
        );

        res.json({
            success: true,
            data: requests
        });

    } catch (err) {
        console.error('Error fetching user requests:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user requests',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// PUT /api/orders/:id - Update order
app.put("/api/orders/:id", upload.single('proof'), async (req, res) => {
    try {
        const orderID = req.params.id;
        const { status, deadline, details } = req.body;

        // Check if order exists
        const [existingOrders] = await con.execute(
            'SELECT orderID FROM orders WHERE orderID = ?',
            [orderID]
        );

        if (existingOrders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        let updateQuery, updateParams;

        if (req.file) {
            // Update with proof image
            const filePath = req.file.path;
            const imgData = await fs.promises.readFile(filePath);
            await fs.promises.unlink(filePath); // Clean up

            updateQuery = 'UPDATE orders SET status = ?, img = ? WHERE orderID = ?';
            updateParams = [status, imgData, orderID];
        } else if (deadline && details) {
            // Update deadline and details
            updateQuery = 'UPDATE orders SET deadline = ?, details = ? WHERE orderID = ?';
            updateParams = [deadline, details, orderID];
        } else if (status) {
            // Update status only
            updateQuery = 'UPDATE orders SET status = ? WHERE orderID = ?';
            updateParams = [status, orderID];
        } else {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        await con.execute(updateQuery, updateParams);

        res.json({
            success: true,
            message: 'Order updated successfully'
        });

    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update order',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});


// REVIEWS ENDPOINTS

// GET /api/users/:id/reviews - Get reviews for a user
app.get("/api/users/:id/reviews", async (req, res) => {
    try {
        const userID = req.params.id;
        
        const [reviews] = await con.execute(
            'SELECT * FROM userReviews WHERE userID = ?',
            [userID]
        );

        res.json({
            success: true,
            data: reviews
        });

    } catch (err) {
        console.error('Error fetching user reviews:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user reviews',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// POST /api/reviews - Create new review
app.post('/api/reviews', upload.none(), async (req, res) => {
    try {
        const { lancerRating, serviceRating, serviceID, userID, ownerID, reviewText, username, rated, orderID } = req.body;

        // Validate required fields
        if (!lancerRating || !serviceRating || !serviceID || !userID || !ownerID || !reviewText || !username || !orderID) {
            return res.status(400).json({
                success: false,
                message: 'All review fields are required'
            });
        }

        await con.execute('START TRANSACTION');

        try {
            // Insert user review
            await con.execute(
                'INSERT INTO userReviews (reviewText, custID, userID, rating, reviewer) VALUES (?, ?, ?, ?, ?)',
                [reviewText, userID, ownerID, lancerRating, username]
            );

            // Update order as rated
            await con.execute(
                'UPDATE orders SET rated = ? WHERE orderID = ?',
                [rated, orderID]
            );

            // Update reviewer image
            await con.execute(`
                UPDATE userreviews ur 
                JOIN users u ON ur.custID = u.userID 
                SET ur.reviewerImg = u.img 
                WHERE ur.custID = ? AND ur.userID = ?
            `, [userID, ownerID]);

            // Update user rating
            await con.execute(`
                UPDATE users u 
                JOIN (
                    SELECT userID, AVG(rating) AS avg_rating 
                    FROM userreviews 
                    GROUP BY userID
                ) ur ON u.userID = ur.userID 
                SET u.rating = ur.avg_rating
            `);

            // Insert service review
            await con.execute(
                'INSERT INTO orderReviews (serviceID, rating) VALUES (?, ?)',
                [serviceID, serviceRating]
            );

            // Update service rating
            await con.execute(`
                UPDATE services s 
                JOIN (
                    SELECT serviceID, AVG(rating) AS avg_rating 
                    FROM orderreviews 
                    GROUP BY serviceID
                ) ors ON s.serviceID = ors.serviceID 
                SET s.rating = ors.avg_rating
            `);

            await con.execute('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Review submitted successfully'
            });

        } catch (err) {
            await con.execute('ROLLBACK');
            throw err;
        }

    } catch (err) {
        console.error('Error creating review:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to create review',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});
  

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
