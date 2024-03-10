import { ctx } from "./ctx.js";

export interface Engine {
  events: Record<string, Array<() => void>>;
  loop: () => void;
}

export type DefineEngineOptions = {
  withImplicitContext: boolean;
};

const DEFAULT_OPTIONS: DefineEngineOptions = {
  withImplicitContext: true,
};

export function defineEngine<T>(
  setup: (engine: Engine) => T,
  options?: DefineEngineOptions
) {
  options = { ...DEFAULT_OPTIONS, ...(options ?? {}) };

  function DEFAULT_LOOP() {
    engine.events.update?.forEach((cb) => cb());
  }

  const engine: Engine = {
    events: {},
    loop: DEFAULT_LOOP,
  };

  if (options?.withImplicitContext) {
    ctx.call(engine, () => setup(engine));
  } else {
    setup(engine);
  }

  const callLoop = options?.withImplicitContext
    ? () => ctx.call(engine, engine.loop)
    : engine.loop;

  return () => {
    engine.events.boot?.forEach((cb) => cb());

    (function loop() {
      callLoop();

      requestAnimationFrame(loop);
    })();
  };
}
