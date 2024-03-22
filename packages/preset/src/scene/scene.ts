import { useAion, type Scene } from "../index.js";

const CURRENT_SCENE_ID = "__current-scene__";

export type SceneCleanup = () => void;

export function defineScene(id: string, start: () => SceneCleanup) {
  const scene = { id, start };

  addScene(scene);
}

export function exitCurrentScene() {
  const { $scenes } = useAion();

  $scenes.delete(CURRENT_SCENE_ID);

  const engine = useAion();

  engine.currentSceneCleanup();
}

export function getCurrentScene() {
  const { $scenes } = useAion();

  return $scenes.get(CURRENT_SCENE_ID);
}

export function startScene(sceneID: string) {
  const { $scenes } = useAion();

  const scene = $scenes.get(sceneID);

  if (!scene) {
    throw new SceneNotFound(`Scene ${sceneID} not found`);
  }

  $scenes.set(CURRENT_SCENE_ID, scene);

  const engine = useAion();

  engine.currentSceneCleanup = scene.start();
}

export function addScene(scene: Scene) {
  const { $scenes } = useAion();
  $scenes.set(scene.id, scene);
}

export function removeScene(scene: Scene) {
  const { $scenes } = useAion();
  $scenes.delete(scene.id);
}

export function getScene(scene: Scene) {
  const { $scenes } = useAion();
  return $scenes.get(scene.id);
}

export class SceneNotFound extends Error {}
