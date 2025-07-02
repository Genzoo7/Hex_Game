const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.get("/", async (req, res) => {
  res.render("index.html")
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});