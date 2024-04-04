import { defineEngine, defineLoop, emit, on } from "aion-engine";
import { direction, getMouse, key } from "aion-input";
import {
  aionPreset,
  centerCameraOnEntity,
  createTransform,
  setPosition,
  translate,
  zoomBy,
} from "aion-preset";
import { setBackgroundColor } from "aion-render";

const engine = defineEngine(
  () =>
    aionPreset({
      debugEntityID: true,
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

    const witness = createRect({
      Transform: createTransform(500, 500),
      Fill: "blue",
      Stroke: "black",
      Rect: {
        w: 100,
        h: 100,
      },
    });

    centerCameraOnEntity(witness);

    const rect = createRect({
      Transform: createTransform(0, 0),
      Fill: "blue",
      Stroke: "black",
      Rect: {
        w: 50,
        h: 50,
      },
    });

    on("update", () => {
      const mouse = getMouse();

      console.log(mouse);

      setPosition(rect, mouse);
    });
  },
);

const useGame = engine.use;

engine.run();
