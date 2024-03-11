import { createContext } from "unctx";
import type { BaseEngine } from "./engine.js";

export const ctx = createContext<BaseEngine>();

// Find a way to not wrap use maybe ?
export const useEngine = <T extends BaseEngine>(): T => ctx.use() as T;
