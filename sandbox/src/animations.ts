import { defineEngine, defineLoop, emit, on } from "aion-engine";
import { direction, key } from "aion-input";
import {
  aionPreset,
  animate,
  attachAnimationTo,
  centerCameraOnEntity,
  createTransform,
  defineAnimationConfig,
  degreesToRadians,
  getRotation,
  getScaleX,
  getScaleY,
  getX,
  getY,
  setPosition,
  setRotation,
  setScaleX,
  setScaleY,
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

    const witness = createRect({
      Transform: createTransform(0, 0),
      Fill: Colors["picton-blue:400"],
      Stroke: "black",
      Rect: {
        w: 100,
        h: 100,
      },
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

    // const MoveAnimation = defineAnimationConfig({
    //   steps: {
    //     initial: {
    //       updates: {
    //         x: {
    //           get: getX,
    //           set: setX,
    //           value: 0,
    //         },
    //         y: {
    //           get: getY,
    //           set: setY,
    //           value: 0,
    //         },
    //         rotation: {
    //           get: getRotation,
    //           set: setRotation,
    //           value: 0,
    //         },
    //         scaleX: {
    //           get: getScaleX,
    //           set: setScaleX,
    //           value: 1,
    //         },
    //         scaleY: {
    //           get: getScaleY,
    //           set: setScaleY,
    //           value: 1,
    //         },
    //       },
    //       duration: 1,
    //     },
    //     right: {
    //       updates: {
    //         x: {
    //           get: getX,
    //           set: setX,
    //           value: 250,
    //         },
    //         y: {
    //           get: getY,
    //           set: setY,
    //           value: 0,
    //         },
    //         rotation: {
    //           get: getRotation,
    //           set: setRotation,
    //           value: degreesToRadians(90),
    //         },
    //         scaleX: {
    //           get: getScaleX,
    //           set: setScaleX,
    //           value: 2,
    //         },
    //         scaleY: {
    //           get: getScaleY,
    //           set: setScaleY,
    //           value: 0.2,
    //         },
    //       },
    //       duration: 0.5,
    //     },
    //     up: {
    //       updates: {
    //         x: {
    //           get: getX,
    //           set: setX,
    //           value: 250,
    //         },
    //         y: {
    //           get: getY,
    //           set: setY,
    //           value: -250,
    //         },
    //         rotation: {
    //           get: getRotation,
    //           set: setRotation,
    //           value: degreesToRadians(180),
    //         },
    //         scaleX: {
    //           get: getScaleX,
    //           set: setScaleX,
    //           value: 0.5,
    //         },
    //         scaleY: {
    //           get: getScaleY,
    //           set: setScaleY,
    //           value: 1,
    //         },
    //       },
    //       duration: 1,
    //     },
    //     upLeft: {
    //       updates: {
    //         x: {
    //           get: getX,
    //           set: setX,
    //           value: 0,
    //         },
    //         y: {
    //           get: getY,
    //           set: setY,
    //           value: -250,
    //         },
    //         rotation: {
    //           get: getRotation,
    //           set: setRotation,
    //           value: degreesToRadians(220),
    //         },
    //         scaleX: {
    //           get: getScaleX,
    //           set: setScaleX,
    //           value: 0.2,
    //         },
    //         scaleY: {
    //           get: getScaleY,
    //           set: setScaleY,
    //           value: 0.2,
    //         },
    //       },
    //       duration: 0.2,
    //     },
    //   },
    // });

    const MoveAnimation = defineAnimationConfig({
      steps: {
        initial: {
          updates: animate({
            x: 0,
            y: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          }),
          duration: 1,
        },
        right: {
          updates: animate({
            x: 250,
            y: 0,
            rotation: degreesToRadians(90),
            scaleX: 2,
            scaleY: 0.2,
          }),
          duration: 0.5,
        },
        up: {
          updates: animate({
            x: 250,
            y: -250,
            rotation: degreesToRadians(180),
            scaleX: 0.5,
            scaleY: 1,
          }),
          duration: 1,
        },
        upLeft: {
          updates: animate({
            x: 0,
            y: -250,
            rotation: degreesToRadians(220),
            scaleX: 0.2,
            scaleY: 0.2,
          }),
          duration: 0.2,
        },
      },
    });

    attachAnimationTo(rect, MoveAnimation);

    on("update", () => {
      // const mouse = screenToWorldPosition(getMouse());
      // setWorldPosition(rect, mouse);
    });
  },
);

const useGame = engine.use;

engine.run();
