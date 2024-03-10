import { useEngine } from "./ctx.js";

export function on(hook: string, cb: () => void) {
  const engine = useEngine();

  engine.events[hook] ??= [];

  const i = engine.events[hook]!.push(cb);

  return function off() {
    engine.events[hook]!.splice(i);
  };
}
