import { createECS } from "aion-ecs";
import { defineEngine, defineLoop, emit, on } from "aion-engine";
import { initRenderer, setupRenderer } from "aion-preset";
import { createScreen } from "aion-screen";

const renderer = await createScreen();

const engine = defineEngine(
  () => {},
  () => {
    setupRenderer(renderer);

    defineLoop(() => {
      emit("update");
      emit("draw");
    });

    const ecs = createECS();

    const entity = ecs.create();
    
    on("draw", () => {});
  }
);

engine.run();
