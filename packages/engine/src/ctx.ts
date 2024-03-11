import { createContext } from "unctx";
import type { BaseEngine } from "./engine.js";

export const ctx = createContext<BaseEngine>();

export const useEngine = ctx.use;
