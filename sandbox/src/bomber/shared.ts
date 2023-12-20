import {
  aion,
  defineComponent,
  f32,
  i32,
  u16,
  u8,
  defineEncoder,
  defineMessage,
  createSnapshot,
  u32,
  attach,
} from "../../../packages/ecs/dist/index.js";
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

const createPlayer = prefab(Character);

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

export const initPlayerMessage = defineMessage({
  encode(world, chunk) {
    const {create} = bombi();

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

    chunk = encodePlayer([player], chunk);
    chunk.ensureAvailableCapacity(8);
    chunk.writeInt32(transportID);
    chunk.writeInt32(player);

    return chunk.buffer;
  },
  decode(world, chunk) {
    chunk = decodePlayer(world, chunk);
    const transportID = chunk.readInt32();
    const player = chunk.readInt32();
    attach(world, player, ClientTransport);
    return chunk;
  },
});
