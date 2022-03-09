//ENVIRONMENT VARIABLES
const dotenv = require("dotenv");
dotenv.config();

//PACKAGES
const cors = require("cors");

//SERVER
const express = require("express");
const app = express();
let port = process.env.PORT || 3000;

//MIDDLEWARE
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("This is back end root");
});

//START SERVER
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
  console.log(process.env.DATABASE_URL);
});

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
