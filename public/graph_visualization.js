// Max hexagons in row and column
const BOARD_WIDTH = 5;
const BOARD_HEIGHT = 5;
// Defining Euclidean space for graph drawing
const MAX_VERTEX_X = BOARD_WIDTH * 2 + 1;
const MAX_VERTEX_Y = MAX_VERTEX_X * 2;

const GAME_HEX_COUNT = 19;



// Initialize full board; BOARD_WIDTH x BOARD_HEIGHT hexagons
function initHexesBoard() {
  const hexes = [];
  for (let i = 0; i < BOARD_WIDTH; i++) {
    for (let j = 0; j < BOARD_HEIGHT; j++) {
      board.push([i, j]);
    }
  }
  return hexes;
}

function getPosOfVerticesBelongingToHex(pos) {
  const [x, y] = pos;

  if (x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return null;

  if (x % 2 === 0) {
    return [
      [3 * x, 2 + 2 * y],
      [1 + 3 * x, 3 + 2 * y],
      [3 + 3 * x, 3 + 2 * y],
      [4 + 3 * x, 2 + 2 * y],
      [3 + 3 * x, 1 + 2 * y],
      [1 + 3 * x, 1 + 2 * y]
    ];
  } else {
    return [
      [3 * x, 1 + 2 * y],
      [1 + 3 * x, 2 + 2 * y],
      [3 * x + 3, 2 + 2 * y],
      [3 * x + 4, 1 + 2 * y],
      [3 * x + 3, 2 * y],
      [1 + 3 * x, 2 * y]
    ];
  }
}

function generateGraph() {
  const edges = {};
  const vertices = {};

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const verts = getPosOfVerticesBelongingToHex([i, j]);
      if (!verts) continue;
      const n = verts.length;

      for (let k = 0; k < n; k++) {
        const v1 = verts[k % n];
        const v2 = verts[(k + 1) % n];

        const key1 = JSON.stringify([v1, v2]);
        const key2 = JSON.stringify([v2, v1]);

        edges[key1] = 1;
        edges[key2] = 1;
        vertices[JSON.stringify(v1)] = 1;
      }
    }
  }

  return { vertices, edges };
}


const SCALE = 90;
const PADDING = 1;
const VERTEX_SIZE = 0.375 * SCALE;
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const { vertices, edges } = generateGraph();
const COLOR = {
    RED: "red",
    GREEN: "green",
    BLUE: "blue",
    YELLOW: "yellow",
    FREE: "black",
};

class Vertex {
  constructor(xpos,ypos,color,id) {
    this.xpos = ypos;
    this.ypos = xpos;
    this.color = color;
    this.id = id;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      (this.xpos + PADDING/2) * SCALE,
      (this.ypos + PADDING) * SCALE/2,
      VERTEX_SIZE,
      VERTEX_SIZE
    );
  }

  contains(clickX, clickY) {
    const left = (this.xpos + PADDING/2) * SCALE;
    const top = (this.ypos + PADDING) * SCALE/2;
    const right = left + VERTEX_SIZE;
    const bottom = top + VERTEX_SIZE;

    return clickX >= left && clickX <= right && clickY >= top && clickY <= bottom;
  }
}

canvas.width = SCALE * 12.5;
canvas.height = SCALE * 9.35;
canvas.style.background = "#3a9ac7";

// Draw all vertices and store them
drawable_vertices = []
for (const key in vertices) {
    const [x, y] = JSON.parse(key);
    console.log(x," ",y);
    let new_vertex = new Vertex(x,y,COLOR.FREE, `${x}-${y}`);
    drawable_vertices.push(new_vertex);
    ctx.fillStyle = "#92B901";
    new_vertex.draw(ctx);

}
// Add click listener for every vertex
canvas.addEventListener("click", function (event) {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  for (const vertex of drawable_vertices) {
    if (vertex.contains(clickX, clickY)) {
      console.log("Vertex clicked ID:", vertex.id);
      break;
    }
  }
});