//ENVIRONMENT VARIABLES
const dotenv = require("dotenv");
dotenv.config();

//PACKAGES
const cors = require("cors");

//SERVER
const express = require("express");
const app = express();

app.listen(process.env.PORT, () => {
  var today = new Date();
  var time =
    (today.getHours() % 12) +
    ":" +
    today.getMinutes() +
    ":" +
    today.getSeconds();
  console.log(`Sever restart at ${time}`);
  console.log(process.env.PORT);
});

//MIDDLEWARE
app.use(express.json());
app.use(cors());

//DATABASE
const { Client } = require("pg");
const res = require("express/lib/response");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
client.connect();

//BACKEND LOGIC

app.get("/", (req, res) => {
  res.send("This is back end root");
});

//USERS
app.get("/allusers", async (req, res) => {
  const allUsers = await client.query("SELECT * FROM users");
  res.json(allUsers.rows);
});

app.post("/newuser", (req, resp) => {
  console.log(req.body);
  client.query(
    `INSERT INTO users (email, name, hash) VALUES ('${req.body.email}', '${req.body.name}', '${req.body.hash}')`,
    (err, res) => {
      if (err) {
        console.log("pg returned an error");
        resp.send("Couldnt add user");
      }
      if (res) {
        resp.send("Added new user");
      }
    }
  );
});

app.put("/deleteusers", (req, res) => {
  client.query("DELETE FROM users");
  res.send("Deleted all users");
});

app.put("/signin", async (req, resp) => {
  try {
    const ans = await client.query(
      `SELECT hash FROM users WHERE email = '${req.body.email}'`
    );

    if (req.body.hash == ans.rows[0].hash) {
      resp.send("Successful login");
    } else {
      resp.send("Check password");
    }
  } catch (err) {
    resp.send("No such user found");
  }
});

//POSTS
app.post("/newpost", (req, resp) => {
  console.log(req.body);
  client.query(
    `INSERT INTO posts (author, title, content, tags) VALUES ('${req.body.author}', '${req.body.title}', '${req.body.content}', '${req.body.tags}')`,
    (err, res) => {
      if (err) {
        console.log("pg returned an error");
        console.log(err);
        resp.send("Couldnt add post");
      }
      if (res) {
        resp.send("Added new post");
      }
    }
  );
});

app.get("/allposts", async (req, res) => {
  const allUsers = await client.query("SELECT * FROM posts ORDER BY date desc");
  res.json(allUsers.rows);
});

app.put("/deleteposts", (req, res) => {
  client.query("DELETE FROM posts");
  res.send("Deleted all posts");
});

app.put("/deletetoppost", (req, res) => {
  client.query(
    "DELETE FROM posts WHERE id = (SELECT id FROM posts ORDER BY date desc LIMIT 1)"
  );
  res.send("Deleted top post");
});
