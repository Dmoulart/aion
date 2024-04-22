import type { Entity } from "aion-ecs";
import {
  getWorldPosition,
  getWorldDistance,
  usePhysics,
  getColliderEntity,
  getRuntimeColliderEntity,
} from "../index.js";
import {
  fromSimulationPoint,
  getPhysicsWorldPosition,
  toSimulationPoint,
} from "./bindings.js";
import { vec, type Vec, type Vector } from "aion-core";

export function castRay(
  from: Entity | Vector,
  to: Entity | Vector, // entity position or direction
  collisionGroup?: number,
  maxToi: number = 4,
) {
  const { world, RAPIER } = usePhysics();

  const fromEntity = typeof from === "number";
  const toEntity = typeof to === "number";

  const origin = fromEntity
    ? toSimulationPoint(getWorldPosition(from))
    : toSimulationPoint(from);

  let target: Vector;
  if (toEntity && fromEntity) {
    target = getWorldDistance(to, from).norm();
  } else if (toEntity) {
    target = getWorldPosition(to);
  } else {
    target = to;
  }

  const ray = new RAPIER.Ray(origin, target);
  const hit = world.castRay(ray, maxToi, false, undefined, collisionGroup);

  if (hit != null) {
    // The first collider hit has the handle `hit.colliderHandle` and it hit after
    // the ray travelled a distance equal to `ray.dir * toi`.
    let hitPoint = ray.pointAt(hit.toi); // Same as: `ray.origin + ray.dir * toi`

    return {
      point: fromSimulationPoint(hitPoint),
      entity: hit.collider.parent()!.userData as number,
    };
  }

  return undefined;
}

export function findPhysicalEntityInsideBoundingBox(
  position: Vector,
  width: number,
  height: number,
  predicate: (entity: Entity) => boolean,
) {
  const { world } = usePhysics();

  let entity: Entity = 0;

  world.collidersWithAabbIntersectingAabb(
    toSimulationPoint(position),
    toSimulationPoint(vec(width, height)),
    (collider) => {
      const owner = getRuntimeColliderEntity(collider);

      if (owner && predicate(owner)) {
        entity = owner;
        return false;
      }

      return true;
    },
  );

  return entity;
}
