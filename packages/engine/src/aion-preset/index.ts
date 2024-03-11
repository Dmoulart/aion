export * from "./components.js";
export * from "./ctx.js";
export * from "./ecs.js";
export * from "./shapes.js";

import { aion, any, query } from "aion-ecs/src";
import { rect, fill, circle, initWindow, clear, beginDraw } from "aion-render";
import { createComponents } from "./components.js";
import { on } from "../index.js";
import { initInputListener } from "aion-input";

export function aionPreset() {
  initWindow();
  initInputListener();

  const $ecs = aion();

  const { has, query } = $ecs;

  const components = createComponents();

  const { Position, Color, Circle, Rect } = components;

  const createRect = $ecs.prefab({ Position, Color, Rect });

  const createCircle = $ecs.prefab({ Position, Color, Circle });

  on("draw", () => {
    const { x, y } = Position;
    const { w, h } = Rect;
    const { r } = Circle;

    beginDraw();

    query(Position, Color, any(Rect, Circle)).each((ent) => {
      if (has(Rect, ent)) {
        rect(x[ent]!, y[ent]!, w[ent]!, h[ent]!);
      }

      if (has(Circle, ent)) {
        circle(x[ent]!, y[ent]!, r[ent]!);
      }

      fill(Color[ent]!);
    });
  });

  return { $ecs, ...components, createRect, createCircle };
}
