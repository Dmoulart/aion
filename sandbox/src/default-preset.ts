import { defineEngine, defineLoop, emit, on, aionPreset } from "aion-engine";
import { getMouseX, getMouseY, click } from "aion-input";
import { clear, Colors } from "aion-render";

const engine = defineEngine(() => {
  const preset = aionPreset();

  const { createRect } = preset;

  const castle = createRect({
    Color: Colors["chestnut-rose:700"],
    Rect: {
      h: 100,
      w: 100,
    },
  });

  defineLoop(() => {
    emit("update");

    clear();
    emit("draw");
  });

  on("update", () => {
    const { Position, Rect } = useGame();

    Position.x[castle] = getMouseX();
    Position.y[castle] = getMouseY();

    if (click()) {
      createRect({
        Color: Colors["shamrock:800"],
        Rect: {
          h: Rect.h[castle],
          w: Rect.w[castle],
        },
      });
    }
  });

  return { ...preset };
});

const useGame = engine.use;

engine.run();
