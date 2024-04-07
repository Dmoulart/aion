import type { Entity } from "aion-ecs";
import { Rect } from "../components.js";
import { getWorldPosition } from "./transform.js";

export function getRectWorldBounds(entity: Entity) {
  const position = getWorldPosition(entity);

  const width = Rect.w[entity]!;
  const height = Rect.h[entity]!;

  return {
    left: position.x - width / 2,
    right: position.x + width / 2,
    top: position.y - height / 2,
    bottom: position.y + height / 2,
  };
}
