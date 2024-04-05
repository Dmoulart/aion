import { defineEngine, defineLoop, emit, on } from "aion-engine";
import { direction, getMouse, key } from "aion-input";
import {
  addChildTo,
  aionPreset,
  centerCameraOnEntity,
  createTransform,
  rotate,
  screenToWorldPosition,
  setWorldPosition,
  translate,
  traverseChildren,
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

    setBackgroundColor(Colors["mine-shaft:950"]);

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

    let parent = rect;

    for (let i = 0; i < 900; i++) {
      const child = createRect({
        Transform: createTransform(50 + i * 5, 50 + i * 5),
        Fill: "white",
        Stroke: "black",
        Rect: {
          w: 25,
          h: 25,
        },
      });

      addChildTo(parent, child);

      parent = child;
    }

    on("update", () => {
      const mouse = screenToWorldPosition(getMouse());

      setWorldPosition(rect, mouse);

      rotate(rect, 0.0125);

      traverseChildren(rect, (child) => {
        rotate(child, 0.00125);
      });
    });
  },
);

const useGame = engine.use;

engine.run();
