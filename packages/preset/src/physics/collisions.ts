import type { Entity } from "aion-ecs";
import { useECS } from "../ecs.js";
import { Collision } from "./components.js";
import { usePhysics } from "./init.js";
import { getColliderEntity } from "./colliders.js";

export function getCollidingEntity(entity: Entity) {
  return Collision.with[entity]!;
}

export function handleCollisionEvent(
  handle1: number,
  handle2: number,
  started: boolean,
) {
  // maybe it's stupid to put this in a hot path... Got to think more
  const { attach, detach } = useECS();

  const entityA = getColliderEntity(handle1);
  const entityB = getColliderEntity(handle2);

  if (entityA && entityB) {
    if (started) {
      Collision.with[entityA] = entityB;
      Collision.with[entityB] = entityA;
    } else {
      Collision.with[entityA] = 0;
      Collision.with[entityB] = 0;
    }
  }

  if (entityA) {
    if (started) {
      attach(Collision, entityA);
    } else {
      detach(Collision, entityA);
    }
  }

  if (entityB) {
    if (started) {
      attach(Collision, entityB);
    } else {
      detach(Collision, entityB);
    }
  }
}
