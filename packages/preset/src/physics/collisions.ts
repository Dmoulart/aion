import type { Entity } from "aion-ecs";
import { useECS } from "../ecs.js";
import { Collision } from "./components.js";
import { usePhysics } from "./init.js";

export function getCollidedEntity(entity: Entity) {
  return Collision.with[entity]!;
}

export function handleCollisionEvent(
  handle1: number,
  handle2: number,
  started: boolean,
) {
  // maybe it's stupid to put this in a hot path... Got to think more
  const { world } = usePhysics();
  const { attach, detach } = useECS();

  const colliderA = world.getCollider(handle1);
  const colliderB = world.getCollider(handle2);

  const bodyA = colliderA.parent();
  const bodyB = colliderB.parent();

  const entityA = bodyA?.userData as Entity;
  const entityB = bodyB?.userData as Entity;

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
