import { ctx } from "./ctx.js";
import { createEventEmitter, type EventEmitter } from "./event.js";

export interface Engine {
  events: EventEmitter<BaseEvents>;
  loop: () => void;
}

export type DefineEngineOptions = {
  //   withImplicitContext: boolean;
};

const DEFAULT_OPTIONS: DefineEngineOptions = {
  //   withImplicitContext: true,
};

type BaseEvents = { update: void; draw: void };

export function defineEngine<T>(
  setup: (engine: Engine) => T,
  options?: DefineEngineOptions,
) {
  options = { ...DEFAULT_OPTIONS, ...(options ?? {}) };

  function DEFAULT_LOOP() {
    engine.events.emit("update");
  }

  const engine: Engine = {
    events: createEventEmitter<BaseEvents>(),
    loop: DEFAULT_LOOP,
  };

  ctx.call(engine, () => setup(engine));

  const step = () => ctx.call(engine, engine.loop);

  return () => {
    (function loop() {
      step();

      requestAnimationFrame(loop);
    })();
  };
}
