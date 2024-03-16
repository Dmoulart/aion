import type { Entity } from "aion-ecs";
import { Transform } from "../components.js";
import { Vec, type Vector } from "aion-core";
import { mat } from "../index.js";

// @todo: used when creating transform with prefab. Not optimized.
// we should be able to create a transform without instanciating a new array in prefabs.
export function createTransform(x: number, y: number): Float32Array {
  return mat.fromTranslation(mat.create(), [x, y]) as Float32Array;
}

export function setPosition(ent: Entity, pos: Vector) {
  const transform = Transform[ent]!;

  transform[4] = pos.x;
  transform[5] = pos.y;
}

export function getX(ent: Entity) {
  return Transform[ent]![4]!;
}

export function getY(ent: Entity) {
  return Transform[ent]![5]!;
}

export function positionOf(ent: Entity): Vector {
  const transform = Transform[ent]!;

  return new Vec(transform[4], transform[5]);
}
