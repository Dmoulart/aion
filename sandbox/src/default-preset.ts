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
} from "aion-engine";
import { getMouseX, getMouseY, click } from "aion-input";
import { bottomLeftOfWindow, clear, windowWidth } from "aion-render";

const engine = defineEngine(() => {
  const preset = aionPreset();

  const { createRect, createCube, $physics, $ecs } = preset;

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
        x: 100,
        y: 500,
      },
      Rect: {
        h: 10,
        w: windowWidth(),
      },
      Fill: "blue",
      Stroke: "red",
      Collider: RAPIER.ColliderDesc.cuboid(5, 1),
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
    const x = getMouseX() - Rect.w[cube] / 2;
    const y = getMouseY() - Rect.h[cube] / 2;

    setPosition(cube, { x, y });

    if (click()) {
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
        Collider: RAPIER.ColliderDesc.cuboid(1, 1),
      });
    }
  });

  return { ...preset };
});

const useGame = engine.use;

engine.run();
