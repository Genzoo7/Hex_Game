const COLOR = {
    ROAD: {
      FREE: "transparent",
      RED: "#aa2009",
      GREEN: "#83a866",
      BLUE: "#1793d1",
      YELLOW: "#f7ad4e",
    },
    VERTEX: {
      RED: "#700d13",
      GREEN: "#007a3d",
      BLUE: "#014898",
      YELLOW: "#f29610",
      FREE: "#727272",
    },
    RESOURCE: {
      BRICK: "#cc3333",
      WOOD: "#10aa49",
      WHEAT: "#f7c627",
      SHEEP: "#bbf3a5",
      STONE: "#5d5d5d",
      FREE: "#1b2e51",
    },
    BG: "black",
};

const SCALE = 80;
const FONT_SIZE = 0.34 * SCALE;
const VERTEX_SIZE = 0.3 * SCALE;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

canvas.width = SCALE * 12.5;
canvas.height = SCALE * 10.2;
canvas.style.background = COLOR.BG;

class Vertex {
  constructor(xpos, ypos, color, id) {
    this.xpos = ypos;
    this.ypos = xpos;
    this.color = color;
    this.id = id;
  }

  draw(ctx) {
    const screenX = (this.xpos + 0.5) * SCALE;
    const screenY = (this.ypos + 1) * (SCALE/1.75 );

    ctx.fillStyle = this.color;
    ctx.fillRect(
      screenX - VERTEX_SIZE / 2,
      screenY - VERTEX_SIZE / 2,
      VERTEX_SIZE,
      VERTEX_SIZE
    );
  }

  contains(clickX, clickY) {
    const screenX = (this.xpos + 0.5) * SCALE;
    const screenY = (this.ypos + 1) * (SCALE / 1.75 );

    const left = screenX - VERTEX_SIZE / 2;
    const top = screenY - VERTEX_SIZE / 2;
    const right = screenX + VERTEX_SIZE / 2;
    const bottom = screenY + VERTEX_SIZE / 2;

    return clickX >= left && clickX <= right && clickY >= top && clickY <= bottom;
  }
}

class Edge {
  constructor(x, y, width, height, angleDeg, color, id) {
    this.x = SCALE*(y+0.5); // pivot center
    this.y = (SCALE*0.572)*(x+1);
    this.width = width;   
    this.height = height; 
    this.angle = angleDeg * Math.PI / 180; // to radian
    this.color = color;
    this.id = id;
  }

  draw(ctx) {
    ctx.save();

    // pivot on center
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    /*
    if (this.color !== COLOR.FREE_ROAD){
      ctx.strokeStyle = COLOR.FREE_VERTEX;   
      ctx.lineWidth = 2;           
      ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }*/

    ctx.restore();
  }

  contains(clickX, clickY) {
    const dx = clickX - this.x;
    const dy = clickY - this.y;

    const cos = Math.cos(-this.angle);
    const sin = Math.sin(-this.angle);

    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    return (
      localX >= -this.width / 3 &&
      localX <= this.width / 3 &&
      localY >= -this.height / 1.5 &&
      localY <= this.height / 1.5
    );
  }

  setColor(color){
    this.color = color;
  }
}

class Hexagon {
  constructor(x, y, size, color, number, id, robber = false, margin = 5) {
    this.x = SCALE * (y + 0.5); // hex center pos
    this.y = SCALE * (0.575 * x + 0.55);
    this.size = size; // radius
    this.color = color;
    this.id = id;
    this.margin = margin;
    this.number = number;
    this.robber = robber;
  }

  getPoints(size = this.size) {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i - Math.PI / 6; // -30° 
      const px = this.x + size * Math.cos(angle);
      const py = this.y + size * Math.sin(angle);
      points.push({ x: px, y: py });
    }
    return points;
  }

  draw(ctx) {
    const points = this.getPoints();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    //ctx.strokeStyle = "gray";
    //ctx.lineWidth = 3;
    //ctx.stroke();
    const fontStr = FONT_SIZE.toString() + "px Arial";
    if (this.number !== undefined) {
      ctx.fillStyle = "#000";
      ctx.font = fontStr;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.number.toString(), this.x, this.y);
    }

    if (this.robber) {
      ctx.beginPath();
      ctx.arc(this.x-30, this.y+45, this.size * 0.2, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();
    }
  }

  contains(clickX, clickY) {
    const marginSize = this.size - this.margin;
    const points = this.getPoints(marginSize);

    // ray-casting algorithm (punkt w wielokącie)
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x, yi = points[i].y;
      const xj = points[j].x, yj = points[j].y;

      const intersect = ((yi > clickY) !== (yj > clickY)) &&
                        (clickX < (xj - xi) * (clickY - yi) / (yj - yi + 0.00001) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }


  setRobber() {
    this.robber = true;
  }

  removeRobber() {
    this.robber = false;
  }

  toggleRobber() {
    this.robber = !this.robber;
  }
}

function getCenterPosOfHex(pos) {
  const [x, y] = pos;
  if (x % 2 === 0) { return [3 * x + 2, 2 + 2 * y]; } 
  else { return [3 * x + 2, 1 + 2 * y]; }
}

// fetch new board from backend
fetch("http://localhost:3001/api/get_new_board")
  .then((res) => res.json())
  .then((graph) => {
    console.log("Graph loaded", graph);
    drawBoard(graph);
  })
  .catch(err => console.error("Fetch error:", err));

// draw board with fetched graph
function drawBoard(graph) {
  const { vertices, edges, hexes } = graph;

  // draw hex objects with listener and store it
  hex_objects = [];
  const hexes_keys = Object.keys(hexes);
  for (const hex of hexes_keys) {
    const pos = hex.split(",");
    x = pos[0];
    y = pos[1];
    const center = getCenterPosOfHex([x,y]);
    const centerX = center[0];
    const centerY = center[1];
    const {resource, diceNumber, robber, belongingVertices} = hexes[pos];
    const color = COLOR.RESOURCE[resource];
    let new_hex = new Hexagon(centerX, centerY, SCALE*1.1, color, diceNumber, `${y}-${x}`, robber, SCALE/5);
    hex_objects.push(new_hex);
    new_hex.draw(ctx);
  }

  canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    for (const hex of hex_objects) {
      if (hex.contains(clickX, clickY)) {
        console.log("Hex clicked ID:", hex.id);
        hex.toggleRobber();
        updateBoard();
        break;
      }
    }
  });

  // draw edge objects with listener and store it
  edge_objects = [];
  for (const key in edges) {
    const [v1, v2] = JSON.parse(key);
    //const v1pos = v1.split(",");
    let edge = edges[key];
    const {centerX, centerY, angle, type} = edge;
    const newEdge = new Edge(centerX, centerY, 0.9*SCALE, 0.18*SCALE, angle, COLOR.ROAD[type], `${v1[1]},${v1[0]}-${v2[1]},${v2[0]}`);
    edge_objects.push(newEdge);
    newEdge.draw(ctx);
  }

  canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    for (const edge of edge_objects) {
      if (edge.contains(clickX, clickY)) {
        console.log("Edge clicked ID:", edge.id);
        edge.setColor(COLOR.ROAD.RED);
        updateBoard();
        break;
      }
    }
  });

  // draw vertex objects with listener and store it
  vertex_objects = [];
  for (const key in vertices) {
    const [x, y] = JSON.parse(key);
    let vertex = vertices[key];
    const {type, isSettlement, isCity} = vertex;
    let new_vertex = new Vertex(x,y,COLOR.VERTEX[type], `${y}-${x}`);
    vertex_objects.push(new_vertex);
    //ctx.fillStyle = COLOR.VERTEX.FREE;
    new_vertex.draw(ctx);
  }

  canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    for (const vertex of vertex_objects) {
      if (vertex.contains(clickX, clickY)) {
        console.log("Vertex clicked ID:", vertex.id);
        break;
      }
    }
  });
}

function updateBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let hex of hex_objects) { hex.draw(ctx); }
  for (let edge of edge_objects){ edge.draw(ctx); }
  for (let vertex of vertex_objects){ vertex.draw(ctx); }
}