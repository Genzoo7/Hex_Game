// Max hexagons in row and column
const BOARD_WIDTH = 5;
const BOARD_HEIGHT = 5;
const GAME_HEX_COUNT = 19;
const ROAD_TYPE = ["FREE", "RED", "GREEN", "BLUE", "YELLOW"];
const VERTEX_TYPE = [...ROAD_TYPE];
const RESOURCE_TYPE = ["BRICK", "WOOD", "WHEAT", "SHEEP", "STONE", "FREE"];

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
  const hexWithdraw = {};
  let removal = [
    [0,0], [0,1], [0,2], [0,3], [0,4], 
    [4,0], [4,1], [4,2], [4,3], [4,4],
    [1,0], [2,0], [3,0], [4,0],
    [0,4], [2,4],
  ]

  let hexes = [];
  for (let i = 0; i < BOARD_WIDTH; i++) {
    for (let j = 0; j < BOARD_HEIGHT; j++) {
      hexes.push([i, j]);
    }
  }

  const finalHexes = removeRandomElements(hexes, removal, 25-GAME_HEX_COUNT);

  hexes = {};
  const keys = [...RESOURCE_TYPE];
  for (const hex of finalHexes){
    i = hex[0];
    j = hex[1];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const allowed = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];
    let randomNumber = allowed[Math.floor(Math.random() * allowed.length)]; // [2,6] and [8,12]
    let robber = false;
    if (randomKey === "FREE"){
      keys.pop("FREE");
      randomNumber = "";
      robber = true;
    }

    (hexWithdraw[randomNumber] ??= []).push([i, j]);


    hexes[[i,j]] = {
        resource: randomKey,
        diceNumber: randomNumber,
        robber: robber,
        belongingVertices: [],
    };
  }
  if (keys.includes("FREE")){ return initHexesBoard(); }

  return {hexes, hexWithdraw};
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
  const {hexes, hexWithdraw} = initHexesBoard();
  const hex_keys = Object.keys(hexes);

  for (const hex of hex_keys) {
    const pos = hex.split(",");
    i = pos[0];
    j = pos[1];
      const verts = getPosOfVerticesBelongingToHex([i, j]);
      if (!verts) continue;
      hexes[[i,j]].belongingVertices = verts;
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
          type: ROAD_TYPE[0],
        };
        //edges[key2] = 1;
        vertices[JSON.stringify(v1)] = {
          type: VERTEX_TYPE[0],
          isSettlement: false,
          isCity: false,
        };
      }
  }
  return { vertices, edges, hexes };
}

module.exports = { generateGraph };