import { defineEngine, once, defineLoop, emit, on } from "aion-engine";
import { getMouseX, getMouseY, click } from "aion-input";
import {
  aionPreset,
  usePhysics,
  SCALE_FACTOR,
  Rect,
  setPosition,
  mat,
  createTransform,
} from "aion-preset";
import {
  Colors,
  beginPath,
  clear,
  lineTo,
  stroke,
  windowCenterX,
  windowWidth,
} from "aion-render";

const engine = defineEngine(() => {
  const preset = aionPreset();

  const { createRect, createCube, createBall, $physics } = preset;

  const { RAPIER } = $physics;

  const cube = createRect({
    Rect: {
      h: 100,
      w: 100,
    },
    Fill: Colors["shamrock:900"],
    Stroke: "white",
  });

  once("update", () => {
    const floor = createCube({
      Transform: createTransform(windowCenterX(), 800),
      Rect: {
        h: 10,
        w: windowWidth(),
      },
      Fill: Colors["acapulco:400"],
      Stroke: "white",
      Collider: {
        auto: 1,
      },
      Body: RAPIER.RigidBodyDesc.fixed(),
    });
  });

  // Collider[floor] = RAPIER.ColliderDesc.cuboid(windowWidth() / 2, 1);
  // ).setTranslation(bottomLeftOfWindow().x, bottomLeftOfWindow().y);

  defineLoop(() => {
    emit("update");

    clear();
    emit("draw");
  });

  on("draw", () => {
    const { world } = usePhysics();
    const buffers = world.debugRender();
    for (let i = 0; i < buffers.vertices.length; i += 4) {
      beginPath();
      const x1 = buffers.vertices[i];
      const y1 = buffers.vertices[i + 1];
      lineTo(x1 * SCALE_FACTOR, y1 * SCALE_FACTOR);

      const x2 = buffers.vertices[i + 2];
      const y2 = buffers.vertices[i + 3];

      lineTo(x2 * SCALE_FACTOR, y2 * SCALE_FACTOR);
      stroke("pink");
    }
  });

  on("update", () => {
    const x = getMouseX() - Rect.w[cube] / 2;
    const y = getMouseY() - Rect.h[cube] / 2;

    setPosition(cube, { x, y });

    if (click()) {
      const ball = Math.random() > 0.5;
      if (ball) {
        createBall({
          Transform: createTransform(x, y),
          Circle: {
            r: 100,
          },
          Fill: Colors["cornflower:600"],
          Stroke: "white",
          Body: RAPIER.RigidBodyDesc.dynamic(),
          Collider: {
            auto: 1,
          },
        });
      } else {
        createCube({
          Transform: createTransform(x, y),
          Rect: {
            h: Rect.h[cube],
            w: Rect.w[cube],
          },
          Fill: Colors["cornflower:600"],
          Stroke: "white",
          Body: RAPIER.RigidBodyDesc.dynamic(),
          Collider: {
            auto: 1,
          },
        });
      }
    }
  });

  return { ...preset };
});

const useGame = engine.use;

engine.run();
