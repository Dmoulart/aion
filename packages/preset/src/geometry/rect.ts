import type { Entity } from "aion-ecs";
import { Rect, getWorldPosition } from "../index.js";
import { Vec } from "aion-core";

// export function
export function getRectWorldBottomCenter(entity: Entity, out = new Vec()) {
  const width = getRectWidth(entity);

  const { bottom, left } = getRectWorldBounds(entity);

  out.x = left + width / 2;
  out.y = bottom;

  return out;
}

export function getRectWidth(entity: Entity) {
  return Rect.w[entity]!;
}

export function getRectHalfWidth(entity: Entity) {
  return Rect.w[entity]! / 2;
}

export function getRectHeight(entity: Entity) {
  return Rect.h[entity]!;
}

export function getRectHalfHeight(entity: Entity) {
  return Rect.h[entity]! / 2;
}

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
