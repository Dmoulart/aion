import { ctx, useEngine } from "./ctx.js";

export function defineLoop(cb: () => void) {
  const engine = useEngine();

  engine.loop = () => {
    ctx.call(engine, cb);
  };
}

// export function onBoot(cb: () => void) {
//   const engine = useEngine();

//   engine.boot = cb;
// }
