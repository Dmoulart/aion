import {WebSocketServer} from "ws";
import {
  Character,
  SPRITES,
  TileDesc,
  blockAsset,
  bombi,
  createTileEntity,
  tileAsset,
  initMessage,
} from "./shared.js";
import {createTransport} from "../../../packages/ecs/dist/transport.js";

const {prefab, world, remove} = bombi();

const createPlayer = prefab(Character);

const walkable: Array<boolean[]> = [];
initMap();

const wss = new WebSocketServer({port: 4321});
wss.on("connection", (socket) => {
  const transport = createTransport(socket);

  const player = createPlayer({
    Animation: {
      start: 0,
    },
    Position: {
      x: 1,
      y: 1,
    },
    Sprite: {
      value: SPRITES["./src/bomber/assets/bomberman-b0.png"],
    },
    Velocity: {
      x: 0,
      y: 0,
    },
  });

  transport.send(world, initMessage);

  socket.onclose = (ev) => {
    remove(player);
  };

  // const chunk = initMessage.encode(world);
  // socket.send(chunk);
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
    TileDesc: {
      blocking: isWalkable ? Number(false) : Number(true),
    },
    Position: {
      x,
      y,
    },
    Sprite: {value: SPRITES[isWalkable ? tileAsset : blockAsset]},
  });
  const isBlocking = Boolean(TileDesc.blocking[t]);

  walkable[x] ??= [];
  walkable[x][y] = !isBlocking;
}
