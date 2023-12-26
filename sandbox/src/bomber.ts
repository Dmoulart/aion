import "./style.css";
import {
  Entity,
  hasComponent,
  onEnterQuery,
} from "../../packages/ecs/dist/index.js";
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
  Tile,
  TileDesc,
  setWalkable,
  Character,
  ClientTransport,
  playerUpdateMessage,
  player,
  InputCommand,
} from "./bomber/shared";
import {createTransport} from "../../packages/net/src/transport";

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

const socket = new WebSocket(`ws://${window.location.hostname}:4321`);
const transport = createTransport(socket);
socket.onmessage = async (msg) => {
  const ab = await msg.data.arrayBuffer();
  transport.receive(world, ab);
};

const CHARACTER_SPRITE_HEIGHT = 1;
const CHARACTER_SPRITE_WIDTH = 0;

const UPDATE_ANIM_TURN = 5;

let step = 0;

const lastPlayersDirections: Array<{x: number; y: number}> = [];

const onTileCreated = onEnterQuery(query(Tile));

const onCharacterCreated = onEnterQuery(query(Character));

onCharacterCreated((e) => {
  debugger;
  console.log(e);
});

onTileCreated((e) => {
  debugger;
  console.log(e);
  const x = Position.x[e];
  const y = Position.y[e];
  const isBlocking = TileDesc.blocking[e];

  setWalkable(x, y, !isBlocking);
});

(function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  {
    const {direction} = useInput();
    const {x, y} = direction();
    InputCommand.horizontal[player] = x;
    InputCommand.vertical[player] = y;
    // if (x > 0 || y > 0) {
    //   debugger;
    // }
    console.log("input command", x, y);
    // Velocity.x[player] = x * 0.1;
    // Velocity.y[player] = y * 0.1;
  }

  onTurn(UPDATE_ANIM_TURN, () => {
    query(Character).each((e) => {
      lastPlayersDirections[e] ??= {x: 0, y: 0};
      if (isMoving(e)) {
        lastPlayersDirections[e].x = Velocity.x[e];
        lastPlayersDirections[e].y = Velocity.y[e];
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
        Sprite.value[e] = getAnimationSprite(lastPlayersDirections[e], 1);
        return;
      }
      const elapsed = Date.now() - Animation.start[e];
      Sprite.value[e] = getAnimationSprite(
        lastPlayersDirections[e],
        elapsed % 3
      );
    });
  });

  query(Character).each((e) => {
    if (InputCommand.horizontal[e] > 0) {
      debugger;
    }
    Velocity.x[e] = InputCommand.horizontal[e] * 0.1;
    Velocity.y[e] = InputCommand.vertical[e] * 0.1;

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

  query(Tile).each((e) => {
    const asset = Sprite.value[e];

    const x = Position.x[e];
    const y = Position.y[e];

    ctx.drawImage(SPRITES_IMAGES[asset], x * TILE_SIZE, y * TILE_SIZE);
  });

  query(Character).each((e) => {
    const asset = Sprite.value[e];

    const x = Position.x[e];
    const y = Position.y[e];

    ctx.drawImage(SPRITES_IMAGES[asset], x * TILE_SIZE, y * TILE_SIZE);
  });

  step += 1;

  // onTurn(10, () => transport.send(world, playerUpdateMessage));

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
