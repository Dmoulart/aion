import { defineComponent, f32, i32, type Entity } from "aion-ecs";

export const Rect = defineComponent({ w: i32, h: i32 });

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

export const Circle = defineComponent({ r: i32 });

export const Stroke = defineComponent(() => new Array<string>());
export const Fill = defineComponent(() => new Array<string>());
