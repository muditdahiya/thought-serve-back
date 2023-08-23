//ENVIRONMENT VARIABLES
const dotenv = require("dotenv");
dotenv.config();

//PACKAGES
const cors = require("cors");
var corsOptions = {
  origin: "http://muditdahiya.com",
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
const bcrypt = require("bcrypt");

//SERVER
const express = require("express");
const app = express();
let port = process.env.PORT || 4000;

//MIDDLEWARE
app.use(express.json());
app.use(cors(corsOptions));

//DATABASE
const { Pool } = require("pg");
const res = require("express/lib/response");

const pool = new Pool({
  user: "postgres",
  host: "muditdahiya.com",
  database: "thought_serve",
  password: process.env.PGPASS,
  port: 5432,
});

pool.connect();

//REQUESTS
app.get("/", (req, res) => {
  res.send("This is back end of ThoughtServe with id delete");
});

//POSTS
// create table posts (id serial primary key, author text, title text, content text not null, tags text, date date not null default current_date);

app.post("/newpost", (req, resp) => {
  console.log(req.body);
  pool.query(
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
  console.log(req.query);
  if (!req.query.username) {
    //if no username then get all
    const allPosts = await pool.query("SELECT * FROM posts ORDER BY date desc");
    res.json(allPosts.rows);
  } else {
    //if username then get only for username
    const userPosts = await pool.query(
      `SELECT * FROM posts WHERE author='${req.query.username}' ORDER BY date desc`
    );
    res.json(userPosts.rows);
  }
});

app.get("/posts/:id", async (req, res) => {
  const id = req.params.id;
  const post = await pool.query(`SELECT * FROM posts WHERE id = ${id}`);

  res.json(post.rows);
});

app.get("/posts?username=username", async (req, res) => {
  const id = req.params.id;
  const post = await pool.query(`SELECT * FROM posts WHERE id = ${id}`);

  res.json(post.rows);
});

app.put("/deleteposts", (req, res) => {
  pool.query("DELETE FROM posts");

  res.send("Deleted all posts");
});

app.put("/deletetoppost", (req, res) => {
  pool.query(
    "DELETE FROM posts WHERE id = (SELECT id FROM posts ORDER BY date desc LIMIT 1)"
  );
  res.send("Deleted top post");
});

app.put("/delete/:id", (req, res) => {
  const id = req.params.id;
  pool.query(`DELETE FROM posts WHERE id = ${id}`);
  res.send(`Deleted post id: ${id}`);
});

//USERS
app.get("/allUsers", async (req, res) => {
  const users = await pool.query(`SELECT * FROM users`);
  // console.log(users);
  res.send(users.rows);
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 1);

  //send to users table in database
  try {
    const response = await pool.query(
      `INSERT INTO users (username, password) VALUES ('${username}', '${hash}')`
    );
    res.status(200).json("User made successfully.");
  } catch (err) {
    if (err.code === "23505") {
      res.status(401).json("User already exists.");
    }
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  //get hash for the username
  let hash = "";
  const response = await pool.query(
    `SELECT password FROM users WHERE username='${username}'`
  );
  //if we get no response then username is wrong
  if (response.rowCount === 0) {
    res.status(401).json("Username does not exist.");
    return;
  } else {
    hash = response.rows[0].password;
  }
  //checking the encryption
  const match = await bcrypt.compare(password, hash);
  if (match) {
    res.status(200).json("Login successful!");
  } else {
    res.status(401).json("Wrong password.");
  }
});

//START SERVER
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
