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
  useAion,
} from "aion-preset";
import {
  Colors,
  setBackgroundColor,
  windowCenterX,
  windowCenterY,
  windowWidth,
} from "aion-render";

const engine = defineEngine(
  () =>
    aionPreset({
      renderDebug: true,
    }),
  () => {
    const { $ecs, $physics, createBall, createCube, createRect, $camera } =
      useAion();
    const { query } = $ecs;

    const { RAPIER } = $physics;

    setBackgroundColor("black");

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
      const onCollisionStart = onEnterQuery(query(Collision));
      const onCollisionEnd = onExitQuery(query(Collision));

      onCollisionStart((entity) => {
        Fill[entity] = Colors["rhino:700"];
      });

      onCollisionEnd((entity) => {
        Fill[entity] = Colors["chestnut-rose:900"];
      });
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
        Collider: createCollider({
          auto: 1,
        }),
        Body: createBody({
          type: RAPIER.RigidBodyType.Fixed,
        }),
      });

      centerCameraOnEntity(floor);
    });

    defineLoop(() => {
      emit("update");

      emit("draw");
    });

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
        const ball = Math.random() > 0.5;
        if (ball) {
          createBall({
            Transform: createTransform(x, y),
            Circle: {
              r: 50,
            },
            Fill: Colors["shamrock:950"],
            Stroke: "white",
            Body: createBody({
              type: 0,
            }),
            Collider: createCollider({
              auto: 1,
              rotationsEnabled: 0,
            }),
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
            Body: createBody({
              type: 0,
            }),
            Collider: createCollider({
              auto: 1,
            }),
          });
        }
      }
    });
  },
);

const useGame = engine.use;

engine.run();
