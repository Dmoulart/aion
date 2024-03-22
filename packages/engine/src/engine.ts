import { ctx } from "./ctx.js";
import { createEventEmitter, type EventEmitter } from "./event.js";

export interface BaseEngine {
  events: EventEmitter<BaseEvents>;
  loop: () => void;
  run: () => void;
  beforeStart: (cb: BeforeStartCallback) => void;
}

export type BeforeStartCallback = (cb: BaseEngine) => void;

export type DefineEngineOptions = {
  //   withImplicitContext: boolean;
};

const DEFAULT_OPTIONS: DefineEngineOptions = {
  //   withImplicitContext: true,
};

export type BaseEvents = { update: void; draw: void };

export type Engine<T = BaseEngine> = BaseEngine & T & { use: () => Engine<T> };

export function defineEngine<T>(
  init: (engine: BaseEngine) => T,
  setup: () => void,
  options?: DefineEngineOptions,
): Engine<T> {
  const config = { ...DEFAULT_OPTIONS, ...(options ?? {}) };

  const beforeStartCallbacks: BeforeStartCallback[] = [];

  const baseEngine: BaseEngine = {
    events: createEventEmitter<BaseEvents>(),
    loop: () => baseEngine.events.emit("update"),
    run: () => {
      (function loop() {
        step();

        requestAnimationFrame(loop);
      })();
    },
    beforeStart: (cb) => beforeStartCallbacks.push(cb),
  };

  const plugins = ctx.call(baseEngine, () => init(baseEngine));

  const engineWithPlugins = Object.assign(baseEngine, plugins);

  const engine: Engine<T> = Object.assign(engineWithPlugins, {
    use: ctx.use as () => Engine<T>,
  });

  ctx.call(engine, () => beforeStartCallbacks.forEach((cb) => cb(baseEngine)));

  ctx.call(engine, setup);

  function step() {
    ctx.call(engine, engine.loop);
  }

  return engine;
}
