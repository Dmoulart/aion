import { ctx } from "./ctx.js";
import { createEventEmitter, type EventEmitter } from "./event.js";
import {
  defineModule,
  type ConcatenatedPluginArrayReturnType,
  type Plugin,
} from "./modules.js";
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

export function defineEngine<T extends Array<Plugin>>(
  plugins: T,
  setup: () => void,
  options?: DefineEngineOptions
): Engine<ConcatenatedPluginArrayReturnType<T>> {
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
        beforeStartCallbacks.forEach((cb) => cb(baseEngine))
      );

      ctx.call(engine, setup);

      (function loop() {
        if (engine.running) {
          step();
          requestAnimationFrame(loop);
        }
      })();
    },
    stop: () => {
      engine.running = false;
    },
  };

  const pluginsData = ctx.call(baseEngine, () => {
    const moduleData = {} as ConcatenatedPluginArrayReturnType<T>;

    for (const plugin of plugins) {
      Object.assign(moduleData as any, plugin());
    }

    return moduleData;
  });

  const engineWithPlugins = Object.assign(baseEngine, pluginsData);

  const engine = Object.assign(engineWithPlugins, {
    use: ctx.use as () => Engine<ConcatenatedPluginArrayReturnType<T>>,
  });

  function step() {
    ctx.call(engine, engine.loop);
  }

  return engine;
}

// const module = defineModule({
//   ecs: (engine, options: { gravity: number }) => {
//     return "prout" as const;
//   },
// });

// const e = defineEngine(
//   [
//     () => {
//       return { ok: "test" };
//     },
//     module({
//       ecs: {
//         gravity: 1,
//       },
//     }),
//   ],
//   () => {
//     const g = useGame();
//   }
// );
// const useGame = e.use;
