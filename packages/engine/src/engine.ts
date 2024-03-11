import type { UseContext } from "unctx";
import { ctx } from "./ctx.js";
import { createEventEmitter, type EventEmitter } from "./event.js";

export interface BaseEngine {
  events: EventEmitter<BaseEvents>;
  loop: () => void;
  run: () => void;
}

export type DefineEngineOptions = {
  //   withImplicitContext: boolean;
};

const DEFAULT_OPTIONS: DefineEngineOptions = {
  //   withImplicitContext: true,
};

export type BaseEvents = { update: void; draw: void };

export type Engine<T = BaseEngine> = BaseEngine & T & { use: () => Engine<T> };

export function defineEngine<T>(
  setup: (engine: BaseEngine) => T,
  options?: DefineEngineOptions,
): Engine<T> {
  const config = { ...DEFAULT_OPTIONS, ...(options ?? {}) };

  const baseEngine: BaseEngine = {
    events: createEventEmitter<BaseEvents>(),
    loop: () => baseEngine.events.emit("update"),
    run: () => {
      (function loop() {
        step();

        requestAnimationFrame(loop);
      })();
    },
  };

  const plugins = ctx.call(baseEngine, () => setup(baseEngine));

  const engineWithPlugins = Object.assign(baseEngine, plugins);

  const engine: Engine<T> = Object.assign(engineWithPlugins, {
    use: ctx.use as () => Engine<T>,
  });

  function step() {
    ctx.call(engine, engine.loop);
  }

  return engine;
}
