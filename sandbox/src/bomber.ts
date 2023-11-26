import "./style.css";
import {
  aion,
  f32,
  defineComponent,
  i32,
  u16,
  u8,
  Entity,
} from "../../packages/ecs/dist/index.js";
import block from "./bomber/assets/block.png";
import tile from "./bomber/assets/tile.png";
import {useInput} from "./bomber/input";

// import bombermanB0 from "./bomber/assets/bomberman-b0.png";
// import bombermanBm1 from "./bomber/assets/bomberman-b-1.png";
// import bombermanB1 from "./bomber/assets/bomberman-b1.png";

// import bombermanU0 from "./bomber/assets/bomberman-u0.png";
// import bombermanUm1 from "./bomber/assets/bomberman-u-1.png";
// import bombermanU1 from "./bomber/assets/bomberman-u1.png";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
document.getElementById("playground")!.appendChild(canvas);
canvas.width = 800;
canvas.height = 600;

canvas.style.imageRendering = "pixelated";
canvas.style.width = `${800 * 1.5}px`;
canvas.style.height = `${600 * 1.5}px`;

const SPRITES = {
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
const Animation = defineComponent({
  start: i32,
});

const Sprite = defineComponent(u16);

const Movable = {Position, Velocity};
const Drawable = {Position, Sprite};
const Character = {...Movable, ...Drawable, Animation};

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
  Sprite: SPRITES["./src/bomber/assets/bomberman-b0.png"],
  Velocity: {
    x: 0,
    y: 0,
  },
  Animation: {
    start: 0,
  },
});

const MOVE_TURN = 4;

let step = 0;

const lastPlayerDirection = {x: 0, y: 0};

(function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const {direction} = useInput();
  const {x, y} = direction();
  Velocity.x[player] = x;
  Velocity.y[player] = y;

  onTurn(MOVE_TURN, () => {
    query(Sprite, Animation, Velocity).each((e) => {
      if (isMoving(player)) {
        lastPlayerDirection.x = Velocity.x[e];
        lastPlayerDirection.y = Velocity.y[e];

        if (Animation.start[e] === 0) {
          // start animation
          Animation.start[e] = Date.now();
        }
      } else {
        // stop animation
        Animation.start[e] = 0;
      }
      // of animation has stopped set default sprite
      if (Animation.start[e] === 0) {
        Sprite[e] = getAnimationSprite(lastPlayerDirection, 1);
        return;
      }

      const elapsed = Date.now() - Animation.start[e];

      Sprite[e] = getAnimationSprite(lastPlayerDirection, elapsed % 3);
    });
  });

  onTurn(MOVE_TURN, () => {
    query(Movable).each((e) => {
      const newX = Position.x[e] + Velocity.x[e];
      const newY = Position.y[e] + Velocity.y[e];

      if (
        isWalkable(
          newX + CHARACTER_SPRITE_WIDTH,
          newY + CHARACTER_SPRITE_HEIGHT
        )
      ) {
        Position.x[e] += Velocity.x[e];
        Position.y[e] += Velocity.y[e];
      } else {
        Velocity.x[e] = 0;
        Velocity.y[e] = 0;
      }
    });
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

function onTurn(nTurn: number, fn: () => void) {
  if (step % nTurn === 0) {
    fn();
  }
}

function getAnimationSprite(direction: {x: number; y: number}, step: number) {
  let d = "b";
  let s = step;
  if (direction.x !== 0) {
    switch (direction.x) {
      case 1: {
        d = "r";
        break;
      }
      case -1: {
        d = "l";
        break;
      }
      default: {
        break;
      }
    }
  }
  if (direction.y !== 0) {
    switch (direction.y) {
      case 1: {
        d = "b";
        break;
      }
      case -1: {
        d = "u";
        break;
      }
      default: {
        break;
      }
    }
  }
  console.log(`./src/bomber/assets/bomberman-${d}${s.toString()}.png`);
  return SPRITES[`./src/bomber/assets/bomberman-${d}${s.toString()}.png`];
}

function isMoving(e: Entity) {
  return Velocity.x[e] !== 0 || Velocity.y[e] !== 0;
}
