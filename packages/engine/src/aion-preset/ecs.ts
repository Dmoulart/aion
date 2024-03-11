import { useEngine } from "../ctx.js";
import { type AionEngineContext } from "./ctx.js";

export const useAion = useEngine<AionEngineContext>;

export function useECS() {
  return useAion().$ecs;
}
