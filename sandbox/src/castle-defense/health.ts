import { Entity } from "aion-ecs";
import { Health } from "./components";

export function damage(entity: Entity, points: number) {
  Health[entity] -= points;
}

export function getHealth(entity: Entity) {
  return Health[entity]!;
}
