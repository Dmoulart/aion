import type { ID } from "./entity.js";

/**
 * The global ID cursor
 */
export let cursor = 0;

export function nextID() {
  return ++cursor;
}

export function resetIDCursor() {
  cursor = 0;
}

/**
 * Get the low part of an identifier
 * @param id
 * @returns low part of the identifier
 */
export const lo = (id: ID) => id & ((1 << 20) - 1);

/**
 * Get the high part of an identifier
 * @param id
 * @returns high part of an indentifier
 */
export const hi = (id: ID) => (id >> 20) & ((1 << 20) - 1);

/**
 * Combine two ids to make a pair.
 * @param a
 * @param b
 * @returns id as pair
 */
export const pair = (a: ID, b: ID) => (a << 20) | b;
