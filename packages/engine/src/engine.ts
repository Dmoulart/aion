import { ctx } from "./ctx.js";
import { createEventEmitter, type EventEmitter } from "./event.js";

export interface BaseEngine {
  running: boolean;
  events: EventEmitter<BaseEvents>;
  loop: () => void;
  run: () => void;
  stop: () => void;
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

export type Plugin<T> = (engine: BaseEngine) => T;

export function defineEngine<T>(
  init: Plugin<T>,
  setup: () => void,
  options?: DefineEngineOptions,
): Engine<T> {
  const config = { ...DEFAULT_OPTIONS, ...(options ?? {}) };

  const beforeStartCallbacks: BeforeStartCallback[] = [];

  const baseEngine: BaseEngine = {
    running: false,
    events: createEventEmitter<BaseEvents>(),
    loop: () => baseEngine.events.emit("update"),
    beforeStart: (cb) => beforeStartCallbacks.push(cb),
    run() {
      const engine = this;
      engine.running = true;

      ctx.call(engine, () =>
        beforeStartCallbacks.forEach((cb) => cb(baseEngine)),
      );

      ctx.call(engine, setup);

      (function loop() {
        step();
        if (engine.running) {
          requestAnimationFrame(loop);
        }
      })();
    },
    stop: () => {
      engine.running = false;
    },
  };

  const plugins = ctx.call(baseEngine, () => init(baseEngine));

  const engineWithPlugins = Object.assign(baseEngine, plugins);

  const engine: Engine<T> = Object.assign(engineWithPlugins, {
    use: ctx.use as () => Engine<T>,
  });

  function step() {
    ctx.call(engine, engine.loop);
  }

  return engine;
}
