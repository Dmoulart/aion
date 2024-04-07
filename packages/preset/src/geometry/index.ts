import type { Entity } from "aion-ecs";
import { getPosition, getRectWorldBounds, getRectWidth } from "../index.js";
import { Vec } from "aion-core";

// export function
export function getRectWorldBottomCenter(entity: Entity, out = new Vec()) {
  const width = getRectWidth(entity);

  const { bottom, left } = getRectWorldBounds(entity);

  out.x = left + width / 2;
  out.y = bottom;

  return out;
}
