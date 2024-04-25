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
} from "aion-preset";
import { Entity } from "aion-ecs";
import { downDirection, upDirection } from "aion-core";
import { key, click } from "aion-input";

export function placeBluePrint(
  entity: Entity,
  construct: (x: number, y: number) => Entity,
) {
  const { remove } = useECS();

  const result = castRay(
    getMouseWorldPosition(),
    downDirection(),
    undefined,
    20,
    getRuntimeCollider(entity),
  );
  // const result = castEntityShapeFrom(
  //   getMouseWorldPosition(),
  //   entity,
  //   downDirection(),
  //   50,
  // );

  console.log(result?.entity);

  // const intersect = someIntersectingEntities(entity, (entity) => {
  //   return !has(Floor, entity);
  // });
  // console.log({ intersect });
  // console.log(intersect);

  // console.log(result);

  if (result && result.toi > 0) {
    const bbox = getBoundingBox(entity);
    result.point.y -= bbox.getHalfHeight();

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
