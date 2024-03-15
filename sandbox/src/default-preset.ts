import {
  defineEngine,
  defineLoop,
  emit,
  on,
  aionPreset,
  Rect,
  Position,
  setPosition,
} from "aion-engine";
import { getMouseX, getMouseY, click } from "aion-input";
import { clear } from "aion-render";

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

  // Collider[floor] = RAPIER.ColliderDesc.cuboid(
  //   windowWidth() / 2,
  //   1
  // ).setTranslation(bottomLeftOfWindow().x, bottomLeftOfWindow().y);

  // $ecs.attach(Collider, floor);

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
