import { createRenderLoop } from "aion-render";
import { ctx } from "./ctx.js";

export interface Engine {
  events: Record<string, Array<() => void>>;
  loop: () => void;
}

export function defineEngine<T>(setup: () => T) {
  function DEFAULT_LOOP() {
    ctx.call(engine, () => {
      engine.events.update?.forEach((cb) => cb());
    });
  }

  const engine: Engine = {
    events: {},
    loop: DEFAULT_LOOP,
  };

  ctx.call(engine, () => {
    setup();
  });

  return () => {
    engine.events.boot?.forEach((cb) => cb());

    (function loop() {
      engine.loop();
      requestAnimationFrame(loop);
    })();
  };
}
