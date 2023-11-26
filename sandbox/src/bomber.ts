import "./style.css";
import {
  aion,
  f32,
  defineComponent,
  i32,
  u16,
  u8,
} from "../../packages/ecs/dist/index.js";
import block from "./bomber/assets/block.png";
import tile from "./bomber/assets/tile.png";
import bombermanB0 from "./bomber/assets/bomberman-b0.png";
import bombermanBm1 from "./bomber/assets/bomberman-b-1.png";
import bombermanB1 from "./bomber/assets/bomberman-b1.png";
import {useInput} from "./bomber/input";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
document.getElementById("playground")!.appendChild(canvas);
canvas.width = innerWidth;
canvas.height = innerHeight;

const SPRITES = {
  [block]: 0,
  [tile]: 1,
  [bombermanBm1]: 2,
  [bombermanB0]: 3,
  [bombermanB1]: 4,
};

const SPRITES_IMAGES = await Promise.all(
  Object.keys(SPRITES).map((src) => loadImage(src))
);

const Position = defineComponent({
  x: i32,
  y: i32,
});

const Velocity = defineComponent({
  x: f32,
  y: f32,
});

const Sprite = defineComponent(u16);

const Movable = {Position, Velocity};
const Drawable = {Position, Sprite};
const Character = {...Movable, ...Drawable};

const TileDesc = defineComponent({
  blocking: u8,
});
const TILE_SIZE = 16;
const Tile = {...Drawable, TileDesc};

const {prefab, query} = aion();

const createTileEntity = prefab(Tile);

const walkable: Array<boolean[]> = [];
initMap();

const CHARACTER_SPRITE_HEIGHT = 1;
const CHARACTER_SPRITE_WIDTH = 0;

const createPlayer = prefab(Character);
const player = createPlayer({
  Position: {
    x: 0,
    y: 0,
  },
  Sprite: SPRITES[bombermanB0],
  Velocity: {
    x: 0,
    y: 0,
  },
});

const CALCULATE_VEL_EVERY_N_TURN = 10;
let step = 0;

(function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (step % CALCULATE_VEL_EVERY_N_TURN === 0) {
    const {direction} = useInput();
    const {x, y} = direction();
    Velocity.x[player] = x;
    Velocity.y[player] = y;
  } else {
    Velocity.x[player] &&= 0;
    Velocity.y[player] &&= 0;
  }

  query(Movable).each((e) => {
    const newX = Position.x[e] + Velocity.x[e];
    const newY = Position.y[e] + Velocity.y[e];

    if (
      isWalkable(newX + CHARACTER_SPRITE_WIDTH, newY + CHARACTER_SPRITE_HEIGHT)
    ) {
      Position.x[e] += Velocity.x[e];
      Position.y[e] += Velocity.y[e];
    } else {
      Velocity.x[e] = 0;
      Velocity.y[e] = 0;
    }
  });

  query(Drawable).each((e) => {
    const asset = Sprite[e];

    const x = Position.x[e];
    const y = Position.y[e];

    ctx.drawImage(SPRITES_IMAGES[asset], x * TILE_SIZE, y * TILE_SIZE);
  });

  step += 1;

  requestAnimationFrame(loop);
})();

function initMap() {
  for (let x = 0; x < 40; x++) {
    for (let y = 0; y < 40; y++) {
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
    Sprite: SPRITES[isWalkable ? tile : block],
    TileDesc: {
      blocking: isWalkable ? Number(false) : Number(true),
    },
  });
  const isBlocking = Boolean(TileDesc.blocking[t]);

  walkable[x] ??= [];
  walkable[x][y] = !isBlocking;
}

function isWalkable(x: number, y: number) {
  return walkable?.[x]?.[y] ?? false;
}

export async function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    img.src = path;

    img.onerror = (e) => {
      console.warn(`Cannot load image at path ${path}\n${e}`);
      reject(e);
    };

    img.onload = () => resolve(img);
  });
}
