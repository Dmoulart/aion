import type { Entity } from "aion-ecs";
import { Rect, Transform } from "../components.js";
import { positionOf } from "./transform.js";

export function getRectBounds(entity: Entity) {
  const position = positionOf(entity);

  const width = Rect.w[entity]!;
  const height = Rect.h[entity]!;

  return {
    left: position.x - width / 2,
    right: position.x + width / 2,
    top: position.y - height / 2,
    bottom: position.y + height / 2,
  };
}
