import { getMouse } from "aion-input";
import { screenToWorldPosition } from "../index.js";

export function getMouseWorldPosition() {
  return screenToWorldPosition(getMouse());
}

export function getMouseWorldX() {
  return screenToWorldPosition(getMouse()).x;
}

export function getMouseWorldY() {
  return screenToWorldPosition(getMouse()).y;
}
