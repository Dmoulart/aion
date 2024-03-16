import { beginFrame, beginPath, rect, circle, closePath, stroke, fill } from "aion-render";
import { useECS } from "../ecs.js";
import { Rect, Stroke, Fill, Circle, Transform } from "../components.js";
import { getX, getY } from "../index.js";

export function render() {
  const { query, any, has } = useECS()
  const { w, h } = Rect;
  const { r } = Circle;

  beginFrame();

  query(Transform, any(Stroke, Fill), any(Rect, Circle)).each((ent) => {
    beginPath();

    const x = getX(ent)
    const y = getY(ent)

    if (has(Rect, ent)) {
      const width = w[ent]!;
      const height = h[ent]!;

      const halfWidth = width / 2;
      const halfHeight = height / 2;

      const posX = x - halfWidth;
      const posY = y - halfHeight;

      rect(posX, posY, width, height);
    }

    if (has(Circle, ent)) {
      circle(x, y, r[ent]!);
    }

    closePath();

    if (has(Stroke, ent)) {
      stroke(Stroke[ent]!);
    }

    if (has(Fill, ent)) {
      fill(Fill[ent]!);
    }
  }
