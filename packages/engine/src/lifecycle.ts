import { ctx, useEngine } from "./ctx.js";

export function defineLoop(loop: () => void) {
  const engine = useEngine();

  engine.loop = loop;
}
