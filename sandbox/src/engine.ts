import { defineEngine, defineLoop, emit, on } from "aion-engine";
import { getMouseX, getMouseY, initInputListener } from "aion-input";
import { initWindow } from "aion-render";
import { clear, circle, Colors } from "aion-render";

const run = defineEngine(() => {
  on("boot", () => {
    initWindow();
    initInputListener();
  });

  defineLoop(() => {
    clear();
    emit("draw");
  });

  on("draw", () => {
    circle(getMouseX(), getMouseY(), 100).fill(Colors["acapulco:500"]);
  });
});

run();
