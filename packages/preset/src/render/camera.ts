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

export function zoom(zoom: number, camera: Entity = useCamera()) {
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
