import { bool, defineComponent, f32, type Entity } from "aion-ecs";
import {
  applyInverse,
  getTranslation,
  getWorldPosition,
  getWorldRotation,
  mat,
  positionOf,
  setPosition,
  useAion,
} from "../index.js";
import {
  windowCenterX,
  windowCenterY,
  windowHeight,
  windowWidth,
} from "aion-render";
import type { Vector } from "aion-core";

export const Camera = defineComponent({
  default: bool,
  zoom: f32,
});

export function useCamera() {
  return useAion().$camera;
}

export function getCameraPosition(camera = useCamera()) {
  return positionOf(camera);
}

export function setCameraPosition(pos: Vector, camera = useCamera()) {
  setPosition(camera, pos);
}

//@todo: it lacks something. Does not work right with zoom
export function centerCameraOn(point: Vector, camera = useCamera()) {
  // const zoom = getZoom(camera);

  // Get the width and height of the viewport based on the zoom level
  // const viewWidth = windowWidth() / zoom;
  // const viewHeight = windowHeight() / zoom;

  setPosition(camera, point);
}

export function centerCameraOnEntity(ent: Entity, camera = useCamera()) {
  centerCameraOn(positionOf(ent), camera);
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
  return getWorldRotation(camera);
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

  return applyInverse(getProjectionMatrix(camera), point);
}
