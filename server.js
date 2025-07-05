const express = require("express");
const cors = require("cors");

const { generateGraph } = require("./graph/graphGenerator");
const app = express();
const PORT = 3001;

app.use(cors({
  origin: `http://localhost:${PORT}`,
}));

app.use(express.static("public"));

app.get('/api/get_new_board', (req, res) => {
  const graph = generateGraph();
  res.json(graph);
});

app.get("/", async (req, res) => {
  res.render("index.html");
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});