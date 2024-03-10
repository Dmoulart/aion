import "./style.css";
import { aion, f32, defineComponent, i32, u16, u8 } from "aion-ecs/src";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
document.getElementById("playground")!.appendChild(canvas);
canvas.width = innerWidth;
canvas.height = innerHeight;

const Position = defineComponent({
  x: i32,
  y: i32,
});

const Velocity = defineComponent({
  x: f32,
  y: f32,
});

const Graphics = defineComponent({
  type: u8,
  color: u16,
  w: u16,
  h: u16,
});

const MovingShape = { Position, Velocity, Graphics };

const { prefab, query, remove } = aion();

const rect = 0;
const circle = 1;

const createMovingShape = prefab(MovingShape);

const player = createMovingShape({
  Graphics: {
    color: 0xffff00,
    type: rect,
  },
  Position: {
    x: canvas.width / 2,
    y: canvas.height / 2,
  },
  Velocity: {
    x: 0,
    y: 0,
  },
});

canvas.onmousemove = (e) => {
  Position.x[player] = e.clientX;
  Position.y[player] = e.clientY;

  const shape = createMovingShape({
    Graphics: {
      color: Math.random() * Number.MAX_SAFE_INTEGER,
      type: Math.random() > 0.5 ? rect : circle,
      w: rand(0, 100),
      h: rand(0, 100),
    },
    Position: {
      x: e.clientX,
      y: e.clientY,
    },
    Velocity: {
      x: rand(-2, 2),
      y: rand(-2, 2),
    },
  });

  setTimeout(() => remove(shape), 10_000);
};

(function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  query(Position, Velocity).each((e) => {
    Position.x[e] += Velocity.x[e];
    Position.y[e] += Velocity.y[e];
  });

  query(MovingShape).each((e) => {
    const shape = Graphics.type[e];
    const color = Graphics.color[e];
    const w = Graphics.w[e];
    const h = Graphics.h[e];

    ctx.strokeStyle = "#" + color.toString(16);
    if (shape === rect) {
      ctx.strokeRect(Position.x[e], Position.y[e], w, h);
    } else if (shape === circle) {
      ctx.beginPath();
      ctx.ellipse(Position.x[e], Position.y[e], w, h, 1, 10, 1);
      ctx.stroke();
      ctx.closePath();
    }
  });

  requestAnimationFrame(loop);
})();

function rand(min: number, max: number) {
  // Ensure that the input values are valid
  if (min >= max) {
    [min, max] = [max, min];
  }

  // Calculate the random number within the specified range
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
