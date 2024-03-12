import { defineEngine, defineLoop, emit, on, aionPreset } from "aion-engine";
import { getMouseX, getMouseY, click } from "aion-input";
import { clear } from "aion-render";

const engine = defineEngine(() => {
  const preset = aionPreset();

  const { createRect } = preset;

  const castle = createRect({
    Rect: {
      h: 100,
      w: 100,
    },
    Fill: "red",
    Stroke: "white",
  });

  defineLoop(() => {
    emit("update");

    clear();
    emit("draw");
  });

  on("update", () => {
    const { Position, Rect } = useGame();

    const x = getMouseX() - Rect.w[castle] / 2;
    const y = getMouseY() - Rect.h[castle] / 2;

    Position.x[castle] = x;
    Position.y[castle] = y;

    if (click()) {
      createRect({
        Position: {
          x,
          y,
        },
        Rect: {
          h: Rect.h[castle],
          w: Rect.w[castle],
        },
        Fill: "green", // shared state
        Stroke: "white",
      });
    }
  });

  return { ...preset };
});

const useGame = engine.use;

engine.run();
