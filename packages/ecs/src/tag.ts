import { nextID } from "./id.js";

export function createTag() {
  return nextID();
}
