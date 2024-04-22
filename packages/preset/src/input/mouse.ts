import { getMouse } from "aion-input";
import { screenToWorldPosition } from "../index.js";

export function getMouseWorldPosition() {
  return screenToWorldPosition(getMouse());
}
