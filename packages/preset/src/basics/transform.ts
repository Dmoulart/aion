import { Vec, type Vector } from "aion-core";
import { defineComponent, f32, type Entity } from "aion-ecs";
import {
  createIdentityMatrix,
  getMatrixRotation,
  getParentOf,
  hasParent,
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
  transform: Matrix = createIdentityMatrix()
): Transform {
  transform[0] = scaleX;
  transform[1] = scaleY;
  transform[2] = rotation;
  transform[3] = x;
  transform[4] = y;

  return transform;
}

export function getTransform(entity: Entity): Transform {
  return Transform[entity]!;
}

export function cloneTransform(
  entity: Entity,
  out: Transform = new Float32Array(6)
): Transform {
  out.set(Transform[entity]!);
  return out;
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
  out: Matrix = createIdentityMatrix()
): Matrix {
  return createMatrixFromTransform(getTransform(entity), out);
}
export const getMatrix = getTransformLocalMatrix;

export function getLocalPosition(entity: Entity): Vec {
  const transform = Transform[entity]!;
  return new Vec(transform[3]!, transform[4]!);
}
export const getPosition = getLocalPosition;

export function getWorldPosition(entity: Entity): Vec {
  let position = getLocalPosition(entity);

  let parent = getParentOf(entity);

  while (parent) {
    const parentPosition = getLocalPosition(parent);

    position.x += parentPosition.x;
    position.y += parentPosition.y;

    parent = getParentOf(parent);
  }

  return position;
}

export function getX(entity: Entity): number {
  return Transform[entity]![3]!;
}

export function getTransformX(transform: Transform): number {
  return transform[3]!;
}

export function getY(entity: Entity): number {
  return Transform[entity]![4]!;
}

export function getTransformY(transform: Transform): number {
  return transform[4]!;
}

export function setLocalPosition(entity: Entity, { x, y }: Vector): void {
  const transform = Transform[entity]!;
  transform[3] = x;
  transform[4] = y;
}

export const setPosition = setLocalPosition;

export function setWorldPosition(entity: Entity, position: Vector): void {
  let parent = getParentOf(entity);

  if (parent) {
    const parentWorldPosition = getWorldPosition(parent);

    position.x -= parentWorldPosition.x;
    position.y -= parentWorldPosition.y;
  }

  setLocalPosition(entity, position);
}

export function translate(entity: Entity, { x, y }: Vector): void {
  const transform = Transform[entity]!;
  transform![3] += x;
  transform![4] += y;
}

export function translateX(entity: Entity, x: number): void {
  const transform = Transform[entity]!;
  transform![3] += x;
}

export function translateY(entity: Entity, x: number): void {
  const transform = Transform[entity]!;
  transform![3] += x;
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

export function getWorldScale(entity: Entity): Vec {
  let scale = getLocalScale(entity);

  let parent = getParentOf(entity);

  while (parent) {
    const parentScale = getLocalScale(parent);

    scale.x += parentScale.x;
    scale.y += parentScale.y;

    parent = getParentOf(parent);
  }

  return scale;
}

export function getLocalScale(entity: Entity): Vec {
  const transform = Transform[entity]!;
  return new Vec(transform[0]!, transform[1]!);
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
  Transform[entity]![0] = x;
}

export function setScaleY(entity: Entity, y: number) {
  Transform[entity]![1] = y;
}

export function flip(entity: Entity) {
  scale(entity, -1);
}

export function flipX(entity: Entity) {
  const transform = Transform[entity]!;
  transform[0] *= -1;
}

export function flipY(entity: Entity) {
  const transform = Transform[entity]!;
  transform[1]! *= -1;
}

export function getWorldRotation(entity: Entity): number {
  let rotation = getLocalRotation(entity);

  let parent = getParentOf(entity);

  while (parent) {
    const parentRotation = getLocalRotation(parent);
    rotation += parentRotation;
    parent = getParentOf(parent);
  }

  return rotation;
}
export function getLocalRotation(entity: Entity): number {
  return Transform[entity]![2]!;
}
export const getRotation = getLocalRotation;

export function getTransformRotation(transform: Transform): number {
  return transform[2]!;
}

export function setLocalRotation(entity: Entity, radians: number) {
  Transform[entity]![2]! = radians;
}
export const setRotation = setLocalRotation;

export function setWorldRotation(entity: Entity, radians: number) {
  const parent = getParentOf(entity);

  if (parent) {
    Transform[entity]![2] = radians - getWorldRotation(parent);
  } else {
    Transform[entity]![2] = radians;
  }
}

export function setTransformRotation(transform: Transform, radians: number) {
  transform[2] = radians;
}

export function rotate(entity: Entity, radians: number) {
  Transform[entity]![2] += radians;
}

export function createMatrixFromTransform(
  transform: Transform,
  out: Matrix = createIdentityMatrix()
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

// export function rotateTowards(source: Entity, target: Entity, step: number) {
//   // Get positions of source and target entities
//   const sourcePosition = getWorldPosition(source);
//   const targetPosition = getWorldPosition(target);

//   // Calculate the angle between source and target
//   const angle = Math.atan2(
//     targetPosition.y - sourcePosition.y,
//     targetPosition.x - sourcePosition.x
//   );

//   // Rotate the source entity towards the target entity
//   rotateTowardsAngle(source, angle, step);
// }

// function rotateTowardsAngle(entity: Entity, targetAngle: number, step: number) {
//   const currentRotation = getLocalRotation(entity);

//   // Calculate the angle difference between current rotation and target angle
//   let angleDiff = targetAngle - currentRotation;

//   // Normalize the angle difference to be within the range of -Math.PI to Math.PI
//   angleDiff = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI;

//   // If the angle difference is greater than step, rotate by step, else directly set the target angle
//   if (Math.abs(angleDiff) > step) {
//     const rotationDirection = Math.sign(angleDiff);
//     rotate(entity, step * rotationDirection);
//   } else {
//     setLocalRotation(entity, targetAngle);
//   }
// }

export function rotateAroundPoint(entity: Entity, point: Vec, angle: number) {
  const position = getWorldPosition(entity);

  const distanceX = position.x - point.x;
  const distanceY = position.y - point.y;

  // Calculate the new position after rotation
  const newX =
    distanceX * Math.cos(angle) - distanceY * Math.sin(angle) + point.x;
  const newY =
    distanceX * Math.sin(angle) + distanceY * Math.cos(angle) + point.y;

  // Set the new position
  setWorldPosition(entity, new Vec(newX, newY));
}

export function rotationAroundPoint(position: Vec, point: Vec, angle: number) {
  const distanceX = position.x - point.x;
  const distanceY = position.y - point.y;

  // Calculate the new position after rotation
  const newX =
    distanceX * Math.cos(angle) - distanceY * Math.sin(angle) + point.x;
  const newY =
    distanceX * Math.sin(angle) + distanceY * Math.cos(angle) + point.y;

  return new Vec(newX, newY);
}
