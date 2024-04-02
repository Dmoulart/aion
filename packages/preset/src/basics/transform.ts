import { defineComponent, f32 } from "aion-ecs";

// 0: scaleX, 1: scaleY, 2: rotation, 3: tx, 4:ty
//
export const Transform = defineComponent([f32, 5]);
export type Transform = Float32Array;

export function getTransformMatrix(transform: Transform);
