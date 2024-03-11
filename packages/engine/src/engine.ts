import { ctx } from "./ctx.js";
import { createEventEmitter, type EventEmitter } from "./event.js";

export interface BaseEngine {
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
  setup: (engine: BaseEngine) => T,
  options?: DefineEngineOptions,
) {
  const config = { ...DEFAULT_OPTIONS, ...(options ?? {}) };

  const engine: BaseEngine = {
    events: createEventEmitter<BaseEvents>(),
    loop: () => engine.events.emit("update"),
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
