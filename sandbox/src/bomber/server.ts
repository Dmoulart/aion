import { WebSocketServer } from "ws";
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
  removePlayerMessage,
  setLastRemovedPlayer,
  handleBombs,
  bombsSnapshotMessage,
  explodedBombs,
  explodedBombsMessage,
} from "./shared.js";
import {
  Transport,
  createTransport,
} from "../../../packages/net/src/transport.js";

const { world, remove, create } = bombi();

const walkable: Array<boolean[]> = [];

initMap();

const wss = new WebSocketServer({ port: 4321 });
const transports: Array<Transport> = [];
wss.on("connection", (socket) => {
  const transport = createTransport(socket as any);
  transports.push(transport);

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

  setLastCreatedPlayer(player);
  transport.send(world, initWorldMessage);
  transport.send(world, initPlayerMessage);

  socket.onclose = (ev) => {
    remove(player);
    const i = transports.indexOf(transport);
    setLastRemovedPlayer(player);
    if (i !== -1) {
      transports.splice(i, 1);
    }
    transports.forEach((transport) =>
      transport.send(world, removePlayerMessage),
    );
  };

  socket.on("message", (ev) => {
    const data = ev.slice(0) as Buffer; //  why slice ?? I want the buffer dude
    transport.receive(world, data.buffer);
  });

  setInterval(() => {
    transport.send(world, playersSnapshotMessage);
  }, 1000 / 60);
});

setInterval(() => {
  handleMovement(world);
  handleBombs(world);
  transports.forEach((transport) => {
    transport.send(world, bombsSnapshotMessage);
    if (explodedBombs.length > 0) {
      transport.send(world, explodedBombsMessage);
    }
  });
  explodedBombs.length = 0;
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
    Sprite: { value: SPRITES[isWalkable ? tileAsset : blockAsset] },
  });

  const isBlocking = Boolean(TileDesc.blocking[tile]);

  walkable[x] ??= [];
  walkable[x][y] = !isBlocking;
}
