import {WebSocketServer} from "ws";
import {
  SPRITES,
  TileDesc,
  blockAsset,
  bombi,
  createTileEntity,
  tileAsset,
  initWorldMessage,
  initPlayerMessage,
  createPlayer,
  lastCreatedPlayer,
  setLastCreatedPlayer,
} from "./shared.js";
import {createTransport} from "../../../packages/ecs/dist/transport.js";

const {world, remove} = bombi();

const walkable: Array<boolean[]> = [];

initMap();

const wss = new WebSocketServer({port: 4321});

wss.on("connection", (socket) => {
  const transport = createTransport(socket as any);
  const {create} = bombi();

  // @todo: delete ?
  const transportID = create();

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
    Transport: {
      id: transportID,
    },
  });

  setLastCreatedPlayer(player);

  transport.send(world, initWorldMessage);
  transport.send(world, initPlayerMessage);

  socket.onclose = (ev) => {
    remove(player);
  };
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
  const tile = createTileEntity({
    Position: {
      x,
      y,
    },
    TileDesc: {
      blocking: isWalkable ? Number(false) : Number(true),
    },
    Sprite: {value: SPRITES[isWalkable ? tileAsset : blockAsset]},
  });

  const isBlocking = Boolean(TileDesc.blocking[tile]);

  walkable[x] ??= [];
  walkable[x][y] = !isBlocking;
}
