import { defineEngine, once, defineLoop, emit, on } from "aion-engine";
import { getMouseX, getMouseY, click, direction, key } from "aion-input";
import {
  aionPreset,
  setPosition,
  createTransform,
  Rect,
  translate,
  screenToWorldPosition,
  zoom,
} from "aion-preset";
import { Colors, clear, windowCenterX, windowWidth } from "aion-render";

const engine = defineEngine(() => {
  const preset = aionPreset({
    renderDebug: true,
  });

  const { createRect, createCube, createBall, $physics, $camera } = preset;

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

  on("update", () => {
    translate($camera, direction().scale(10));

    if (key("a")) {
      zoom(-0.01);
    }

    if (key("e")) {
      zoom(+0.01);
    }
  });

  on("update", () => {
    const localX = getMouseX() - Rect.w[cube] / 2;
    const localY = getMouseY() - Rect.h[cube] / 2;

    const { x, y } = screenToWorldPosition({ x: localX, y: localY });
    console.log({ x, y });

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
