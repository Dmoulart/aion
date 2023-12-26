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
  setLastCreatedPlayer,
  playersSnapshotMessage,
  handleMovement,
} from "./shared.js";
import {createTransport} from "../../../packages/net/src/transport.js";

const {world, remove, create} = bombi();

const walkable: Array<boolean[]> = [];

initMap();

const wss = new WebSocketServer({port: 4321});

wss.on("connection", (socket) => {
  const transport = createTransport(socket as any);

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
    remove(transportID);
  };

  socket.on("message", (ev) => {
    const data = ev.slice(0) as Buffer; //  why slice ?? I want the buffer dude
    const arrayBuffer = data.buffer;

    transport.receive(world, arrayBuffer);
  });
  setInterval(() => {
    transport.send(world, playersSnapshotMessage);
  }, 1000 / 60);
});

setInterval(() => {
  handleMovement(world);
}, 1000 / 60);
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
