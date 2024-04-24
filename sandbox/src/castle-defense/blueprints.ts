import {
  useECS,
  castRay,
  exitCurrentScene,
  getMouseWorldPosition,
  getRectHalfHeight,
  setRuntimeBodyPosition,
  getBoundingBox,
  intersectionsWithRay,
} from "aion-preset";
import { Entity } from "aion-ecs";
import { downDirection } from "aion-core";
import { key, click } from "aion-input";
import { Floor } from "./components";

export function placeBluePrint(
  entity: Entity,
  construct: (x: number, y: number) => Entity,
) {
  const { remove, has } = useECS();

  const result = castRay(
    getMouseWorldPosition(),
    downDirection(),
    undefined,
    140,
  );

  const r = intersectionsWithRay(
    getMouseWorldPosition(),
    downDirection(),
    (entity) => has(Floor, entity),
  );

  console.log({ r });

  if (result) {
    const { point } = result;

    point.y -= getBoundingBox(entity).halfHeight();

    setRuntimeBodyPosition(entity, point);

    if (click()) {
      construct(point.x, point.y);
    }
  }

  if (key("w")) {
    remove(entity);
    exitCurrentScene();
  }
}
