import { assertEmpty } from "./assert.js";
// @todo: use unctx ?
declare global {
  var __AION__NAMESPACES: Record<string, any>;
}

globalThis.__AION__NAMESPACES = {};

let currentNamespace: string;

export function createNamespace<T>(namespace: string): T {
  assertEmpty(globalThis.__AION__NAMESPACES[namespace]);

  globalThis.__AION__NAMESPACES[namespace] = undefined;

  return {
    get() {
      return globalThis.__AION__NAMESPACES[namespace];
    },
    set(value: T) {
      globalThis.__AION__NAMESPACES[namespace] = value;
    },
  } as T;
}

export function usingNamespace(namespace: string) {}
