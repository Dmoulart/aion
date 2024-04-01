import type { Entity } from "aion-ecs";
import { getWorldPosition, getWorldDistance, usePhysics } from "../index.js";
import { fromSimulationPoint, toSimulationPoint } from "./bindings.js";

export function castRay(
  from: Entity,
  to: Entity,
  collisionGroup?: number,
  maxToi: number = 4,
) {
  console.log({ from, to });
  const { world, RAPIER } = usePhysics();
  const source = toSimulationPoint(getWorldPosition(from));
  const target = getWorldDistance(to, from).norm();
  const ray = new RAPIER.Ray(source, target);

  const hit = world.castRay(
    ray,
    maxToi,
    false,
    undefined,
    collisionGroup, // don't intersect with enemies'
  );

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
