import { emit, on } from "aion-engine";
import { useAion, type Scene } from "../index.js";

const CURRENT_SCENE_ID = "__current-scene__";

export type SceneCleanup = () => void;

export function defineScene(id: string, start: () => SceneCleanup) {
  const scene = { id, start };

  addScene(scene);
}

export function exitCurrentScene() {
  const {
    scenes: { $scenes, currentSceneCleanup },
  } = useAion();

  const currentScene = getCurrentScene();

  if (!$scenes.has(CURRENT_SCENE_ID)) {
    throw new SceneNotFound("No current scene to exit");
  }

  $scenes.delete(CURRENT_SCENE_ID);

  const engine = useAion();

  currentSceneCleanup();

  emit("scene-exit", currentScene?.id);
}

export function onSceneExit(sceneID: string, cb: () => void) {
  on("scene-exit", (id) => {
    if (id === sceneID) {
      cb();
    }
  });
}

export function getCurrentScene() {
  const {
    scenes: { $scenes },
  } = useAion();

  return $scenes.get(CURRENT_SCENE_ID);
}

export function startScene(sceneID: string) {
  const { scenes } = useAion();
  const { $scenes } = scenes;

  const scene = $scenes.get(sceneID);

  if (!scene) {
    throw new SceneNotFound(`Scene ${sceneID} not found`);
  }

  $scenes.set(CURRENT_SCENE_ID, scene);

  scenes.currentSceneCleanup = scene.start();
}

export function addScene(scene: Scene) {
  const {
    scenes: { $scenes },
  } = useAion();
  $scenes.set(scene.id, scene);
}

export function removeScene(scene: Scene) {
  const {
    scenes: { $scenes },
  } = useAion();
  return $scenes.delete(scene.id);
}

export function getScene(scene: Scene) {
  const {
    scenes: { $scenes },
  } = useAion();
  return $scenes.get(scene.id);
}

export class SceneNotFound extends Error {}
