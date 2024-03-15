import { aion, any, components, query } from "aion-ecs";
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
import { Circle, Fill, Position, Rect, Stroke, on } from "../index.js";
import { initInputListener } from "aion-input";
import { Body, Collider, initPhysics } from "./physics/index.js";

export function aionPreset() {
  initWindow();
  initInputListener();

  const $physics = initPhysics();

  const $ecs = aion();

  const { has, query } = $ecs;

  const createRect = $ecs.prefab({ Position, Rect, Stroke, Fill });

  const createCube = $ecs.prefab({
    Position,
    Rect,
    Stroke,
    Fill,
    Body,
    Collider,
  });

  const createBall = $ecs.prefab({
    Position,
    Circle,
    Stroke,
    Fill,
    Body,
    Collider,
  });

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

  return {
    $ecs,
    $physics,
    ...components,
    createRect,
    createCube,
    createCircle,
    createBall,
  };
}
