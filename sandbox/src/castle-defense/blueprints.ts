import {
  useECS,
  exitCurrentScene,
  getMouseWorldPosition,
  intersectionsWithRay,
  setRuntimeBodyPosition,
  getBoundingBox,
  firstIntersectionWithRay,
  castRay,
} from "aion-preset";
import { Entity } from "aion-ecs";
import { downDirection } from "aion-core";
import { key, click } from "aion-input";

export function placeBluePrint(
  entity: Entity,
  construct: (x: number, y: number) => Entity,
) {
  const { remove } = useECS();

  const intersection = intersectionsWithRay(
    getMouseWorldPosition(),
    downDirection(),
    (collided) => collided !== entity,
    20,
  );
  console.log("----");
  const nearest = castRay(getMouseWorldPosition(), downDirection(), 120);
  console.log("first intersection", nearest);
  console.log("----");

  if (intersection) {
    const bbox = getBoundingBox(entity);
    intersection.point.y -= bbox.getHalfHeight();

    setRuntimeBodyPosition(entity, intersection.point);

    if (click()) {
      construct(intersection.point.x, intersection.point.y);
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
