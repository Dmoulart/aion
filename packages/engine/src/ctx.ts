import { createContext } from "unctx";
import type { Engine } from "./engine.js";

export const ctx = createContext<Engine>();

export const useEngine = ctx.use;
