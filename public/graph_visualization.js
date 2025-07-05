const COLOR = {
    RED_ROAD: "#aa2009",
    GREEN_ROAD: "#83a866",
    BLUE_ROAD: "#1793d1",
    YELLOW_ROAD: "#f7ad4e",
    FREE_ROAD: "#79747e",
    RED_VERTEX: "#700d13",
    GREEN_VERTEX: "#007a3d",
    BLUE_VERTEX: "#014898",
    YELLOW_VERTEX: "#f29610",
    FREE_VERTEX: "#000000",
    RED_HEX: "#cc3333",
    GREEN_HEX: "#a4d280",
    GRAY_HEX: "#a29a85",
    YELLOW_HEX: "#f7c627",
    FREE_HEX: "#1b2e51",
    BG: "#79747e"
};
const SCALE = 90;
const OFFSET = 4;
const PADDING = 1;
const VERTEX_SIZE = 0.375 * SCALE;
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
    const screenX = (this.xpos + PADDING / 2) * SCALE;
    const screenY = (this.ypos + PADDING) * (SCALE/1.75 );

    ctx.fillStyle = this.color;
    ctx.fillRect(
      screenX - VERTEX_SIZE / 2,
      screenY - VERTEX_SIZE / 2,
      VERTEX_SIZE,
      VERTEX_SIZE
    );
  }

  contains(clickX, clickY) {
    const screenX = (this.xpos + PADDING / 2) * SCALE;
    const screenY = (this.ypos + PADDING) * (SCALE / 1.75 );

    const left = screenX - VERTEX_SIZE / 2;
    const top = screenY - VERTEX_SIZE / 2;
    const right = screenX + VERTEX_SIZE / 2;
    const bottom = screenY + VERTEX_SIZE / 2;

    return clickX >= left && clickX <= right && clickY >= top && clickY <= bottom;
  }
}

class Edge {
  constructor(x, y, width, height, angleDeg, color = COLOR.FREE_ROAD, id) {
    this.x = y; // pivot center
    this.y = x;
    this.width = width;   
    this.height = height; 
    this.angle = angleDeg * Math.PI / 180; // to radian
    this.color = color;
    this.id = id;
  }

  draw(ctx) {
    ctx.save();
    // set pivot on rect center
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    // draw rect with center pos
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
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
      localX >= -this.width / 2 &&
      localX <= this.width / 2 &&
      localY >= -this.height / 2 &&
      localY <= this.height / 2
    );
  }

  setColor(color, ctx){
    this.color = color;
    this.draw(ctx);
  }
}

class Hexagon {
  constructor(x, y, size, color, id, margin = 5) {
    this.x = y; // hex center pos
    this.y = x;
    this.size = size; // radius
    this.color = color;
    this.id = id;
    this.margin = margin;
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
    ctx.strokeStyle = this.color;
    ctx.stroke();
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
}

function getPosOfVerticesBelongingToHex(pos) {
  const [x, y] = pos;

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

  // draw edge objects with listener and store it
  edge_objects = [];
  for (const key in edges) {
    const [v1, v2] = JSON.parse(key);
    let edge = edges[key];
    const newEdge = new Edge((SCALE/2+OFFSET*1.5)*edge.centerX+0.625*SCALE, SCALE*edge.centerY+0.5*SCALE, 0.6*SCALE, 0.18*SCALE, edge.angle, edge.color, `${v1}-${v2}`);
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
        edge.setColor(COLOR.RED_ROAD, ctx);
        break;
      }
    }
  });

  // draw hex objects with listener and store it
  hex_objects = [];
  for (const hex of hexes) {
    const [x, y] = hex;
    const center = getPosOfVerticesBelongingToHex([x,y])[0];
    const centerX = center[0];
    const centerY = center[1];
    let new_hex = new Hexagon((SCALE/2+SCALE*0.075)*centerX+SCALE*1.7, SCALE*centerY+0.5*SCALE,SCALE*1.1, COLOR.RED_HEX, `${x}-${y}`, SCALE/5);
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
        break;
      }
    }
  });

  // draw vertex objects with listener and store it
  vertex_objects = [];
  for (const key in vertices) {
    const [x, y] = JSON.parse(key);
    let new_vertex = new Vertex(x,y,COLOR.FREE_VERTEX, `${x}-${y}`);
    vertex_objects.push(new_vertex);
    ctx.fillStyle = "#92B901";
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