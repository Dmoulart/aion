import {
  useECS,
  exitCurrentScene,
  getMouseWorldPosition,
  setRuntimeBodyPosition,
  getBoundingBox,
  firstIntersectionWithRay,
  castEntityShape,
  castEntityShapeFrom,
  castRay,
  getRuntimeCollider,
  getRuntimeBody,
  castShape,
  usePhysics,
  getWorldRotation,
  fromSimulationPoint,
  getWorldPosition,
} from "aion-preset";
import { Entity } from "aion-ecs";
import { Vec, downDirection, upDirection } from "aion-core";
import { key, click } from "aion-input";
import { once } from "aion-engine";
import { circle } from "aion-render";
import { getFloor } from "./floor";

export function placeBluePrint(
  entity: Entity,
  construct: (x: number, y: number) => Entity,
) {
  const { remove } = useECS();
  const { RAPIER } = usePhysics();

  // const result = castRay(
  //   getMouseWorldPosition(),
  //   downDirection(),
  //   undefined,
  //   20,
  //   getRuntimeCollider(entity),
  // );

  const result = castShape(
    getMouseWorldPosition(),
    getWorldRotation(entity),
    new Vec(0, 1),
    getRuntimeCollider(entity).shape,
    20,
    true,
    undefined,
    undefined,
    getRuntimeCollider(entity),
  );

  if (result && !result.blocked) {
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

export function placeBluePrint2(
  entity: Entity,
  construct: (x: number, y: number) => Entity,
) {
  const { remove } = useECS();

  const hit = firstIntersectionWithRay(
    getMouseWorldPosition(),
    downDirection(),
    220,
  );

  // const hit = castRay(
  //   getMouseWorldPosition(),
  //   downDirection(),
  //   4,
  //   ENEMY_COLLISION_GROUP,
  // );
  console.log(hit?.entity);
  // console.log(hit);

  if (hit) {
    const bbox = getBoundingBox(entity);
    hit.point.y -= bbox.getHalfHeight();

    setRuntimeBodyPosition(entity, hit.point);

    if (click()) {
      construct(hit.point.x, hit.point.y);
    }
  }

  // if (result) {
  //   const { point } = result;

  //   point.y -= getBoundingBox(entity).halfHeight();

  //   setRuntimeBodyPosition(entity, point);

  //   if (click()) {
  //     construct(point.x, point.y);
  //   }
  // }

  if (key("w")) {
    remove(entity);
    exitCurrentScene();
  }
}
