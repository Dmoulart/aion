import { createECS, components } from "aion-ecs";
import { initWindow } from "aion-render";
import { initInputListener } from "aion-input";
import {
  Body,
  Collider,
  initPhysics,
  type InitPhysicsOptions,
} from "./physics/index.js";
import { Circle, Fill, Rect, Stroke, Transform } from "./components.js";
import { on } from "aion-engine";
import { Camera, createTransform, render } from "./index.js";
import { debugRender } from "./physics/debug.js";

export type AionPresetOptions = InitPhysicsOptions;

export function aionPreset(options?: AionPresetOptions) {
  initWindow();
  initInputListener();

  const $physics = initPhysics(options);

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

  const createCamera = $ecs.prefab({
    Transform,
    Camera,
  });

  const $camera = createCamera({
    Camera: {
      default: 1,
      zoom: 1,
    },
    Transform: createTransform(0, 0),
  });

  on("draw", () => render($camera));

  if (options?.renderDebug) {
    on("draw", () => debugRender($camera));
  }

  return {
    $ecs,
    $physics,
    $camera,
    ...components,
    createRect,
    createCube,
    createCircle,
    createBall,
    createCamera,
  };
}
