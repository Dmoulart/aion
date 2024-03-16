import { Transform } from "../components.js";
import { Vec, type Vector } from "aion-core";
import { mat } from "../index.js";
import type { Entity } from "aion-ecs";

// @todo:perf used when creating transform with prefab. Not optimized.
// we should be able to create a transform without instanciating a new array in prefabs.
export function createTransform(x: number, y: number): Float32Array {
  return mat.fromTranslation(mat.create(), [x, y]) as Float32Array;
}

export function setPosition(ent: Entity, pos: Vector) {
  const transform = Transform[ent]!;

  transform[4] = pos.x;
  transform[5] = pos.y;
}

export function translate(ent: Entity, distance: Vector) {
  // @todo:perf object to array
  mat.translate(Transform[ent]!, Transform[ent]!, [distance.x, distance.y]);
}

export function positionOf(ent: Entity): Vector {
  const transform = Transform[ent]!;

  return new Vec(transform[4], transform[5]);
}

export function getX(ent: Entity) {
  return Transform[ent]![4]!;
}

export function getY(ent: Entity) {
  return Transform[ent]![5]!;
}

export function setRotation(ent: Entity, rad: number) {
  const transform = Transform[ent]!;

  //@todo:perf directly set the rotation ? is this even possible ?
  const tx = transform[4]!;
  const ty = transform[5]!;

  mat.identity(transform);

  mat.rotate(transform, transform, rad);

  // Restore translation components
  transform[4] = tx;
  transform[5] = ty;
}

export function rotate(ent: Entity, rad: number) {
  mat.rotate(Transform[ent]!, Transform[ent]!, rad);
}

export function scale(ent: Entity, by: number) {
  mat.scale(Transform[ent]!, Transform[ent]!, [by, by]);
}
