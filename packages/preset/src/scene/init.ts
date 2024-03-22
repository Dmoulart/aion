import type { SceneCleanup } from "./scene.js";

export type Scene = { id: string; start: () => SceneCleanup };

export function initScenes() {
  const $scenes = new Map<string, Scene>();

  let currentSceneCleanup: SceneCleanup = () => {};

  return { $scenes, currentSceneCleanup };
}
