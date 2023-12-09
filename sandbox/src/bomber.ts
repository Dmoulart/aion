import "./style.css";
import {Entity, onEnterQuery} from "../../packages/ecs/dist/index.js";
import {useInput} from "./bomber/input";
import {
  Drawable,
  Velocity,
  Sprite,
  Movable,
  Position,
  Animation,
  bombi,
  SPRITES,
  isWalkable,
  TILE_SIZE,
  initMessage,
  Tile,
  TileDesc,
  setWalkable,
  Character,
} from "./bomber/shared";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
document.getElementById("playground")!.appendChild(canvas);
canvas.width = 800;
canvas.height = 600;

canvas.style.imageRendering = "pixelated";
ctx.imageSmoothingEnabled = false;
canvas.style.width = `${800 * 1.5}px`;
canvas.style.height = `${600 * 1.5}px`;

const SPRITES_IMAGES = await Promise.all(
  Object.keys(SPRITES).map((src) => loadImage(src))
);

const {query, world} = bombi();

try {
  const socket = new WebSocket(`ws://${window.location.hostname}:4321`);
  socket.onmessage = async (msg) => {
    const ab = await msg.data.arrayBuffer();
    initMessage.decode(world, ab);
  };
} catch (e) {
  console.error(e);
}

const CHARACTER_SPRITE_HEIGHT = 1;
const CHARACTER_SPRITE_WIDTH = 0;

const UPDATE_ANIM_TURN = 5;

let step = 0;

const lastPlayerDirection = {x: 0, y: 0};

const onTileCreated = onEnterQuery(query(Tile));
const onCharacterCreated = onEnterQuery(query(Character));

onCharacterCreated((ch) => {
  console.log("player created ", ch);
});

onTileCreated((e) => {
  const x = Position.x[e];
  const y = Position.y[e];
  const isBlocking = TileDesc.blocking[e];

  setWalkable(x, y, !isBlocking);
});
const characters = query(Character);
function whenPlayerCreated(cb: (player: Entity) => void) {
  query(Character).each(cb);
  // if (player) {
  //   cb(player);
  // }
}
(function loop() {
  whenPlayerCreated((player) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const {direction} = useInput();
    const {x, y} = direction();
    Velocity.x[player] = x * 0.1;
    Velocity.y[player] = y * 0.1;

    onTurn(UPDATE_ANIM_TURN, () => {
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
          Sprite.value[e] = getAnimationSprite(lastPlayerDirection, 1);
          return;
        }

        const elapsed = Date.now() - Animation.start[e];

        Sprite.value[e] = getAnimationSprite(lastPlayerDirection, elapsed % 3);
      });
    });

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

    query(Drawable).each((e) => {
      const asset = Sprite.value[e];

      const x = Position.x[e];
      const y = Position.y[e];

      ctx.drawImage(SPRITES_IMAGES[asset], x * TILE_SIZE, y * TILE_SIZE);
    });

    step += 1;
  });
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

function onTurn(nTurn: number, fn: () => void) {
  if (step % nTurn === 0) {
    fn();
  }
}

function getAnimationSprite(direction: {x: number; y: number}, step: number) {
  let d = "b";
  let s = step;
  if (direction.x !== 0) {
    switch (true) {
      case direction.x > 0: {
        d = "r";
        break;
      }
      case direction.x < 0: {
        d = "l";
        break;
      }
      default: {
        break;
      }
    }
  }
  if (direction.y !== 0) {
    switch (true) {
      case direction.y > 0: {
        d = "b";
        break;
      }
      case direction.y < 0: {
        d = "u";
        break;
      }
      default: {
        break;
      }
    }
  }

  return SPRITES[`./src/bomber/assets/bomberman-${d}${s.toString()}.png`];
}

function isMoving(e: Entity) {
  return Velocity.x[e] !== 0 || Velocity.y[e] !== 0;
}
