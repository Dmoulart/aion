import { defineEngine, defineLoop, emit, on } from "aion-engine";
import { direction, getMouse, key } from "aion-input";
import {
  addChildTo,
  aionPreset,
  centerCameraOnEntity,
  createTransform,
  rotate,
  screenToWorldPosition,
  setPosition,
  setWorldPosition,
  translate,
  zoomBy,
} from "aion-preset";
import { Colors, setBackgroundColor } from "aion-render";

const engine = defineEngine(
  () =>
    aionPreset({
      debugEntityID: true,
    }),
  () => {
    const { $camera, createRect } = useGame();

    setBackgroundColor(Colors["acapulco:400"]);

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
      Fill: Colors["shamrock:600"],
      Stroke: "black",
      Rect: {
        w: 100,
        h: 100,
      },
    });

    centerCameraOnEntity(witness);

    const rect = createRect({
      Transform: createTransform(0, 0),
      Fill: Colors["equator:200"],
      Stroke: "black",
      Rect: {
        w: 50,
        h: 50,
      },
    });

    const child = createRect({
      Transform: createTransform(125, 125),
      Fill: Colors["rhino:800"],
      Stroke: "black",
      Rect: {
        w: 25,
        h: 25,
      },
    });

    const grandChild = createRect({
      Transform: createTransform(45, 45),
      Fill: Colors["picton-blue:800"],
      Stroke: "black",
      Rect: {
        w: 45,
        h: 45,
      },
    });

    addChildTo(rect, child);
    addChildTo(child, grandChild);

    on("update", () => {
      const mouse = screenToWorldPosition(getMouse());

      setWorldPosition(rect, mouse);

      rotate(rect, 0.0125);
      rotate(child, 0.025);
      rotate(grandChild, 0.035);
    });
  },
);

const useGame = engine.use;

engine.run();
