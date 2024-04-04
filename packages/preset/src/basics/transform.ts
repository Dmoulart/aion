import { Vec, type Vector } from "aion-core";
import { defineComponent, f32, type Entity } from "aion-ecs";
import { getMatrixRotation, getParentOf, mat } from "../index.js";
import { mat2d } from "gl-matrix";

// 0: scaleX, 1: scaleY, 2: rotation, 3: tx, 4:ty
//
export const Transform = defineComponent([f32, 5]);

export type Transform = Float32Array;

export type Matrix = Float32Array; // matrix2D

export function getTransform(entity: Entity): Transform {
  return Transform[entity]!;
}

export function createTransform(
  x: number = 0,
  y: number = 0,
  rotation = 0,
  scaleX = 1,
  scaleY = 1,
): Transform {
  const mat = new Float32Array(5);

  mat[0] = scaleX;
  mat[1] = scaleY;
  mat[2] = rotation;
  mat[3] = x;
  mat[4] = y;

  return mat;
}

export function getTransformLocalMatrix(transform: Transform): Matrix {
  return createMatrixFromTransform(transform);
}
export const getTransformMatrix = getTransformLocalMatrix;

export function getWorldMatrix(entity: Entity) {
  let parent = getParentOf(entity);
  const childMatrix = getLocalMatrix(entity);

  while (parent) {
    let parentMatrix = getLocalMatrix(parent)!;
    mat2d.multiply(childMatrix, childMatrix, parentMatrix);
    parent = getParentOf(parent);
  }

  return childMatrix;
}

export function getLocalMatrix(entity: Entity): Matrix {
  return createMatrixFromTransform(getTransform(entity));
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

export function getY(entity: Entity): number {
  return Transform[entity]![4]!;
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

export function setY(entity: Entity, y: number) {
  Transform[entity]![4]! = y;
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
  scale(entity, -1, 1);
}

export function flipY(entity: Entity) {
  scale(entity, 1, -1);
}

/*
 *  Get rotation in radians.
 */
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
  transform[2] = radians;
}

export function rotate(entity: Entity, radians: number) {
  Transform[entity]![2]! += radians;
}

export function createMatrixFromTransform(
  transform: Transform,
  mat: Matrix = mat2d.create() as Matrix,
): Matrix {
  const [scaleX, scaleY, rotation, x, y] = transform;

  // mat2d.rotate(mat, mat, rotation!);
  // mat2d.scale(mat, mat, [scaleX!, scaleY!]);
  // mat2d.translate(mat, mat, [x!, y!]);

  const sin = Math.sin(rotation!);
  const cos = Math.cos(rotation!);

  mat[4] = x!;
  mat[5] = y!;

  mat[0] = scaleX! * cos;
  mat[1] = scaleX! * sin;
  mat[2] = scaleY! * -sin;
  mat[3] = scaleY! * cos;

  return mat;
}
