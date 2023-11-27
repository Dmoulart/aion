import {WebSocketServer} from "ws";
import {
  Character,
  SPRITES,
  TileDesc,
  blockAsset,
  bombi,
  createTileEntity,
  tileAsset,
  Tile,
  Position,
} from "./shared.js";
import {eid} from "../../../packages/ecs/dist/types.js";

const {prefab, query} = bombi();

const walkable: Array<boolean[]> = [];
initMap();

const wss = new WebSocketServer({port: 4321});

wss.on("connection", (socket) => {
  console.log("hello");
  const data = new eid(100);

  let i = 0;

  console.log(data);
  socket.send(data);
});

const createPlayer = prefab(Character);

// (function loop() {
//   setInterval(loop, 1000 / 60);
// })();

const player = createPlayer({
  Position: {
    x: 0,
    y: 0,
  },
  Sprite: SPRITES["./src/bomber/assets/bomberman-b0.png"],
  Velocity: {
    x: 0,
    y: 0,
  },
  Animation: {
    start: 0,
  },
});

function initMap() {
  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 30; y++) {
      createTile(x, y);
    }
  }
}

function createTile(x: number, y: number) {
  const isWalkable = Math.random() > 0.1;
  const t = createTileEntity({
    Position: {
      x,
      y,
    },
    Sprite: SPRITES[isWalkable ? tileAsset : blockAsset],
    TileDesc: {
      blocking: isWalkable ? Number(false) : Number(true),
    },
  });
  const isBlocking = Boolean(TileDesc.blocking[t]);

  walkable[x] ??= [];
  walkable[x][y] = !isBlocking;
}
