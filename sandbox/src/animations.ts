import { defineEngine, defineLoop, emit, on } from "aion-engine";
import { direction, key } from "aion-input";
import {
  aionPreset,
  attachAnimationTo,
  centerCameraOnEntity,
  createTransform,
  defineAnimationConfig,
  getX,
  getY,
  setPosition,
  setX,
  setY,
  translate,
  translateX,
  translateY,
  zoomBy,
} from "aion-preset";
import { Colors, setBackgroundColor } from "aion-render";

const engine = defineEngine(
  () =>
    aionPreset({
      debugEntityID: false,
    }),
  () => {
    const { $camera, createRect } = useGame();

    setBackgroundColor(Colors["rhino:200"]);

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

    const rect = createRect({
      Transform: createTransform(0, 0),
      Fill: Colors["shamrock:600"],
      Stroke: "black",
      Rect: {
        w: 100,
        h: 100,
      },
    });

    centerCameraOnEntity(rect);

    const MoveAnimation = defineAnimationConfig({
      steps: {
        initial: {
          updates: {
            x: {
              get: (subject) => getX(subject),
              set: (subject, to) => setX(subject, to()),
              value: 0,
            },
            y: {
              get: (subject) => getY(subject),
              set: (subject, to) => setY(subject, to()),
              value: 0,
            },
          },
          time: 1,
        },
        right: {
          updates: {
            x: {
              get: (subject) => getX(subject),
              set: (subject, to) => setX(subject, to()),
              value: 250,
            },
            y: {
              get: (subject) => getY(subject),
              set: (subject, to) => setY(subject, to(0)),
              value: 0,
            },
          },
          time: 1,
        },
        up: {
          updates: {
            x: {
              get: (subject) => getX(subject),
              set: (subject, to) => setX(subject, to()),
              value: 250,
            },
            y: {
              get: (subject) => getY(subject),
              set: (subject, to) => setY(subject, to()),
              value: -250,
            },
          },
          time: 1,
        },
        upLeft: {
          updates: {
            x: {
              get: (subject) => getX(subject),
              set: (subject, to) => setX(subject, to()),
              value: 0,
            },
            y: {
              get: (subject) => getY(subject),
              set: (subject, to) => setY(subject, to(-250)),
              value: -250,
            },
          },
          time: 1,
        },
      },
    });

    attachAnimationTo(rect, MoveAnimation);

    on("update", () => {
      debugger;
      // const mouse = screenToWorldPosition(getMouse());
      // setWorldPosition(rect, mouse);
    });
  },
);

const useGame = engine.use;

engine.run();
