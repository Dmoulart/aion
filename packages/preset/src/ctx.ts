import { type Engine, useEngine } from "aion-engine";
import type { aionPreset } from "./index.js";

export type AionEngineContext = Engine & ReturnType<typeof aionPreset>;

export const useAion = useEngine<AionEngineContext>;
