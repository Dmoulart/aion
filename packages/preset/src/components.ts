import { defineComponent, f64, i32 } from "aion-ecs";

export const Position = defineComponent({ x: i32, y: i32 });

export const Transform = defineComponent([f64, 9]);

export const Velocity = defineComponent({ x: i32, y: i32 });

export const Rect = defineComponent({ w: i32, h: i32 });

export const Circle = defineComponent({ r: i32 });

export const Stroke = defineComponent(() => new Array<string>());
export const Fill = defineComponent(() => new Array<string>());
