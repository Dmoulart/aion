import { defineComponent, f32, i32 } from "aion-ecs";

export const Rect = defineComponent({ w: i32, h: i32 });

export const Circle = defineComponent({ r: i32 });

export const Stroke = defineComponent(() => new Array<string>());
export const Fill = defineComponent(() => new Array<string>());
