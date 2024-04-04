import { bool, defineComponent, f32, type Entity } from "aion-ecs";
import {
  applyInverseMatrix,
  mat,
  setPosition,
  useAion,
  type Matrix,
  getLocalPosition,
  getWorldPosition,
  getLocalRotation,
  getWorldRotation,
  inverseMatrix,
} from "../index.js";
import {
  windowCenterX,
  windowCenterY,
  windowHeight,
  windowWidth,
} from "aion-render";
import type { Vector } from "aion-core";
import { mat2d } from "gl-matrix";

export const Camera = defineComponent({
  default: bool,
  zoom: f32,
});

export function useCamera() {
  return useAion().$camera;
}

export function getCameraLocalPosition(camera = useCamera()) {
  return getLocalPosition(camera);
}
export const getCameraPosition = getCameraLocalPosition;

export function getCameraWorldPosition(camera = useCamera()) {
  return getWorldPosition(camera);
}

export function setCameraPosition(pos: Vector, camera = useCamera()) {
  setPosition(camera, pos);
}

export function centerCameraOn(point: Vector, camera = useCamera()) {
  setPosition(camera, point);
}

export function centerCameraOnEntity(ent: Entity, camera = useCamera()) {
  centerCameraOn(getWorldPosition(ent), camera);
}

export function getZoom(camera = useCamera()) {
  return Camera.zoom[camera]!;
}

export function zoomBy(zoom: number, camera: Entity = useCamera()) {
  Camera.zoom[camera]! += zoom;
}

export function setZoom(zoom: number, camera = useCamera()) {
  Camera.zoom[camera]! = zoom;
}

export function getCameraRotation(camera = useCamera()) {
  return getLocalRotation(camera);
}

export function getProjectionMatrix(
  camera: Entity,
  matrix = mat2d.create(),
): Matrix {
  const zoom = Camera.zoom[camera]!;

  const pos = getWorldPosition(camera);
  const rot = getWorldRotation(camera);

  const viewWidth = windowWidth() / zoom;
  const viewHeight = windowHeight() / zoom;

  mat2d.scale(matrix, matrix, [zoom, zoom]);

  mat2d.rotate(matrix, matrix, rot);

  mat2d.translate(matrix, matrix, [
    -pos.x + viewWidth / 2,
    -pos.y + viewHeight / 2,
  ]);

  return matrix as Matrix;
}

export function screenToWorldPosition(point: Vector) {
  const camera = useCamera();

  return applyInverseMatrix(getProjectionMatrix(camera), point);
}
