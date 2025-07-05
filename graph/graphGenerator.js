// Max hexagons in row and column
const BOARD_WIDTH = 5;
const BOARD_HEIGHT = 5;

const GAME_HEX_COUNT = 19;
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
    //BG: "#73bee3",
    BG: "#79747e"
};

function removeRandomElements(hexes, removal, count) {
  const removable = hexes.filter(h =>
    removal.some(r => r[0] === h[0] && r[1] === h[1])
  );

  // Fisher–Yates algorithm
  for (let i = removable.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [removable[i], removable[j]] = [removable[j], removable[i]];
  }

  const toRemove = removable.slice(0, count);
  return hexes.filter(h =>
    !toRemove.some(r => r[0] === h[0] && r[1] === h[1])
  );
}

// Initialize full board; BOARD_WIDTH x BOARD_HEIGHT hexagons
function initHexesBoard() {
  let removal = [
    [0,0], [0,1], [0,2], [0,3], [0,4], 
    [4,0], [4,1], [4,2], [4,3], [4,4],
    [1,0], [2,0], [3,0], [4,0],
    [0,4], [2,4],
  ]

  const hexes = [];
  for (let i = 0; i < BOARD_WIDTH; i++) {
    for (let j = 0; j < BOARD_HEIGHT; j++) {
      hexes.push([i, j]);
    }
  }

  const finalHexes = removeRandomElements(hexes, removal, 25-GAME_HEX_COUNT);

  return finalHexes;
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
  const hexes = initHexesBoard();
  for (const hex of hexes) {
    i = hex[0];
    j = hex[1];
      const verts = getPosOfVerticesBelongingToHex([i, j]);
      if (!verts) continue;
      const n = verts.length;

      for (let k = 0; k < n; k++) {
        const v1 = verts[k % n];
        const v2 = verts[(k + 1) % n];

        const key1 = JSON.stringify([v1, v2]);
        //const key2 = JSON.stringify([v2, v1]);

        edges[key1] = {
          centerX: (v1[0]+v2[0])/2,
          centerY: (v1[1]+v2[1])/2,
          angle: (k*60+30)%360,
          color: COLOR.FREE_ROAD,
        };
        //edges[key2] = 1;
        vertices[JSON.stringify(v1)] = 1;
      }
  }
  return { vertices, edges, hexes };
}

module.exports = { generateGraph };