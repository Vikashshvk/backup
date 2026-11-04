const { faker } = require('@faker-js/faker'); 
const mysql = require('mysql2'); 
const express = require('express'); 
const methodOverride = require("method-override");
const path = require("path");

const app = express();

// Middleware Setup
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// 1. Initial MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Vikash@259'
});

// Fake data generator function
let getrandomUser = () => {
  return [ 
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

// 2. DB, Table aur Fake Data Setup (Auto Initialization)
connection.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected...");

  connection.query("CREATE DATABASE IF NOT EXISTS delta_app", (err) => {
    if (err) throw err;

    connection.query("USE delta_app", (err) => {
      if (err) throw err;

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS user (
          id VARCHAR(50) PRIMARY KEY,
          username VARCHAR(50) NOT NULL,
          email VARCHAR(100) NOT NULL,
          password VARCHAR(50) NOT NULL
        )
      `;
      
      connection.query(createTableQuery, (err) => {
        if (err) throw err;

        connection.query("SELECT COUNT(*) AS count FROM user", (err, result) => {
          if (err) throw err;

          // Agar table khali hai tabhi fake data bharega
          if (result[0].count === 0) {
            let data = [];
            for (let i = 0; i < 10; i++) {
              data.push(getrandomUser());
            }
            const insertQuery = "INSERT INTO user (id, username, email, password) VALUES ?";
            connection.query(insertQuery, [data], (err) => {
              if (err) throw err;
              console.log("10 Fake users initialized in database.");
            });
          }
        });
      });
    });
  });
});

// 3. Routes

// Home Route
app.get("/", (req, res) => {
  let q = `SELECT COUNT(*) AS count FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0].count;
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err); 
    res.send("some error");
  }
});

// Show Users Route (WITH FILTER FEATURE)
app.get("/user", (req, res) => {
  let { username } = req.query; // Chrome ke search box se aayega
  let q = `SELECT * FROM user`;

  // Agar query parameter mein username hai, toh filter lagao
  if (username) {
    q = `SELECT * FROM user WHERE username LIKE '%${username}%'`;
  }

  try {
    connection.query(q, (err, result) => {
      if (err) throw err; 
      // searchedUsername ko bhej rahe hain taaki input box mein text ruka rahe
      res.render("showusers.ejs", { result, searchedUsername: username || "" });
    });
  } catch (err) {
    console.log(err);
    res.send("some error");
  }
});

// Edit Route
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err; 
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("some error");
  }
});

// Update Route
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formpass, username: newUsername } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;
    
  try {
    connection.query(q, (err, result) => {
      if (err) throw err; 
      let user = result[0];
      if (formpass != user.password) { 
        res.send("wrong password");
      } else {
        let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err; 
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("some error");
  }
});

// Server Start
app.listen("8080", () => {
  console.log("server is running on port 8080");
});