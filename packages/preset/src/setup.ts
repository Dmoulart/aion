import { createECS, any, components, query } from "aion-ecs";
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
import { initInputListener } from "aion-input";
import { Body, Collider, initPhysics } from "./physics/index.js";
import { Circle, Fill, Position, Rect, Stroke } from "./components.js";
import { on } from "aion-engine";
import { render } from "./index.js";

export function aionPreset() {
  initWindow();
  initInputListener();

  const $physics = initPhysics();

  const $ecs = createECS();

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
