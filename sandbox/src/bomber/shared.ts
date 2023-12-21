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
  hasComponent,
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

const {prefab, create} = bombi();

export const Position = defineComponent({
  x: f32,
  y: f32,
});
export const Velocity = defineComponent({
  x: f32,
  y: f32,
});
export const Animation = defineComponent({
  start: i32,
});
export const Sprite = defineComponent({value: u16});
export const TileDesc = defineComponent({
  blocking: u8,
});
export const Transport = defineComponent({
  id: u32,
});

export const Movable = {Position, Velocity};
export const Drawable = {Position, Sprite};
export const Character = {...Movable, ...Drawable, Animation, Transport};
export const Tile = {...Drawable, TileDesc};

export const ClientTransport = create();

export const TILE_SIZE = 16;

export const createPlayer = prefab(Character);

export const createTileEntity = bombi().prefab(Tile);

export const walkable: Array<boolean[]> = [];

export const setWalkable = (x: number, y: number, isWalkable: boolean) => {
  walkable[x] ??= [];
  walkable[x][y] = isWalkable;
};

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
export let usePlayer = (cb: (player: Entity) => void) => {
  const {query, world} = bombi();
  //@todo: pass id to query
  query(Character).each((e) => {
    if (hasComponent(world, e, ClientTransport)) {
      cb(e);
    }
  });
};

export let lastCreatedPlayer: Entity | undefined;
export function setLastCreatedPlayer(player: Entity) {
  lastCreatedPlayer = player;
  return player;
}
export const initPlayerMessage = defineMessage({
  encode(world, chunk) {
    if (!lastCreatedPlayer) throw new Error("No last player created");
    chunk = encodePlayer([lastCreatedPlayer], chunk);
    chunk.ensureAvailableCapacity(8);
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
