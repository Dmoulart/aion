import { Vec, type Vector } from "aion-core";
import { defineComponent, f32, type Entity } from "aion-ecs";
import {
  createIdentityMatrix,
  getMatrixRotation,
  getParentOf,
  multiplyMatrices,
} from "../index.js";
import type { Matrix } from "../index.js";

// 0: scaleX, 1: scaleY, 2: rotation, 3: tx, 4:ty, this is not a matrix !
export const Transform = defineComponent([f32, 5]);

export type Transform = Float32Array;

export function createTransform(
  x: number = 0,
  y: number = 0,
  rotation = 0,
  scaleX = 1,
  scaleY = 1,
): Transform {
  const mat = createIdentityMatrix();

  mat[0] = scaleX;
  mat[1] = scaleY;
  mat[2] = rotation;
  mat[3] = x;
  mat[4] = y;

  return mat;
}

export function getTransform(entity: Entity): Transform {
  return Transform[entity]!;
}

export function getTransformLocalMatrix(transform: Transform): Matrix {
  return createMatrixFromTransform(transform);
}
export const getTransformMatrix = getTransformLocalMatrix;

export function getWorldMatrix(entity: Entity) {
  const childMatrix = getLocalMatrix(entity);

  let parent = getParentOf(entity);
  if (parent) {
    let parentMatrix: Matrix = createIdentityMatrix();

    while (parent) {
      parentMatrix = getLocalMatrix(parent, parentMatrix)!;

      multiplyMatrices(childMatrix, getLocalMatrix(parent, parentMatrix));

      parent = getParentOf(parent);
    }
  }

  return childMatrix;
}

export function getLocalMatrix(
  entity: Entity,
  out: Matrix = createIdentityMatrix(),
): Matrix {
  return createMatrixFromTransform(getTransform(entity), out);
}
export const getMatrix = getTransformLocalMatrix;

export function getLocalPosition(entity: Entity): Vec {
  const transform = Transform[entity]!;
  return new Vec(transform![3]!, transform[4]!);
}
export const getPosition = getLocalPosition;

export function getWorldPosition(entity: Entity): Vec {
  const mat = getWorldMatrix(entity);
  return new Vec(mat![4]!, mat[5]!);
}

export function getX(entity: Entity): number {
  return Transform[entity]![3]!;
}

export function getTransformX(transform: Transform): number {
  return transform[3]!!;
}

export function getY(entity: Entity): number {
  return Transform[entity]![4]!;
}

export function getTransformY(transform: Transform): number {
  return transform[4]!!;
}

export function setLocalPosition(entity: Entity, { x, y }: Vector): void {
  const transform = Transform[entity]!;
  transform![3] = x;
  transform![4] = y;
}
export const setPosition = setLocalPosition;

export function setWorldPosition(entity: Entity, position: Vector): void {
  let parent = getParentOf(entity);

  if (parent) {
    //@todo perf: matrix calculation is not necessary here I think
    const parentWorldPosition = getWorldPosition(parent);
    setLocalPosition(entity, {
      x: position.x - parentWorldPosition.x,
      y: position.y - parentWorldPosition.y,
    });
  }

  setLocalPosition(entity, position);
}

export function translate(entity: Entity, { x, y }: Vector): void {
  const transform = Transform[entity]!;
  transform![3] += x;
  transform![4] += y;
}

export function setX(entity: Entity, x: number) {
  Transform[entity]![3]! = x;
}

export function setTransformX(transform: Transform, x: number) {
  transform[3]! = x;
}

export function setY(entity: Entity, y: number) {
  Transform[entity]![4]! = y;
}

export function setTransformY(transform: Transform, y: number) {
  transform[4]! = y;
}

export function getLocalScale(entity: Entity): Vec {
  const transform = Transform[entity]!;
  return new Vec(transform![0]!, transform[1]!);
}
export const getScale = getLocalScale;

export function getScaleX(entity: Entity): number {
  return Transform[entity]![0]!;
}

export function getScaleY(entity: Entity): number {
  return Transform[entity]![1]!;
}

export function setLocalScale(entity: Entity, { x, y }: Vector): void {
  const transform = Transform[entity]!;
  transform![0] = x;
  transform![1] = y;
}
export const setScale = setLocalScale;

export function scale(entity: Entity, x: number, y = x) {
  const transform = Transform[entity]!;
  transform[0]! += x;
  transform[1]! += y;
}

export function setScaleX(entity: Entity, x: number) {
  Transform[entity]![0]! = x;
}

export function setScaleY(entity: Entity, y: number) {
  Transform[entity]![1]! = y;
}

export function flip(entity: Entity) {
  scale(entity, -1);
}

export function flipX(entity: Entity) {
  const transform = Transform[entity]!;
  transform[0]! *= -1;
}

export function flipY(entity: Entity) {
  const transform = Transform[entity]!;
  transform[1]! *= -1;
}

export function getLocalRotation(entity: Entity): number {
  return Transform[entity]![2]!;
}
export const getRotation = getLocalRotation;

export function getWorldRotation(entity: Entity): number {
  return getMatrixRotation(getWorldMatrix(entity));
}

export function getTransformRotation(transform: Transform): number {
  return transform[2]!;
}

export function setRotation(entity: Entity, radians: number) {
  Transform[entity]![2]! = radians;
}

export function setTransformRotation(transform: Transform, radians: number) {
  transform[2]! = radians;
}

export function rotate(entity: Entity, radians: number) {
  Transform[entity]![2]! += radians;
}

export function createMatrixFromTransform(
  transform: Transform,
  out: Matrix = createIdentityMatrix(),
): Matrix {
  const [scaleX, scaleY, rotation, x, y] = transform;

  const sin = Math.sin(rotation!);
  const cos = Math.cos(rotation!);

  out[4] = x!;
  out[5] = y!;

  out[0] = scaleX! * cos;
  out[1] = scaleX! * sin;
  out[2] = scaleY! * -sin;
  out[3] = scaleY! * cos;

  return out;
}
