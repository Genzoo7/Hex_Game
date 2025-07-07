const express = require("express");
const cors = require("cors");

const { Game } = require("./game/game");
const app = express();
const PORT = 3001;
const Games = {}; // id: <uuid>, gameClass: Game


app.use(cors({
  origin: `http://localhost:${PORT}`,
}));

app.use(express.static("public"));

app.get('/api/get_new_board', (req, res) => {
  const uuid = "1";
  const game = new Game(uuid);
  Games[uuid] = game;
  res.json(game.getGraph());
});


app.get("/", async (req, res) => {
  res.render("index.html");
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});