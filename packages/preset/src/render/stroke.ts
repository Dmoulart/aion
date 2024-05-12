import type { Entity } from "aion-ecs";
import { Stroke } from "../components.js";

export function setStrokeColor(entity: Entity, color: string) {
  Stroke[entity] = color;
}
