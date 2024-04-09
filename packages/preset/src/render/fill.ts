import type { Entity } from "aion-ecs";
import { Fill } from "../components.js";

export function setFillColor(entity: Entity, color: string) {
  Fill[entity] = color;
}
