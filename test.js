const express = require("express");
const app = express();
let port = process.env.PORT || 3000;

//MIDDLEWARE
const cors = require("cors");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("This is back end root");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
  console.log(process.env.DATABASE_URL);
});
