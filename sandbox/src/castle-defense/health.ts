import { Entity } from "aion-ecs";
import { Health } from "./components";
import { useECS } from "aion-preset";

export function damage(entity: Entity, points: number) {
  const { remove } = useECS();
  Health[entity] -= points;

  if (Health[entity] <= 0) {
    remove(entity);
  }
}

export function getHealth(entity: Entity) {
  return Health[entity]!;
}
