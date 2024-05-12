import { type Engine, useEngine } from "aion-engine";
import type { AionPreset } from "./index.js";

export type AionEngineContext = Engine & ReturnType<typeof AionPreset>;

export const useAion = useEngine<AionEngineContext>;
