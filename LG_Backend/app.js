const express = require("express");
const cors = require("cors");
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Error handling middleware
const handleError = (res, error, message = 'Internal server error', statusCode = 500) => {
    console.error('Error:', error);
    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};

// Success response helper
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

// MySQL connection with promise support
const con = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Mharkarlo29.",
    database: process.env.DB_NAME || "lg"
});

con.connect(function(err) {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log("Connected to MySQL!");
});

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads' );
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const upload = multer({ storage: storage });

// User routes - POST /api/users (signup)
app.post("/api/users", upload.single('image'), async (req, res) => {
  const { username, password, firstName, lastName, email } = req.body;
  
  // Input validation
  if (!username || !password || !firstName || !lastName || !email) {
      return res.status(400).json({
          success: false,
          message: 'All fields are required'
      });
  }

  try {
      // Check if the user already exists
      const checkUserSql = `SELECT * FROM users WHERE username = ? OR email = ?`;
      con.query(checkUserSql, [username, email], async (err, results) => {
          if (err) return handleError(res, err, 'Database error');

          if (results.length > 0) {
              return res.status(409).json({
                  success: false,
                  message: 'User already exists'
              });
          }

          // User does not exist, proceed with the insertion
          let imgData;
          if (!req.file) {
              const fallbackImagePath = path.join('C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads', 'blank.webp');
              try {
                  imgData = await fs.promises.readFile(fallbackImagePath);
              } catch (fileErr) {
                  imgData = null; // Handle case where fallback image doesn't exist
              }
          } else {
              const filePath = path.join(__dirname, 'uploads', req.file.filename);
              imgData = await fs.promises.readFile(filePath);
          }

          const sql = `INSERT INTO users(username, pass, firstName, lastName, email, img) VALUES (?, ?, ?, ?, ?, ?)`;
          con.query(sql, [username, password, firstName, lastName, email, imgData], (err, result) => {
              if (err) return handleError(res, err, 'Failed to create user');
              sendSuccess(res, { userId: result.insertId }, 'User created successfully', 201);
          });
      });
  } catch (err) {
      handleError(res, err, 'Failed to process request');
  }
});

// PUT /api/users/:id (update user profile)
app.put("/api/users/:id", upload.single('image'), async (req, res) => {
  const { username, password, firstName, lastName, email } = req.body;
  const userID = req.params.id;

  // Input validation
  if (!username || !password || !firstName || !lastName || !email) {
      return res.status(400).json({
          success: false,
          message: 'All fields are required'
      });
  }

  try {
    // Check if the username or email already exists for a different user
    const checkUserSql = `SELECT * FROM users WHERE (username = ? OR email = ?) AND userID != ?`;
    con.query(checkUserSql, [username, email, userID], async (err, results) => {
      if (err) return handleError(res, err, 'Database error');

      if (results.length > 0) {
        return res.status(409).json({
            success: false,
            message: 'Username or email already in use'
        });
      }

      // Proceed with the update
      if (!req.file) {
        const sql = `UPDATE users SET username = ?, pass = ?, firstName = ?, lastName = ?, email = ? WHERE userID = ?`;
        con.query(sql, [username, password, firstName, lastName, email, userID], (err, result) => {
          if (err) return handleError(res, err, 'Failed to update user');
          sendSuccess(res, null, 'User updated successfully');
        });
      } else {
        const filePath = path.join(__dirname, 'uploads', req.file.filename);
        const data = await fs.promises.readFile(filePath);

        const sql = `UPDATE users SET username = ?, pass = ?, firstName = ?, lastName = ?, email = ?, img = ? WHERE userID = ?`;
        con.query(sql, [username, password, firstName, lastName, email, data, userID], (err, result) => {
          if (err) return handleError(res, err, 'Failed to update user');
          sendSuccess(res, null, 'User updated successfully');
        });
      }
    });
  } catch (err) {
    handleError(res, err, 'Failed to process request');
  }
});


// POST /api/auth/login (user authentication)
app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    
    // Input validation
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    const sql = `SELECT * FROM users WHERE username = ?`;
    con.query(sql, [username], (err, result) => {
        if (err) return handleError(res, err, 'Database error');
        
        if (result.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // In a real application, you should hash passwords and compare hashes
        const user = result[0];
        if (user.pass !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Don't send password in response
        const { pass, ...userWithoutPassword } = user;
        sendSuccess(res, userWithoutPassword, 'Login successful');
    });
});

// GET /api/categories (get all categories)
app.get("/api/categories", (req, res) => {
    const sql = `SELECT * FROM categories`;
    con.query(sql, (err, result) => {
        if (err) return handleError(res, err, 'Failed to fetch categories');
        sendSuccess(res, result, 'Categories retrieved successfully');
    });
});

// GET /api/users (get all users)
app.get("/api/users", (req, res) => {
    const sql = `SELECT userID, username, firstName, lastName, email, rating FROM users`;
    con.query(sql, (err, result) => {
        if (err) return handleError(res, err, 'Failed to fetch users');
        sendSuccess(res, result, 'Users retrieved successfully');
    });
});

// GET /api/services?category=:categoryId (get services by category)
app.get("/api/services", (req, res) => {
    const { category } = req.query;
    
    let sql, params;
    if (!category || category === '0') {
        sql = `SELECT * FROM services`;
        params = [];
    } else {
        sql = `SELECT * FROM services WHERE catID = ?`;
        params = [category];
    }
    
    con.query(sql, params, (err, result) => {
        if (err) return handleError(res, err, 'Failed to fetch services');
        sendSuccess(res, result, 'Services retrieved successfully');
    });
});

// GET /api/users/:id (get user by ID)
app.get("/api/users/:id", (req, res) => {
    const { id } = req.params;
    
    const sql = `SELECT userID, username, firstName, lastName, email, rating, img FROM users WHERE userID = ?`;
    con.query(sql, [id], (err, result) => {
        if (err) return handleError(res, err, 'Failed to fetch user');
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        sendSuccess(res, result[0], 'User retrieved successfully');
    });
});

// GET /api/services/:id (get service details)
app.get("/api/services/:id", (req, res) => {
    const { id } = req.params;
    
    const sql = `SELECT * FROM services WHERE serviceID = ?`;
    con.query(sql, [id], (err, result) => {
        if (err) return handleError(res, err, 'Failed to fetch service');
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        
        sendSuccess(res, result[0], 'Service retrieved successfully');
    });
});

// POST /api/orders (create new order)
app.post("/api/orders", async (req, res) => {
    const { custID, lancerID, deadline, details, serviceID, title, custName, lancerName, price, status } = req.body;

    // Input validation
    if (!custID || !lancerID || !deadline || !details || !serviceID || !title || !custName || !lancerName || !price) {
        return res.status(400).json({
            success: false,
            message: 'All required fields must be provided'
        });
    }

    try {
        // Insert the order into the orders table
        const insertResult = await con.promise().query(
            `INSERT INTO orders (custID, lancerID, deadline, details, serviceID, title, custName, lancerName, price, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [custID, lancerID, deadline, details, serviceID, title, custName, lancerName, price, status || 'pending']
        );

        const orderID = insertResult[0].insertId;

        // Update the orders table with the corresponding img from the services table
        await con.promise().query(
            `UPDATE orders o
             JOIN services s ON o.serviceID = s.serviceID
             SET o.img = s.img
             WHERE o.orderID = ?`, 
            [orderID]
        );

        sendSuccess(res, { orderID }, 'Order created successfully', 201);

    } catch (err) {
        handleError(res, err, 'Failed to create order');
    }
});

// GET /api/users/:id/services (get user's services)
app.get("/api/users/:id/services", (req, res) => {
    const { id } = req.params;
    
    const sql = `SELECT * FROM services WHERE ownerID = ?`;
    con.query(sql, [id], (err, result) => {
        if (err) return handleError(res, err, 'Failed to fetch user services');
        sendSuccess(res, result, 'User services retrieved successfully');
    });
});

// GET /api/users/:id/reviews (get user's reviews)
app.get("/api/users/:id/reviews", (req, res) => {
    const { id } = req.params;
    
    const sql = `SELECT * FROM userReviews WHERE userID = ?`;
    con.query(sql, [id], (err, result) => {
        if (err) return handleError(res, err, 'Failed to fetch user reviews');
        sendSuccess(res, result, 'User reviews retrieved successfully');
    });
});

// GET /api/users/:id/orders (get user's orders as freelancer)
app.get("/api/users/:id/orders", (req, res) => {
    const { id } = req.params;
    
    const sql = `SELECT * FROM orders WHERE lancerID = ?`;
    con.query(sql, [id], (err, result) => {
        if (err) return handleError(res, err, 'Failed to fetch user orders');
        sendSuccess(res, result, 'User orders retrieved successfully');
    });
});

// GET /api/users/:id/requests (get user's requests as customer)
app.get("/api/users/:id/requests", (req, res) => {
    const { id } = req.params;
    
    const sql = `SELECT * FROM orders WHERE custID = ?`;
    con.query(sql, [id], (err, result) => {
        if (err) return handleError(res, err, 'Failed to fetch user requests');
        sendSuccess(res, result, 'User requests retrieved successfully');
    });
});

// GET /api/orders/:id (get order details)
app.get("/api/orders/:id", (req, res) => {
    const { id } = req.params;
    
    const sql = `SELECT * FROM orders WHERE orderID = ?`;
    con.query(sql, [id], (err, result) => {
        if (err) return handleError(res, err, 'Failed to fetch order');
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        sendSuccess(res, result[0], 'Order retrieved successfully');
    });
});


// POST /api/services (create new service)
app.post('/api/services', upload.single('thumbnail'), async (req, res) => {
    const { serviceName, ownerID, price, catID } = req.body;

    // Input validation
    if (!serviceName || !ownerID || !price || !catID) {
        return res.status(400).json({
            success: false,
            message: 'All required fields must be provided'
        });
    }

    try {
        let imgData = null;
        
        if (!req.file) {
            // Try to load default thumbnail
            try {
                const defaultPath = path.join('C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads', 'blankthumb.jpg');
                imgData = await fs.promises.readFile(defaultPath);
            } catch (fileErr) {
                console.warn('Default thumbnail not found, proceeding without image');
            }
        } else {
            const filePath = path.join(__dirname, 'uploads', req.file.filename);
            imgData = await fs.promises.readFile(filePath);
        }

        const sql = 'INSERT INTO services (serviceName, ownerID, price, catID, img) VALUES (?, ?, ?, ?, ?)';
        con.query(sql, [serviceName, ownerID, price, catID, imgData], (err, result) => {
            if (err) return handleError(res, err, 'Failed to create service');
            sendSuccess(res, { serviceID: result.insertId }, 'Service created successfully', 201);
        });
    } catch (err) {
        handleError(res, err, 'Failed to process request');
    }
});

// PUT /api/orders/:id/complete (complete order)
app.put('/api/orders/:id/complete', upload.single('proof'), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            success: false,
            message: 'Status is required'
        });
    }

    try {
        if (!req.file) {
            const sql = `UPDATE orders SET status = ? WHERE orderID = ?`;
            con.query(sql, [status, id], (err, result) => {
                if (err) return handleError(res, err, 'Failed to update order');
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Order not found'
                    });
                }
                
                sendSuccess(res, null, 'Order updated successfully');
            });
        } else {
            const filePath = path.join(__dirname, 'uploads', req.file.filename);
            const data = await fs.promises.readFile(filePath);
            
            const sql = `UPDATE orders SET status = ?, img = ? WHERE orderID = ?`;
            con.query(sql, [status, data, id], (err, result) => {
                if (err) return handleError(res, err, 'Failed to update order');
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Order not found'
                    });
                }
                
                sendSuccess(res, null, 'Order completed successfully');
            });
        }
    } catch (err) {
        handleError(res, err, 'Failed to process request');
    }
});

// POST /api/reviews (create review)
app.post('/api/reviews', upload.none(), async (req, res) => {
    const { lancerRating, serviceRating, serviceID, userID, ownerID, reviewText, username, orderID } = req.body;

    // Input validation
    if (!lancerRating || !serviceRating || !serviceID || !userID || !ownerID || !reviewText || !username || !orderID) {
        return res.status(400).json({
            success: false,
            message: 'All required fields must be provided'
        });
    }

    try {
        // Insert user review
        await con.promise().query(
            'INSERT INTO userReviews (reviewText, custID, userID, rating, reviewer) VALUES (?, ?, ?, ?, ?)',
            [reviewText, userID, ownerID, lancerRating, username]
        );

        // Mark order as rated
        await con.promise().query(
            'UPDATE orders SET rated = ? WHERE orderID = ?',
            [1, orderID]
        );

        // Update reviewer image
        await con.promise().query(
            `UPDATE userreviews AS o 
             JOIN ( SELECT userID, img FROM users ) AS u ON o.custID = u.userID 
             JOIN ( SELECT MAX(custID) AS last_id FROM userreviews) AS last_row ON o.custID = last_row.last_id 
             SET o.reviewerImg = u.img`
        );

        // Update user rating
        await con.promise().query(
            `UPDATE users u 
             JOIN ( SELECT userID, AVG(rating) AS avg_rating FROM userreviews GROUP BY userID ) ur ON u.userID = ur.userID 
             SET u.rating = ur.avg_rating`
        );
        
        // Insert service review
        await con.promise().query(
            'INSERT INTO orderReviews (serviceID, rating) VALUES (?, ?)',
            [serviceID, serviceRating]
        );

        // Update service rating
        await con.promise().query(
            `UPDATE services o 
             JOIN ( SELECT serviceID, AVG(rating) AS avg_rating FROM orderreviews GROUP BY serviceID ) ors ON o.serviceID = ors.serviceID 
             SET o.rating = ors.avg_rating`
        );

        sendSuccess(res, null, 'Review submitted successfully', 201);

    } catch (err) {
        handleError(res, err, 'Failed to submit review');
    }
});

// PUT /api/orders/:id (update order)
app.put('/api/orders/:id', upload.none(), async (req, res) => {
    const { id } = req.params;
    const { deadline, details } = req.body;

    // Input validation
    if (!deadline || !details) {
        return res.status(400).json({
            success: false,
            message: 'Deadline and details are required'
        });
    }

    try {
        const sql = `UPDATE orders SET deadline = ?, details = ? WHERE orderID = ?`;
        con.query(sql, [deadline, details, id], (err, result) => {
            if (err) return handleError(res, err, 'Failed to update order');
            
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }
            
            sendSuccess(res, null, 'Order updated successfully');
        });
    } catch (err) {
        handleError(res, err, 'Failed to process request');
    }
});

// DELETE /api/services/:id (delete service)
app.delete("/api/services/:id", (req, res) => {
    const { id } = req.params;
    
    const sql = `DELETE FROM services WHERE serviceID = ?`;
    con.query(sql, [id], (err, result) => {
        if (err) return handleError(res, err, 'Failed to delete service');
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        
        sendSuccess(res, null, 'Service deleted successfully');
    });
});
// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

// 404 handler for undefined routes
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Health check available at: http://localhost:${port}/api/health`);
});
