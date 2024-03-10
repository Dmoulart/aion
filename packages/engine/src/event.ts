import { useEngine } from "./ctx.js";

export function on(hook: string, cb: () => void) {
  const engine = useEngine();

  engine.events[hook] ??= [];

  const i = engine.events[hook]!.push(cb);

  return function off() {
    //@todo holes in array not good for perf
    engine.events[hook]!.splice(i);
  };
}

export function once(hook: string, cb: () => void) {
  const engine = useEngine();

  engine.events[hook] ??= [];

  const i = engine.events[hook]!.push(() => {
    cb();
    engine.events[hook]!.splice(i);
  });
}

export function emit(hook: string) {
  const engine = useEngine();
  engine.events[hook]?.forEach((cb) => cb());
}
