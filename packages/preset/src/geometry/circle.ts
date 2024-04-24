import type { Entity } from "aion-ecs";
import { Circle } from "../index.js";

export function getCircleRadius(entity: Entity) {
  return Circle.r[entity]!;
}
