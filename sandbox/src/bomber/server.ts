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
  encodeTile,
  encodePlayer,
} from "./shared.js";

import {Entity} from "../../../packages/ecs/dist/entity.js";

const {prefab, query} = bombi();

const createPlayer = prefab(Character);

const walkable: Array<boolean[]> = [];
initMap();

const wss = new WebSocketServer({port: 4321});
wss.on("connection", (socket) => {
  console.log("Player connected");

  {
    const ents: Array<Entity> = [];

    const archetypes = query(Tile).archetypes;

    for (const arch of archetypes) {
      for (const eid of arch.entities.dense) {
        ents.push(eid);
      }
    }
    console.time("encoded tiles in");
    const buffer = encodeTile(ents);
    console.timeEnd("encode");

    socket.send(buffer);
  }

  {
    const ents: Array<Entity> = [];
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

    const archetypes = query(Character).archetypes;

    for (const arch of archetypes) {
      for (const eid of arch.entities.dense) {
        ents.push(eid);
      }
    }

    socket.send(encodePlayer(ents));
  }
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
    Sprite: {value: SPRITES[isWalkable ? tileAsset : blockAsset]},
    TileDesc: {
      blocking: isWalkable ? Number(false) : Number(true),
    },
  });
  const isBlocking = Boolean(TileDesc.blocking[t]);

  walkable[x] ??= [];
  walkable[x][y] = !isBlocking;
}
