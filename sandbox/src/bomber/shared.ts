import {
  aion,
  defineComponent,
  f32,
  i32,
  u16,
  u8,
  defineEncoder,
  u32,
  attach,
  Entity,
  i16,
  World,
  i64,
} from "../../../packages/ecs/dist/index.js";
import {defineMessage, createSnapshot} from "../../../packages/net/src";
import block from "./assets/block.png";
import tile from "./assets/tile.png";

export const blockAsset = block;
export const tileAsset = tile;
export let bombi = () => {
  const w = aion();
  bombi = () => w;
  return w;
};

const {prefab, create, remove} = bombi();

export const Position = defineComponent({
  x: f32,
  y: f32,
});
export const Velocity = defineComponent({
  x: f32,
  y: f32,
});

export const Animation = defineComponent({
  start: f32,
});
export const Sprite = defineComponent({value: u16});

export const TileDesc = defineComponent({
  blocking: u8,
});

export const InputCommand = defineComponent({
  horizontal: i16,
  vertical: i16,
});

export const BombCommand = defineComponent({
  bomb: u8,
  x: i32,
  y: i32,
});

export const BombComponent = defineComponent({
  created: f32,
  lifetime: i32, // in seconds
});

export const Movable = {Position, Velocity};
export const Drawable = {Position, Sprite};
export const Character = {
  ...Movable,
  ...Drawable,
  InputCommand,
  Animation,
  BombCommand,
};
export const Tile = {...Drawable, TileDesc};
export const Bomb = {BombComponent, ...Drawable};
export const ClientTransport = create();

export const TILE_SIZE = 16;

export const createPlayer = prefab(Character);

export const createTileEntity = bombi().prefab(Tile);
export const createBomb = bombi().prefab(Bomb);

export const walkable: Array<boolean[]> = [];

export const setWalkable = (x: number, y: number, isWalkable: boolean) => {
  walkable[x] ??= [];
  walkable[x][y] = isWalkable;
};

export const CHARACTER_SPRITE_HEIGHT = 1;
export const CHARACTER_SPRITE_WIDTH = 0;
export function handleMovement(world: World) {
  const {query} = bombi();
  query(Character).each((e) => {
    Velocity.x[e] = InputCommand.horizontal[e] * 0.25;
    Velocity.y[e] = InputCommand.vertical[e] * 0.25;

    InputCommand.horizontal[e] = 0;
    InputCommand.vertical[e] = 0;
  });

  query(Movable).each((e) => {
    const newX = Position.x[e] + Velocity.x[e];
    const newY = Position.y[e] + Velocity.y[e];
    if (
      (Velocity.x[e] !== 0 || Velocity.y[e] !== 0) &&
      isWalkable(newX + CHARACTER_SPRITE_WIDTH, newY + CHARACTER_SPRITE_HEIGHT)
    ) {
      Position.x[e] += Velocity.x[e];
      Position.y[e] += Velocity.y[e];
    } else {
      Velocity.x[e] = 0;
      Velocity.y[e] = 0;
    }
  });
}

export function handleBombs(world: World) {
  const {query} = bombi();

  // bomb spawning
  query(Character).each((e) => {
    if (BombCommand.bomb[e]) {
      const created = Date.now();
      debugger;
      const bomb = createBomb({
        BombComponent: {
          created: created,
          lifetime: 1000,
        },
        Position: {x: BombCommand.x[e], y: BombCommand.y[e]},
        Sprite: {
          value: SPRITES["./src/bomber/assets/bomb-1.png"],
        },
      });

      setTimeout(() => {
        console.log("delete");
        explodedBombs.push(bomb);
        remove(bomb);
      }, 1_000);

      BombCommand.bomb[e] = Number(false);
    }
  });

  // query(Bomb).each((e) => {
  //   const created = BombComponent.created[e];
  //   const lifetime = BombComponent.lifetime[e];
  //   console.log("created + lifetime", Date.now() - (created + lifetime));
  //   const mustExplode = Date.now() - (created + lifetime) > 0;

  //   console.log(e, "created at ", created);
  //   console.log(e, "explodes at at ", created + lifetime);
  //   console.log("now", Date.now());
  //   console.log(e, "will explode in ", Date.now() - (created + lifetime));

  //   if (mustExplode) {
  //     console.log(e, "will explode", mustExplode);
  //     explodedBombs.push(e);
  //     remove(e);
  //   }
  // });
}
export let explodedBombs: Array<Entity> = [];

export const SPRITES = {
  [block]: 0,
  [tile]: 1,
  "./src/bomber/assets/bomberman-b0.png": 2,
  "./src/bomber/assets/bomberman-b1.png": 3,
  "./src/bomber/assets/bomberman-b2.png": 4,
  "./src/bomber/assets/bomberman-u0.png": 5,
  "./src/bomber/assets/bomberman-u1.png": 6,
  "./src/bomber/assets/bomberman-u2.png": 7,
  "./src/bomber/assets/bomberman-l0.png": 8,
  "./src/bomber/assets/bomberman-l1.png": 9,
  "./src/bomber/assets/bomberman-l2.png": 10,
  "./src/bomber/assets/bomberman-r0.png": 11,
  "./src/bomber/assets/bomberman-r1.png": 12,
  "./src/bomber/assets/bomberman-r2.png": 13,
  "./src/bomber/assets/bomb-1.png": 14,
};

export function isWalkable(x: number, y: number) {
  x = Math.round(x);
  y = Math.round(y);
  return walkable?.[x]?.[y] ?? false;
}

const [encodeTile, decodeTile] = defineEncoder([...Object.values(Tile)]);
export {encodeTile, decodeTile};

const [encodePlayer, decodePlayer] = defineEncoder([
  ...Object.values(Character),
]);
export {encodePlayer, decodePlayer};

const [encodeBombs, decodeBombs] = defineEncoder([...Object.values(Bomb)]);

export const initWorldMessage = defineMessage({
  encode(world, chunk) {
    chunk = createSnapshot(world, chunk, ...Object.values(Tile));
    chunk = createSnapshot(world, chunk, ...Object.values(Character));

    return chunk.buffer;
  },
  decode(world, chunk) {
    chunk = decodeTile(world, chunk);
    chunk = decodePlayer(world, chunk);

    return chunk;
  },
});

export let player: Entity = 0;

export let lastCreatedPlayer: Entity | undefined;
export function setLastCreatedPlayer(player: Entity) {
  lastCreatedPlayer = player;
  return player;
}
export const initPlayerMessage = defineMessage({
  encode(world, chunk) {
    if (!lastCreatedPlayer) throw new Error("No last player created");
    chunk = encodePlayer([lastCreatedPlayer], chunk);
    chunk.ensureAvailableCapacity(4);
    chunk.writeInt32(lastCreatedPlayer);
    lastCreatedPlayer = undefined;
    return chunk.buffer;
  },
  decode(world, chunk) {
    chunk = decodePlayer(world, chunk);
    player = chunk.readInt32();
    attach(world, player, ClientTransport);
    return chunk;
  },
});

export const playerUpdateMessage = defineMessage({
  encode(world, chunk) {
    chunk = encodePlayer([player], chunk);
    return chunk.buffer;
  },
  decode(world, chunk) {
    chunk = decodePlayer(world, chunk);
    return chunk;
  },
});

export const playersSnapshotMessage = defineMessage({
  encode(world, chunk) {
    chunk = createSnapshot(world, chunk, ...Object.values(Character));
    return chunk.buffer;
  },
  decode(world, chunk) {
    chunk = decodePlayer(world, chunk);
    return chunk;
  },
});

export const bombsSnapshotMessage = defineMessage({
  encode(world, chunk) {
    chunk = createSnapshot(world, chunk, ...Object.values(Bomb));
    return chunk.buffer;
  },
  decode(world, chunk) {
    chunk = decodeBombs(world, chunk);
    return chunk;
  },
});

export const explodedBombsMessage = defineMessage({
  encode(world, chunk) {
    const len = 4 * explodedBombs.length + 4;
    chunk.ensureAvailableCapacity(len);
    chunk.writeUint32(len);
    for (const bomb of explodedBombs) {
      chunk.writeUint32(bomb);
    }

    return chunk.buffer;
  },
  decode(world, chunk) {
    const len = chunk.readUint32();
    let i = 0;
    while (i + 4 < len) {
      remove(chunk.readUint32());
      i += 4;
    }
    return chunk;
  },
});

export let lastRemovedPlayer: Entity = 0;
export function setLastRemovedPlayer(eid: Entity) {
  lastRemovedPlayer = eid;
}
export const removePlayerMessage = defineMessage({
  encode(world, chunk) {
    chunk.ensureAvailableCapacity(4);
    console.log(chunk.offset, chunk.buffer.byteLength);
    chunk.writeUint32(lastRemovedPlayer);
    return chunk.buffer;
  },
  decode(world, chunk) {
    remove(chunk.readUint32());
    return chunk;
  },
});
