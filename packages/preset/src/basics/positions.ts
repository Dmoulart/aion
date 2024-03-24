import { vec } from "aion-core";
import type { Entity } from "aion-ecs";
import { getWorldPosition } from "./transform.js";

export function getWorldDistance(a: Entity, b: Entity) {
  return vec(getWorldPosition(a)).sub(getWorldPosition(b));
}
