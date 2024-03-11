import type { Engine } from "../engine.js";
import type { aionPreset } from "./index.js";

export type AionEngineContext = Engine & ReturnType<typeof aionPreset>;
