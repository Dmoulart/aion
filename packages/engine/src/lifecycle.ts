import { useEngine } from "./ctx.js";

export function defineLoop(loop: () => void) {
  const engine = useEngine();

  engine.loop = loop;
}

// Make event listeners available in implicit context
export const on: ReturnType<typeof useEngine>["events"]["on"] = (hook, cb) => {
  return useEngine().events.on(hook, cb);
};

export const once: ReturnType<typeof useEngine>["events"]["once"] = (
  hook,
  cb
) => {
  return useEngine().events.once(hook, cb);
};

export const emit: ReturnType<typeof useEngine>["events"]["emit"] = (
  hook,
  params
) => {
  return useEngine().events.emit(hook, params);
};

export const off: ReturnType<typeof useEngine>["events"]["off"] = (
  hook,
  cb
) => {
  return useEngine().events.off(hook, cb);
};
