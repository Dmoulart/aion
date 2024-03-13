import { aion, any, query } from "aion-ecs/src";
import {
  rect,
  fill,
  circle,
  initWindow,
  stroke,
  closePath,
  beginFrame,
  beginPath,
} from "aion-render";
import { createComponents } from "./components.js";
import { on } from "../index.js";
import { initInputListener } from "aion-input";
import { initPhysics } from "./physics.js";

export function aionPreset() {
  initWindow();
  initInputListener();

  const $physics = initPhysics();

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

  return { $ecs, $physics, ...components, createRect, createCircle };
}
