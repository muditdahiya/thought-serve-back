//ENVIRONMENT VARIABLES
const dotenv = require("dotenv");
dotenv.config();

//PACKAGES
const cors = require("cors");

//SERVER
const express = require("express");
const app = express();
let port = process.env.PORT || 3001;

//MIDDLEWARE
app.use(express.json());
app.use(cors());

//DATABASE
const { Client } = require("pg");
const res = require("express/lib/response");

const client = new Client({
  user: "postgres",
  host: "35.209.182.114",
  database: "thought_serve",
  password: process.env.PGPASS,
  port: 5432,
});

client.connect();

//REQUESTS
app.get("/", (req, res) => {
  res.send("This is back end of ThoughtServe");
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
        resp.send("Couldnt add post : " + err);
      }
      if (res) {
        resp.send("Added new post");
      }
    }
  );
});

app.get("/allposts", async (req, res) => {
  const allPosts = await client.query("SELECT * FROM posts ORDER BY date desc");
  res.json(allPosts.rows);
});

app.get("/posts/:id", async (req, res) => {
  const id = req.params.id;
  const post = await client.query(`SELECT * FROM posts WHERE id = ${id}`);

  res.json(post.rows);
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

//START SERVER
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
