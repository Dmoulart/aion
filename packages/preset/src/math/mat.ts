import { mat2d } from "gl-matrix";

import { Vec, type Vector } from "aion-core";

export type Matrix = Float32Array;

export const createIdentityMatrix = mat2d.create as () => Matrix;

export function applyInverseMatrix(
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

export function inverseMatrix(matrix: Matrix) {
  const a = matrix[0]!;
  const b = matrix[1]!;
  const c = matrix[2]!;
  const d = matrix[3]!;
  const tx = matrix[4]!;
  const ty = matrix[5]!;

  const det = a * d - b * c;

  matrix[0] = d / det;
  matrix[1] = -b / det;
  matrix[2] = -c / det;
  matrix[3] = a / det;
  matrix[4] = (c * ty - d * tx) / det;
  matrix[5] = -(a * ty - b * tx) / det;
}

export function getMatrixRotation(mat: Matrix) {
  // Extract the rotation component from the transformation matrix
  const a = mat[0]!;
  const b = mat[1]!;
  const c = mat[2]!;
  const d = mat[3]!;

  // Calculate the rotation angle based on the rotation component
  if (a || b) {
    return Math.atan2(b, a); // Return the angle in radians using arctan2
  } else if (c || d) {
    return Math.atan2(c, d); // Return the angle in radians using arctan2
  } else {
    return 0; // If there is no rotation component, return 0
  }
}

export function multiplyMatrices(first: Matrix, other: Matrix, out = first) {
  const a = first[0]!;
  const b = first[1]!;
  const c = first[2]!;
  const d = first[3]!;
  const e = first[4]!;
  const f = first[5]!;

  const a2 = other[0]!;
  const b2 = other[1]!;
  const c2 = other[2]!;
  const d2 = other[3]!;
  const e2 = other[4]!;
  const f2 = other[5]!;

  out[0] = a * a2 + b * c2;
  out[1] = a * b2 + b * d2;
  out[2] = c * a2 + d * c2;
  out[3] = c * b2 + d * d2;
  out[4] = e * a2 + f * c2 + e2;
  out[5] = e * b2 + f * d2 + f2;
}

export function getMatrixTranslation(matrix: Matrix): Vector {
  return new Vec(matrix[4], matrix[5]);
}

// export function getScaleX(matrix: Matrix) {
//   const a = matrix[0]!;
//   const b = matrix[1]!;
//   return Math.sqrt(a * a + b * b);
// }

// export function getScaleY(matrix: Matrix) {
//   const c = matrix[2]!;
//   const d = matrix[3]!;
//   return Math.sqrt(c * c + d * d);
// }
