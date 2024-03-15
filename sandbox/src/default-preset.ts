import {
  defineEngine,
  defineLoop,
  emit,
  on,
  aionPreset,
  Rect,
  Position,
  setPosition,
  Collider,
  once,
  usePhysics,
  SCALE_FACTOR,
} from "aion-engine";
import { getMouseX, getMouseY, click } from "aion-input";
import {
  Colors,
  beginPath,
  bottomLeftOfWindow,
  clear,
  closePath,
  fill,
  lineTo,
  stroke,
  windowWidth,
} from "aion-render";

const engine = defineEngine(() => {
  const preset = aionPreset();

  const { createRect, createCube, createBall, $physics, $ecs } = preset;

  const { RAPIER } = $physics;

  const cube = createRect({
    Rect: {
      h: 100,
      w: 100,
    },
    Fill: "red",
    Stroke: "white",
  });

  // const floor = createRect({
  //   Position: bottomLeftOfWindow(),
  //   Rect: {
  //     h: 1,
  //     w: windowWidth(),
  //   },
  //   Fill: "black",
  //   Stroke: "white",
  // });
  once("update", () => {
    const floor = createCube({
      Position: {
        x: 0,
        y: 800,
      },
      Rect: {
        h: 10,
        w: windowWidth(),
      },
      Fill: "blue",
      Stroke: "red",
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
    const { RAPIER, world } = usePhysics();
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
          Position: {
            x,
            y,
          },
          Circle: {
            r: 100,
          },
          Fill: "green",
          Stroke: "white",
          Body: RAPIER.RigidBodyDesc.dynamic(),
          Collider: {
            auto: 1,
          },
        });
      } else {
        createCube({
          Position: {
            x,
            y,
          },
          Rect: {
            h: Rect.h[cube],
            w: Rect.w[cube],
          },
          Fill: "green",
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
