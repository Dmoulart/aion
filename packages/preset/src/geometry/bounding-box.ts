import type { Entity } from "aion-ecs";
import { Rect, Circle } from "../components.js";
import { getCircleRadius } from "./circle.js";
import { getRectWidth, getRectHeight } from "./rect.js";
import {
  BoundingBox,
  createRectangleBoundingBox,
  createCircleBoundingBox,
} from "aion-core";
import { useECS } from "../ecs.js";

/**
 * Generate a new bounding box from the given shape.
 *
 * @param shape
 * @returns shape's bounding box
 */
export function getBoundingBox(entity: Entity): BoundingBox {
  const { has } = useECS();
  const bbox = new BoundingBox();

  for (const shape of [Rect, Circle]) {
    switch (shape) {
      case Rect: {
        if (has(Rect, entity)) {
          bbox.union(
            createRectangleBoundingBox(
              getRectWidth(entity),
              getRectHeight(entity),
            ),
            bbox,
          );
        }
        break;
      }
      case Circle: {
        if (has(Circle, entity)) {
          bbox.union(createCircleBoundingBox(getCircleRadius(entity)), bbox);
        }
        break;
      }
      default:
        throw new Error("Creating a bounding box from an unknown shape");
    }
  }

  return bbox;
}
