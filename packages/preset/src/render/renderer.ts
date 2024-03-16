import {
  beginFrame,
  beginPath,
  rect,
  circle,
  closePath,
  stroke,
  fill,
  getContext2D,
} from "aion-render";
import { useECS } from "../ecs.js";
import { Rect, Stroke, Fill, Circle, Transform } from "../components.js";
import type { Entity } from "aion-ecs";

export function render(camera: Entity) {
  const { query, any, has } = useECS();
  const { w, h } = Rect;
  const { r } = Circle;

  const ctx = getContext2D();

  preDraw(ctx, Transform[camera]!);

  beginFrame();

  query(Transform, any(Stroke, Fill), any(Rect, Circle)).each((ent) => {
    preDraw(ctx, Transform[ent]!);

    beginPath();

    if (has(Rect, ent)) {
      const width = w[ent]!;
      const height = h[ent]!;

      const halfWidth = width / 2;
      const halfHeight = height / 2;

      rect(-halfWidth, -halfHeight, width, height);
    }

    if (has(Circle, ent)) {
      circle(0, 0, r[ent]!);
    }

    closePath();

    if (has(Stroke, ent)) {
      stroke(Stroke[ent]!);
    }

    if (has(Fill, ent)) {
      fill(Fill[ent]!);
    }

    postDraw(ctx);
  });

  postDraw(ctx);
}

export function preDraw(
  ctx: CanvasRenderingContext2D,
  matrix: ArrayLike<number>,
) {
  // Save the transformation matrix to restore it after drawing
  ctx.save();
  ctx.transform(
    matrix[0]!,
    matrix[1]!,
    matrix[2]!,
    matrix[3]!,
    matrix[4]!,
    matrix[5]!,
  );
}

export function postDraw(ctx: CanvasRenderingContext2D) {
  ctx.restore();
}