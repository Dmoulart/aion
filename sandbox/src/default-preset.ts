import {
  defineEngine,
  defineLoop,
  emit,
  on,
  aionPreset,
  Rect,
  Position,
} from "aion-engine";
import { getMouseX, getMouseY, click } from "aion-input";
import { clear } from "aion-render";

const engine = defineEngine(() => {
  const preset = aionPreset();

  const { createRect, $physics, $ecs } = preset;

  const { Body, Collider, RAPIER } = $physics;

  const cube = createRect({
    Rect: {
      h: 100,
      w: 100,
    },
    Fill: "red",
    Stroke: "white",
  });

  defineLoop(() => {
    emit("update");

    clear();
    emit("draw");
  });

  on("update", () => {
    const x = getMouseX() - Rect.w[cube] / 2;
    const y = getMouseY() - Rect.h[cube] / 2;

    Position.x[cube] = x;
    Position.y[cube] = y;

    if (click()) {
      const ent = createRect({
        Position: {
          x,
          y,
        },
        Rect: {
          h: Rect.h[cube],
          w: Rect.w[cube],
        },
        Fill: "green", // shared state
        Stroke: "white",
      });

      Body[ent] = RAPIER.RigidBodyDesc.dynamic();
      Collider[ent] = RAPIER.ColliderDesc.cuboid(Rect.w[cube]!, Rect.h[cube]!);

      $ecs.attach(Body, ent);
      $ecs.attach(Collider, ent);
    }
  });

  return { ...preset };
});

const useGame = engine.use;

engine.run();
