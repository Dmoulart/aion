export * from "./components.js";
export * from "./ctx.js";
export * from "./ecs.js";
export * from "./shapes.js";

import { aion, any, query } from "aion-ecs/src";
import {
  rect,
  fill,
  circle,
  initWindow,
  clear,
  beginDraw,
  stroke,
  closePath,
  beginFrame,
  endFrame,
  beginPath,
} from "aion-render";
import { createComponents } from "./components.js";
import { on } from "../index.js";
import { initInputListener } from "aion-input";

export function aionPreset() {
  initWindow();
  initInputListener();

  const $ecs = aion();

  const { has, query } = $ecs;

  const components = createComponents();

  const { Position, Circle, Rect, Stroke, Fill } = components;

  const createRect = $ecs.prefab({ Position, Rect, Stroke, Fill });

  const createCircle = $ecs.prefab({ Position, Circle, Stroke, Fill });

  on("draw", () => {
    const { x, y } = Position;
    const { w, h } = Rect;
    const { r } = Circle;

    beginFrame();

    query(Position, any(Stroke, Fill), any(Rect, Circle)).each((ent) => {
      console.log(ent, Fill[ent]);

      beginPath();
      if (has(Rect, ent)) {
        rect(x[ent]!, y[ent]!, w[ent]!, h[ent]!);
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
    });
  });

  return { $ecs, ...components, createRect, createCircle };
}
