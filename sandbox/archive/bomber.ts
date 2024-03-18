import "./style.css";
import { Entity, onEnterQuery } from "aion-ecs";
import { useInput } from "./bomber/input";
import {
  Velocity,
  Sprite,
  Position,
  Animation,
  bombi,
  SPRITES,
  TILE_SIZE,
  Tile,
  TileDesc,
  setWalkable,
  Character,
  playerUpdateMessage,
  player,
  InputCommand,
  handleMovement,
  BombCommand,
  Bomb,
  CHARACTER_SPRITE_WIDTH,
  CHARACTER_SPRITE_HEIGHT,
} from "./bomber/shared";
import { createTransport } from "../../packages/net/src/transport";

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
  Object.keys(SPRITES).map((src) => loadImage(src)),
);

const { query, world } = bombi();

const socket = new WebSocket(`ws://${window.location.hostname}:4321`);
const transport = createTransport(socket);
socket.onmessage = async (msg) => {
  const ab = await msg.data.arrayBuffer();
  transport.receive(world, ab);
};

const UPDATE_ANIM_TURN = 5;

let step = 0;

const lastPlayersDirections: Array<{ x: number; y: number }> = [];

const onTileCreated = onEnterQuery(query(Tile));

const onCharacterCreated = onEnterQuery(query(Character));

onCharacterCreated((e) => {});

onTileCreated((e) => {
  const x = Position.x[e];
  const y = Position.y[e];
  const isBlocking = TileDesc.blocking[e];

  setWalkable(x, y, !isBlocking);
});

(function loop() {
  BombCommand.bomb[player] = Number(false);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  {
    const { direction } = useInput();
    const { x, y } = direction();
    InputCommand.horizontal[player] = x;
    InputCommand.vertical[player] = y;
  }
  console.log("player", player);

  const { key } = useInput();
  if (key(" ")) {
    BombCommand.bomb[player] = Number(true);
    BombCommand.x[player] = Position.x[player] + CHARACTER_SPRITE_WIDTH;
    BombCommand.y[player] = Position.y[player] + CHARACTER_SPRITE_HEIGHT;
    // transport.send(world, bombMessage)
  }

  handleMovement(world);

  query(Character).each((e) => {
    // console.log(e, lastPlayersDirections[e]);
    lastPlayersDirections[e] ??= { x: 0, y: 0 };
    if (isMoving(e)) {
      lastPlayersDirections[e].x = Velocity.x[e];
      lastPlayersDirections[e].y = Velocity.y[e];
      console.log("last pl d", e, lastPlayersDirections[e]);
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
    Sprite.value[e] = getAnimationSprite(lastPlayersDirections[e], elapsed % 3);
  });
  query(Tile).each(draw);
  query(Bomb).each(draw);

  query(Character).each(draw);

  step += 1;

  onTurn(1, () => transport.send(world, playerUpdateMessage));

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

function getAnimationSprite(direction: { x: number; y: number }, step: number) {
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

function draw(e: Entity) {
  const asset = Sprite.value[e];

  const x = Position.x[e];
  const y = Position.y[e];

  ctx.drawImage(SPRITES_IMAGES[asset], x * TILE_SIZE, y * TILE_SIZE);
}
