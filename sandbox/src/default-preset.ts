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
  forEachChildOf,
} from "aion-preset";
import {
  Colors,
  clear,
  windowCenterX,
  windowCenterY,
  windowWidth,
} from "aion-render";

const engine = defineEngine(() => {
  const preset = aionPreset({
    renderDebug: true,
  });

  const { createRect, createCube, createBall, $physics, $camera, $ecs } =
    preset;

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

  once("update", () => {
    addChildTo(
      cube,
      createRect({
        Transform: createTransform(-20, -15),
        Rect: {
          h: 10,
          w: 10,
        },
        Fill: "black",
        Stroke: "white",
      }),
    );

    addChildTo(
      cube,
      createRect({
        Transform: createTransform(20, -15),
        Rect: {
          h: 10,
          w: 10,
        },
        Fill: "black",
        Stroke: "white",
      }),
    );

    addChildTo(
      cube,
      createRect({
        Transform: createTransform(0, 25),
        Rect: {
          h: 10,
          w: 40,
        },
        Fill: "black",
        Stroke: "white",
      }),
    );
  });

  once("update", () => {
    const floor = createCube({
      Transform: createTransform(windowCenterX(), windowCenterY()),
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

    centerCameraOnEntity(floor);
  });

  defineLoop(() => {
    emit("update");

    clear();

    emit("draw");
  });

  on("update", () => {
    translate($camera, direction().scale(10));

    if (key("a")) {
      zoomBy(-0.01);
    }

    if (key("e")) {
      zoomBy(+0.01);
    }
  });

  on("update", () => {
    const { x, y } = screenToWorldPosition(getMouse());

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
