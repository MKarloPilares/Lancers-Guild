const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const port = 8000;

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// MySQL connection
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Mharkarlo29.",
    database: "lg"
});

con.connect(function(err) {
    if (err) throw err;
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

app.post("/signUp", upload.single('image'), async (req, res) => {
  const { username, password, firstName, lastName, email } = req.body;
  try {
      // Check if the user already exists
      const checkUserSql = `SELECT * FROM users WHERE username = ? OR email = ?;`;
      con.query(checkUserSql, [username, email], async (err, results) => {
          if (err) throw err;

          if (results.length > 0) {
              // User already exists
              res.status(409).json({ message: 'User already exists' });
          } else {
              // User does not exist, proceed with the insertion
              let imgData;
              if (!req.file) {
                  console.error("No file received");
                  const fallbackImagePath = path.join('C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads', 'blank.webp');
                  imgData = await fs.promises.readFile(fallbackImagePath);
              } else {
                  const filePath = path.join(__dirname, 'uploads', req.file.filename);
                  imgData = await fs.promises.readFile(filePath);
              }

              const sql = `INSERT INTO users(username, pass, firstName, lastName, email, img) VALUES (?, ?, ?, ?, ?, ?);`
              con.query(sql, [username, password, firstName, lastName, email, imgData], (err, result) => {
                  if (err) throw err;
                  res.json({ message: result });
              });
          }
      });
  } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Failed to process request', error: err });
  }
});

app.post("/EditProf", upload.single('image'), async (req, res) => {
  const { username, password, firstName, lastName, email, userID } = req.body;

  try {
    // Check if the username or email already exists for a different user
    const checkUserSql = `SELECT * FROM users WHERE (username = ? OR email = ?) AND userID != ?;`;
    con.query(checkUserSql, [username, email, userID], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ message: 'Database error', error: err });
        return;
      }

      if (results.length > 0) {
        // User with the same username or email already exists
        res.status(409).json({ message: 'Username or email already in use' });
      } else {
        // Proceed with the update
        if (!req.file) {
          console.error("No file received");
          const sql = `UPDATE users SET username = ?, pass = ?, firstName = ?, lastName = ?, email = ? WHERE userID = ?;`;
          con.query(sql, [username, password, firstName, lastName, email, userID], (err, result) => {
            if (err) {
              console.error('Database error:', err);
              res.status(500).json({ message: 'Database error', error: err });
              return;
            }
            res.json({ message: result });
          });
        } else {
          const filePath = path.join(__dirname, 'uploads', req.file.filename);
          const data = await fs.promises.readFile(filePath);

          const sql = `UPDATE users SET username = ?, pass = ?, firstName = ?, lastName = ?, email = ?, img = ? WHERE userID = ?;`;
          con.query(sql, [username, password, firstName, lastName, email, data, userID], (err, result) => {
            if (err) {
              console.error('Database error:', err);
              res.status(500).json({ message: 'Database error', error: err });
              return;
            }
            res.json({ message: result });
          });
        }
      }
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Failed to process request', error: err });
  }
});


app.post("/login", (req, res) => {
    const { username } = req.body;
    con.query(`SELECT * FROM users where username = '${username}';`, (err,result) => {
        if (err) throw err;
        res.json({message: result});
    });
});

app.get("/getCategories", (req, res) => {
    con.query(`SELECT * FROM categories;`, (err,result) => {
        if (err) throw err;
        res.json({message: result});
    });
});

app.get("/getUsers", (req, res) => {
  con.query(`SELECT * FROM users;`, (err,result) => {
      if (err) throw err;
      res.json({message: result});
  });
});

app.post("/getServices", (req, res) => {
  const { category } = req.body;
  if (category === '0') {
    con.query(`SELECT * FROM services;`, (err,result) => {
      if (err) throw err;
      res.json({message: result});
  });} else {
  con.query(`SELECT * FROM services where catID = '${category}';`, (err,result) => {
      if (err) throw err;
      res.json({message: result});
  });}
});

app.post("/serviceOwner", (req, res) => {
    const { userID } = req.body;
    console.log(userID)
    con.query(`SELECT * FROM users where userID = '${userID}';`, (err,result) => {
        if (err) throw err;
        console.log(result)
        res.json({message: result});
    });
});

app.post("/getServiceDetails", (req, res) => {
    const { serveID } = req.body;
    con.query(`SELECT * FROM services where serviceID = '${serveID}';`, (err,result) => {
        if (err) throw err;
        res.json({message: result});
    });
});

app.post("/confirmOrder", async (req, res) => {
  const { custID, lancerID, deadline, details, serviceID, title, custName, lancerName, price, status } = req.body;

  try {
      // Insert the order into the orders table
      await con.promise().query(
          `INSERT INTO orders (custID, lancerID, deadline, details, serviceID, title, custName, lancerName, price, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          [custID, lancerID, deadline, details, serviceID, title, custName, lancerName, price, status]
      );

      // Find the maximum serviceID in the orders table
      const [rows] = await con.promise().query(
          `SELECT MAX(serviceID) AS max_serviceID FROM orders`
      );
      const maxServiceID = rows[0].max_serviceID;

      // Update the orders table with the corresponding img from the services table
      await con.promise().query(
          `UPDATE orders
           JOIN services ON orders.serviceID = services.serviceID
           SET orders.img = services.img
           WHERE orders.serviceID = ?`, 
          [maxServiceID]
      );

      res.status(200).json({ message: 'Order confirmed and image updated successfully' });

  } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Failed to process request', error: err });
  }
});

app.post("/getUserServices", (req, res) => {
    const { userID } = req.body;
    con.query(`SELECT * FROM services where ownerID = '${userID}';`, (err,result) => {   
        if (err) throw err;
        res.json({message: result});
    });
});

app.post("/getUserReviews", (req, res) => {
    const { userID } = req.body;
    con.query(`SELECT * FROM userReviews where userID = '${userID}';`, (err,result) => {
        if (err) throw err;
        res.json({message: result});
    });
});

app.post("/getUserOrders", (req, res) => {
    const { userID } = req.body;
    con.query(`SELECT * FROM orders where lancerID = '${userID}';`, (err,result) => {
        if (err) throw err;
        res.json({message: result});
    });
});

app.post("/getUserRequests", (req, res) => {
    const { userID } = req.body;
    con.query(`SELECT * FROM orders where custID = '${userID}';`, (err,result) => {
        if (err) throw err;
        res.json({message: result});
    });
}); 

app.post("/getOrderDetails", (req, res) => {
    const { orderID } = req.body;
    con.query(`SELECT * FROM orders where orderID = '${orderID}';`, (err,result) => {
        if (err) throw err;
        res.json({message: result});
    });
});


app.post('/newService', upload.single('thumbnail'), async (req, res) => {
    const { serviceName, ownerID, price, catID } = req.body;
  
    try {
      if (!req.file) {
        console.error("No file received");
        const sql = 'INSERT INTO services (serviceName, ownerID, price, catID, thumbnail) VALUES (?, ?, ?, ?, load_file("C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\blankthumb.jpg") )';
        con.query(sql, [serviceName, ownerID, price, catID], (err,result) => {
            if (err) throw err;
            res.json({message: result});
        });
      } else {
        const filePath = path.join(__dirname, 'Uploads', req.file.filename);
  
        const data = await fs.promises.readFile(filePath);
        const sql = 'INSERT INTO services (serviceName, ownerID, price, catID, img) VALUES (?, ?, ?, ?, ?)';
        con.query(sql, [serviceName, ownerID, price, catID, data], (err,result) => {
            if (err) throw err;
            res.json({message: result});
        });
      }
    } catch (err) {
      console.error('Error:', err);                                                                                                                         
      res.status(500).json({ message: 'Failed to process request', error: err });
    }
});

app.post('/completeOrder', upload.single('proof'), async (req, res) => {
    const { status, orderID } = req.body;
  
    try {
      if (!req.file) {
        console.error("No file received");
        con.query(`UPDATE orders SET status = ? WHERE orderID = ?`, [status, orderID], (err, result) => {
          if (err) throw err;
          res.json({ message: result });
        });
      } else {
        const filePath = path.join(__dirname, 'uploads', req.file.filename);
  
        const data = await fs.promises.readFile(filePath);
        con.query(`UPDATE orders SET status = ?, img = ? WHERE orderID = ?`, [status, data, orderID], (err, result) => {
          if (err) throw err;
          res.json({ message: result });
        });
      }
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Failed to process request', error: err });
    }
  });

  app.post('/reviewRequest',upload.none(), async (req, res) => {
    const { lancerRating, serviceRating, serviceID, userID, ownerID, reviewText, username, rated, orderID } = req.body;

    try {
        const sql = 'INSERT INTO userReviews (reviewText, custID, userID, rating, reviewer) VALUES (?, ?, ?, ?, ?)';
        con.promise().query(sql, [reviewText, userID, ownerID, lancerRating, username]);

        const sql6 = 'UPDATE orders SET rated = ? where orderID = ? ';
        con.promise().query(sql6, [rated, orderID]);

        const sql2 = 'UPDATE userreviews AS o JOIN ( SELECT userID, img FROM users ) AS u ON o.custID = u.userID JOIN ( SELECT MAX(custID) AS last_id FROM userreviews) AS last_row ON o.custID = last_row.last_id SET o.reviewerImg = u.img;';
        con.promise().query(sql2);

        const sql3 = 'UPDATE users u JOIN ( SELECT userID, AVG(rating) AS avg_rating FROM userreviews GROUP BY userID ) ur ON u.userID = ur.userID SET u.rating = ur.avg_rating;';
        con.promise().query(sql3);
        
        const sql4 = 'INSERT INTO orderReviews (serviceID, rating) VALUES (?, ?)';
        con.promise().query(sql4, [serviceID, serviceRating]);

        const sql5 = 'UPDATE services o JOIN ( SELECT serviceID, AVG(rating) AS avg_rating FROM orderreviews GROUP BY serviceID ) ors ON o.serviceID = ors.serviceID SET o.rating = ors.avg_rating;';
        con.promise().query(sql5, (err,result) => {
          if (err) throw err;
          res.json({ message: result }); })

    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Failed to process request', error: err });
    }
  });

    app.post('/editOrder',upload.none(), async (req, res) => {
    const { deadline, details, orderID} = req.body;

    try {
        const sql = `UPDATE orders SET deadline = ?, details = ? where orderID = ${orderID}`;
        con.query(sql, [deadline, details] , (err,result) => {
          if (err) throw err;
          res.json({ message: result }); })

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Failed to process request', error: err });
      }
    });

    app.post("/DeleteService", (req, res) => {
      const { serviceID } = req.body;
      con.query(`DELETE FROM services where serviceID = ${serviceID}`, (err,result) => {
          if (err) throw err;
          res.json({message: result});
      });
  });
  

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
