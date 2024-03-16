import { createECS, components } from "aion-ecs";
import { initWindow } from "aion-render";
import { initInputListener } from "aion-input";
import { Body, Collider, initPhysics } from "./physics/index.js";
import { Circle, Fill, Rect, Stroke, Transform } from "./components.js";
import { on } from "aion-engine";
import { render } from "./index.js";

export function aionPreset() {
  initWindow();
  initInputListener();

  const $physics = initPhysics();

  const $ecs = createECS();

  const createRect = $ecs.prefab({ Transform, Rect, Stroke, Fill });

  const createCube = $ecs.prefab({
    Transform,
    Rect,
    Stroke,
    Fill,
    Body,
    Collider,
  });

  const createBall = $ecs.prefab({
    Transform,
    Circle,
    Stroke,
    Fill,
    Body,
    Collider,
  });

  const createCircle = $ecs.prefab({ Transform, Circle, Stroke, Fill });

  on("draw", render);

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
