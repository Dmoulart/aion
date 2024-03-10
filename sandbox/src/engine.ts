import { defineEngine, on } from "aion-engine";
import { getMouseX, getMouseY, initInputListener } from "aion-input";
import { initWindow } from "aion-render";
import * as r from "aion-render";

const run = defineEngine(() => {
  on("boot", () => {
    initWindow();
    initInputListener();
  });

  on("update", () => {
    r.circle(getMouseX(), getMouseY(), 100).fill("blue");
  });
});

run();
