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
import { vec, type Vector } from "aion-core";
import type {
  QueryFilterFlags,
  RayColliderIntersection,
} from "@dimforge/rapier2d-compat";

export function intersectionsWithRay(
  from: Entity | Vector,
  to: Entity | Vector, // entity position or direction
  cb: (entity: Entity, intersection: RayColliderIntersection) => boolean,
  maxToi: number = 4,
):
  | (RayColliderIntersection & { entity: Entity; hitPoint: Vector })
  | undefined {
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

  let result:
    | (RayColliderIntersection & { entity: Entity; hitPoint: Vector })
    | undefined = undefined;

  world.intersectionsWithRay(ray, maxToi, false, (intersection) => {
    const entity = getColliderEntity(intersection.collider.handle);
    if (cb(entity, intersection)) {
      result = intersection as any;
      (result as any).entity = entity;
      (result as any).hitPoint = fromSimulationPoint(
        ray.pointAt(intersection.toi),
      );
      return false;
    }

    return true;
  });

  return result;
}

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
  predicate: (entity: Entity) => boolean = () => true,
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

export function projectPoint(
  position: Vector,
  predicate?: (entity: Entity) => boolean,
  filterFlags?: QueryFilterFlags,
  filterGroups?: number,
) {
  const { world } = usePhysics();

  const hit = world.projectPoint(
    toSimulationPoint(position),
    false,
    filterFlags,
    filterGroups,
    undefined,
    undefined,
    predicate
      ? (collider) => {
          const entity = getRuntimeColliderEntity(collider);

          if (entity) {
            return predicate(entity);
          }

          return false;
        }
      : undefined,
  );

  if (hit) {
    const entity = getRuntimeColliderEntity(hit.collider);

    return { entity, point: fromSimulationPoint(hit.point) };
  }

  return undefined;
}
