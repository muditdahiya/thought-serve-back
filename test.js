const express = require("express");
const app = express();
let port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("This is back end root");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
  console.log(process.env.DATABASE_URL);
});
