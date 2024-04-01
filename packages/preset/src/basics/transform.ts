import { Transform } from "../components.js";
import { Vec, type Vector } from "aion-core";
import {
  getParentOf,
  getScaleX,
  getScaleY,
  getTranslation,
  hasParent,
  mat,
  type Matrix,
} from "../index.js";
import type { Entity } from "aion-ecs";

export type TransformData = Float32Array;

export function getTransform(entity: Entity) {
  return Transform[entity]!;
}

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

export const getLocalPosition = positionOf;

export function getWorldPosition(ent: Entity) {
  let parent = getParentOf(ent);

  if (parent) {
    const childMatrix = mat.clone(getLocalMatrix(ent)!) as Float32Array;

    while (parent) {
      let parentMatrix = getLocalMatrix(parent)!;
      mat.multiply(childMatrix, childMatrix, parentMatrix);
      parent = getParentOf(parent);
    }

    return getTranslation(childMatrix);
  }

  return getLocalPosition(ent);
}

export function getX(ent: Entity) {
  return Transform[ent]![4]!;
}

export function getY(ent: Entity) {
  return Transform[ent]![5]!;
}

export function getLocalMatrix(ent: Entity): Matrix | undefined {
  return Transform[ent];
}

export function setWorldRotation(ent: Entity, rad: number) {
  const transform = Transform[ent]!;

  // Extract the signs of the scaling factors
  //
  const scaleXSign = Math.sign(transform[0]!);
  const scaleYSign = Math.sign(transform[3]!);

  // Extract current translation components
  const tx = transform[4]!;
  const ty = transform[5]!;

  // Reset rotation component while preserving scale sign
  transform[0] = Math.cos(rad) * scaleXSign;
  transform[1] = -Math.sin(rad) * scaleYSign;
  transform[2] = Math.sin(rad) * scaleXSign;
  transform[3] = Math.cos(rad) * scaleYSign;

  // Restore scaling factors
  const newScaleX = getScaleX(transform);
  const newScaleY = getScaleY(transform);

  transform[0] = newScaleX * scaleXSign;
  transform[3] = newScaleY * scaleYSign;

  // Restore translation components
  transform[4] = tx;
  transform[5] = ty;
}

export function rotate(ent: Entity, rad: number) {
  mat.rotate(Transform[ent]!, Transform[ent]!, rad);
}

// In radians
export function rotationOf(ent: Entity) {
  const transform = Transform[ent]!;

  const a = transform[0]!;
  const b = transform[1]!;
  const c = transform[2]!;
  const d = transform[3]!;

  if (a || b) {
    const scaleX = getScaleX(transform);
    return b > 0 ? Math.acos(a / scaleX) : -Math.acos(a / scaleX);
  } else if (c || d) {
    const scaleY = getScaleY(transform);
    return (
      Math.PI * 0.5 - (d > 0 ? Math.acos(-c / scaleY) : -Math.acos(c / scaleY))
    );
  } else {
    return 0;
  }
}
export function getLocalRotation(ent: Entity): number {
  return getTransformRotation(Transform[ent]!);
}

export function getTransformRotation(transform: Float32Array) {
  // Extract the rotation component from the transformation matrix
  const a = transform[0]!;
  const b = transform[1]!;
  const c = transform[2]!;
  const d = transform[3]!;

  // Calculate the rotation angle based on the rotation component
  if (a || b) {
    return Math.atan2(b, a); // Return the angle in radians using arctan2
  } else if (c || d) {
    return Math.atan2(c, d); // Return the angle in radians using arctan2
  } else {
    return 0; // If there is no rotation component, return 0
  }
}

export function getWorldRotation(ent: Entity) {
  return rotationOf(ent);
}

export function scale(ent: Entity, x: number, y: number = x) {
  mat.scale(Transform[ent]!, Transform[ent]!, [x, y]);
}

export function flipX(ent: Entity) {
  scale(ent, -1, 1);
}

export function flipY(ent: Entity) {
  scale(ent, 1, -1);
}
