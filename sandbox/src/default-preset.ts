import { defineEngine, on } from "aion-engine";
import {
  AionPreset,
  createTransform,
  getMouseWorldPosition,
  rotate,
  setPosition,
  useECS,
} from "aion-preset";

const engine = defineEngine([AionPreset({})], () => {
  const { createRect } = useECS();

  const rect = createRect({
    Transform: createTransform(0, 0),
    Fill: "blue",
    Rect: {
      w: 50,
      h: 50,
    },
    Stroke: "black",
  });

  on("update", () => {
    setPosition(rect, getMouseWorldPosition());
    rotate(rect, 0.01);
  });
});

const useGame = engine.use;

engine.run();
