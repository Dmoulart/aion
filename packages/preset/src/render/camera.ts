import { bool, defineComponent, f32, type Entity } from "aion-ecs";
import {
  applyInverse,
  getWorldPosition,
  getWorldRotation,
  mat,
  useAion,
} from "../index.js";
import { windowHeight, windowWidth } from "aion-render";
import type { Vector } from "aion-core";

export const Camera = defineComponent({
  default: bool,
  zoom: f32,
});

export function useCamera() {
  return useAion().$camera;
}

export function getZoom() {
  return Camera.zoom[useCamera()]!;
}

export function setZoom(zoom: number) {
  Camera.zoom[useCamera()]! = zoom;
}

export function zoomBy(zoom: number, camera: Entity = useCamera()) {
  Camera.zoom[camera]! += zoom;
}

export function getProjectionMatrix(camera: Entity) {
  const zoom = Camera.zoom[camera]!;

  const pos = getWorldPosition(camera);
  const rot = getWorldRotation(camera);

  const viewWidth = windowWidth() / zoom;
  const viewHeight = windowHeight() / zoom;

  const matrix = mat.create();

  mat.scale(matrix, matrix, [zoom, zoom]);

  mat.rotate(matrix, matrix, rot);

  mat.translate(matrix, matrix, [
    -pos.x + viewWidth / 2,
    -pos.y + viewHeight / 2,
  ]);

  return matrix;
}

export function screenToWorldPosition(point: Vector) {
  const camera = useCamera();

  const matrix = getProjectionMatrix(camera);

  return applyInverse(matrix, point);
}

// export function screenToWorldPosition(point: Vector) {
//   const camera = useCamera();

//   const matrix = getProjectionMatrix(camera);
//   mat.invert(matrix, matrix);

//   const result = glMatrix.vec2.transformMat2d(
//     [0, 0],
//     [point.x, point.y],
//     matrix,
//   );

//   return new Vec(result[0], result[1]);
// }
