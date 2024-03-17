import { Vec, type Vector } from "aion-core";
import * as glMatrix from "gl-matrix";

export const mat = glMatrix.mat2d;

export type Matrix = ArrayLike<number>;

export function applyInverse(
  matrix: Matrix,
  { x, y }: Vector,
  output: Vector = { x: 0, y: 0 },
) {
  const a = matrix[0]!;
  const b = matrix[1]!;
  const c = matrix[2]!;
  const d = matrix[3]!;
  const tx = matrix[4]!;
  const ty = matrix[5]!;

  const id = 1 / (a * d + c * -b);

  output.x = d * id * x + -c * id * y + (ty * c - tx * d) * id;
  output.y = a * id * y + -b * id * x + (-ty * a + tx * b) * id;

  return output;
}

export function getTranslation(matrix: Matrix) {
  return new Vec(matrix[4], matrix[5]);
}

export function getScaleX(matrix: Matrix) {
  const a = matrix[0]!;
  const b = matrix[1]!;
  return Math.sqrt(a * a + b * b);
}

export function getScaleY(matrix: Matrix) {
  const c = matrix[2]!;
  const d = matrix[3]!;
  return Math.sqrt(c * c + d * d);
}
