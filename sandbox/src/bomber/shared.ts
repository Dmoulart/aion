import {
  aion,
  defineComponent,
  f32,
  i32,
  u16,
  u8,
  Entity,
  prefab,
  defineEncoder,
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

export const Movable = {Position, Velocity};
export const Drawable = {Position, Sprite};
export const Character = {...Movable, ...Drawable, Animation};

export const TileDesc = defineComponent({
  blocking: u8,
});
export const TILE_SIZE = 16;
export const Tile = {...Drawable, TileDesc};

export const createTileEntity = bombi().prefab(Tile);

const walkable: Array<boolean[]> = [];

function initMap() {
  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 30; y++) {
      createTile(x, y);
    }
  }
}

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

function createTile(x: number, y: number) {
  const isWalkable = Math.random() > 0.1;
  const t = createTileEntity({
    Position: {
      x,
      y,
    },
    Sprite: {value: SPRITES[isWalkable ? tile : block]},
    TileDesc: {
      blocking: isWalkable ? Number(false) : Number(true),
    },
  });
  const isBlocking = Boolean(TileDesc.blocking[t]);

  walkable[x] ??= [];
  walkable[x][y] = !isBlocking;
}

export function isWalkable(x: number, y: number) {
  return walkable?.[Math.round(x)]?.[Math.round(y)] ?? false;
}

const [encodeTile, decodeTile] = defineEncoder([Position, TileDesc, Sprite]);
export {encodeTile, decodeTile};

const [encodePlayer, decodePlayer] = defineEncoder([
  Position,
  Animation,
  Velocity,
  Sprite,
]);
export {encodePlayer, decodePlayer};
