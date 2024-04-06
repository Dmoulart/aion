import { defineEngine, defineLoop, emit, on } from "aion-engine";
import { direction, key } from "aion-input";
import {
  aionPreset,
  attachAnimationTo,
  centerCameraOnEntity,
  createTransform,
  defineAnimationConfig,
  translate,
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

    setBackgroundColor("black");

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
      states: {
        initial: {
          transform: {
            x: 0,
            y: 0,
            // rotation: 0,
          },
          // lerp: 0.25,
          time: 1,
        },
        right: {
          transform: {
            x: 50,
            y: 0,
            // rotation: 0,
          },
          // lerp: 0.25,
          time: 1,
        },
        up: {
          transform: {
            x: 50,
            y: -50,
            // rotation: 0,
          },
          // lerp: 0.25,
          time: 1,
        },
        upLeft: {
          transform: {
            x: 0,
            y: -50,
            // rotation: 0,
          },
          // lerp: 0.25,
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
