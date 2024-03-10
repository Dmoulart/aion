import { assertEmpty } from "./assert.js";

declare global {
  var __AION__NAMESPACES: Record<string, any>;
}

globalThis.__AION__NAMESPACES = {};

export function createNamespace<Global>(namespace: string): Global {
  assertEmpty(globalThis.__AION__NAMESPACES[namespace]);

  globalThis.__AION__NAMESPACES[namespace] = {};

  return undefined as Global;
}

export function using(namespace: string) {}
