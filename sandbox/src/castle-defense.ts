import { onEnterQuery, onExitQuery } from "aion-ecs";
import { defineEngine, once, defineLoop, emit, on } from "aion-engine";
import { click, direction, key, getMouse } from "aion-input";
import {
  aionPreset,
  setPosition,
  createTransform,
  Rect,
  translate,
  screenToWorldPosition,
  zoomBy,
  centerCameraOnEntity,
  addChildTo,
  Collision,
  Fill,
  createCollider,
  createBody,
  setZoom,
} from "aion-preset";
import { Colors, windowCenterX, windowCenterY, windowWidth } from "aion-render";

const engine = defineEngine(
  plugins,
  ({ createRect, createCube, $physics, $camera }) => {
    const { RAPIER } = $physics;

    const cube = createRect({
      Transform: createTransform(0, 0),
      Rect: {
        h: 100,
        w: 100,
      },
      Fill: "white",
      Stroke: "white",
    });

    const floor = createCube({
      Transform: createTransform(windowCenterX(), windowCenterY()),
      Rect: {
        h: 10,
        w: windowWidth(),
      },
      Fill: Colors["acapulco:400"],
      Stroke: "white",
      Collider: createCollider({
        auto: 1,
      }),
      Body: createBody({
        type: RAPIER.RigidBodyType.Fixed,
      }),
    });

    setZoom(0.3);
    centerCameraOnEntity(floor);

    on("update", () => {
      translate($camera, direction().scale(10));

      if (key("a")) {
        zoomBy(-0.04);
      }

      if (key("e")) {
        zoomBy(+0.04);
      }
    });

    on("update", () => {
      const { x, y } = screenToWorldPosition(getMouse());

      setPosition(cube, { x, y });

      if (click()) {
        createCube({
          Transform: createTransform(x, y),
          Rect: {
            h: Rect.h[cube],
            w: Rect.w[cube],
          },
          Fill: Colors["cornflower:600"],
          Stroke: "white",
          Body: createBody({
            type: 0,
          }),
          Collider: createCollider({
            auto: 1,
          }),
        });
      }
    });
  },
);

const useGame = engine.use;

engine.run();

function plugins() {
  defineLoop(() => {
    emit("update");

    emit("draw");
  });

  return aionPreset({
    renderDebug: false,
  });
}
