import { useAion } from "./ctx.js";

export function useECS() {
  return useAion().$ecs;
}
