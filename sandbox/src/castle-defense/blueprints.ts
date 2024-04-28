import {
  useECS,
  exitCurrentScene,
  getMouseWorldPosition,
  setRuntimeBodyPosition,
  getBoundingBox,
  firstIntersectionWithRay,
  getRuntimeCollider,
  castShape,
  getWorldRotation,
  getRuntimeColliderShape,
  projectPoint,
  getMouseWorldX,
} from "aion-preset";
import { Entity } from "aion-ecs";
import { downDirection, vec } from "aion-core";
import { key, click } from "aion-input";

export function placeBluePrint(
  entity: Entity,
  construct: (x: number, y: number) => Entity,
) {
  const { remove } = useECS();

  // Let's start to cast shape from upper than the mouse so we are not blocked easily
  const position = vec(getMouseWorldX(), -10_000);

  const result = castShape(
    position,
    getWorldRotation(entity),
    downDirection(),
    getRuntimeColliderShape(entity),
    1000, // is this too much in term of perf ??
    true,
    undefined,
    undefined,
    getRuntimeCollider(entity),
  );

  // will only occur when building very very high structures
  if (result?.blocked) {
    console.warn("Blocked", "@todo : handle very hight structures");
    const hit = projectPoint(position, false);
    if (hit) {
      const nearestPointOnShapeLimit = castShape(
        hit.point,
        getWorldRotation(entity),
        downDirection(),
        getRuntimeColliderShape(entity),
        20,
        true,
        undefined,
        undefined,
        getRuntimeCollider(entity),
      );

      if (nearestPointOnShapeLimit) {
        setRuntimeBodyPosition(entity, nearestPointOnShapeLimit.point);
      }
    }
  } else if (result && !result.blocked) {
    setRuntimeBodyPosition(entity, result.point);

    if (click()) {
      construct(result.point.x, result.point.y);
    }
  }

  if (key("w")) {
    remove(entity);
    exitCurrentScene();
  }
}
