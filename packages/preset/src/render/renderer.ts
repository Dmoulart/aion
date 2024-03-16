import { beginFrame, beginPath, rect, circle, closePath, stroke, fill } from "aion-render";
import { useECS } from "../ecs.js";
import { Rect, Position, Stroke, Fill, Circle } from "../components.js";

export function render() {
  const { query, any, has } = useECS()
  const { x, y } = Position;
  const { w, h } = Rect;
  const { r } = Circle;

  beginFrame();

  query(Position, any(Stroke, Fill), any(Rect, Circle)).each((ent) => {
    beginPath();

    if (has(Rect, ent)) {
      const width = w[ent]!;
      const height = h[ent]!;
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      const posX = x[ent]! - halfWidth;
      const posY = y[ent]! - halfHeight;
      rect(posX, posY, width, height);
    }

    if (has(Circle, ent)) {
      circle(x[ent]!, y[ent]!, r[ent]!);
    }

    closePath();

    if (has(Stroke, ent)) {
      stroke(Stroke[ent]!);
    }

    if (has(Fill, ent)) {
      fill(Fill[ent]!);
    }
  }
