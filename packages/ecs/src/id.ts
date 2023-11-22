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
