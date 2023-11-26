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
import {useInput} from "./bomber/input";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
document.getElementById("playground")!.appendChild(canvas);
canvas.width = innerWidth;
canvas.height = innerHeight;

const SPRITES = {
  [block]: 0,
  [tile]: 1,
  [bombermanB0]: 2,
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

const createWalkableTile = prefab(Tile);
for (let x = 0; x < 40; x++) {
  for (let y = 0; y < 40; y++) {
    createWalkableTile({
      Position: {
        x,
        y,
      },
      Sprite: SPRITES[Math.random() > 0.1 ? tile : block],
      TileDesc: {
        blocking: Number(false),
      },
    });
  }
}

const createPlayer = prefab(Character);
const player = createPlayer({
  Position: {
    x: 1,
    y: 1,
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
    {
      const {direction} = useInput();
      const {x, y} = direction();
      Velocity.x[player] = x;
      Velocity.y[player] = y;
    }
  } else {
    Velocity.x[player] = 0;
    Velocity.y[player] = 0;
  }

  query(Movable).each((e) => {
    Position.x[e] += Velocity.x[e];
    Position.y[e] += Velocity.y[e];
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
