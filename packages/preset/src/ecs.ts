import type { createECS } from "aion-ecs";
import { useAion } from "./ctx.js";

export function useECS(): ReturnType<typeof createECS> {
  return (useAion() as any).$ecs;
}
