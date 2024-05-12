import { createECS, components, createWorld } from "aion-ecs";
import { initWindow, windowCenterX, windowCenterY } from "aion-render";
import { initInputListener } from "aion-input";
import {
  Body,
  Collider,
  initPhysics,
  type InitPhysicsOptions,
} from "./physics/index.js";
import { Circle, Fill, Rect, Stroke } from "./components.js";
import { defineModule, on } from "aion-engine";
import {
  Camera,
  createTransform,
  initAI,
  initDebug,
  initScenes,
  render,
  type InitDebugOptions,
  initAnimations,
  Transform,
  initHierarchy,
  useECS,
} from "./index.js";

export type AionPresetOptions = InitPhysicsOptions & InitDebugOptions;

export const AionPreset = defineModule({
  $ecs: () => {
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

    return {
      ...$ecs,
      $camera,
      createRect,
      createCube,
      createCircle,
      createBall,
      createCamera,
    };
  },
  $physics: initPhysics,
  window: initWindow,
  input: initInputListener,
  scenes: initScenes,
  ai: initAI,
  animations: initAnimations,
  debug: initDebug,
  hierarchy: initHierarchy,
});

// export function aionPreset(options?: AionPresetOptions) {
//   initWindow();
//   initInputListener();

//   const { $scenes, currentSceneCleanup } = initScenes();

//   const $physics = initPhysics(options);

//   initAI();

//   initAnimations();

//   initDebug(options);

//   initHierarchy();

//   const $ecs = createECS();

//   const createRect = $ecs.prefab({ Transform, Rect, Stroke, Fill });

//   const createCube = $ecs.prefab({
//     Transform,
//     Rect,
//     Stroke,
//     Fill,
//     Body,
//     Collider,
//   });

//   const createBall = $ecs.prefab({
//     Transform,
//     Circle,
//     Stroke,
//     Fill,
//     Body,
//     Collider,
//   });

//   const createCircle = $ecs.prefab({ Transform, Circle, Stroke, Fill });

//   const createCamera = $ecs.prefab({
//     Transform,
//     Camera,
//   });

//   const $camera = createCamera({
//     Camera: {
//       default: 1,
//       zoom: 1,
//     },
//     Transform: createTransform(0, 0),
//   });

//   on("draw", () => render($camera));

//   if (options?.renderDebug) {
//     on("draw", () => debugRender($camera));
//   }

//   return {
//     $ecs,
//     $physics,
//     $camera,
//     $scenes,
//     currentSceneCleanup,
//     ...components,
//     createRect,
//     createCube,
//     createCircle,
//     createBall,
//     createCamera,
//   };
// }
