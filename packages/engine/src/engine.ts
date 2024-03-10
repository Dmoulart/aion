import { createRenderLoop } from "aion-render";
import { ctx } from "./ctx.js";

export interface Engine {
  events: Record<string, Array<() => void>>;
  run: () => void;
  loop: () => void;
}

export function defineEngine<T>(setup: () => T) {
  const engine: Engine = {
    events: { update: [] },
    run: createRenderLoop(DEFAULT_LOOP),
    loop: DEFAULT_LOOP,
  };

  function DEFAULT_LOOP() {
    engine.events.update?.forEach((cb) => cb());
  }

  ctx.call(engine, () => {
    setup();
  });

  return () => {
    engine.events.boot?.forEach((cb) => cb());
    engine.run();
  };
}
