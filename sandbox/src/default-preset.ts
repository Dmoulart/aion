import { defineEngine } from "aion-engine";
import { AionPreset } from "aion-preset";

const engine = defineEngine([AionPreset()], () => {});

engine.run();
