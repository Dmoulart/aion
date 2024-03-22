import { defineEngine, defineLoop, emit, on } from "aion-engine";
import { direction, key } from "aion-input";
import {
  aionPreset,
  createTransform,
  translate,
  zoomBy,
  centerCameraOnEntity,
  createCollider,
  createBody,
  setZoom,
  useAion,
  startScene,
  onSceneExit,
} from "aion-preset";
import {
  Colors,
  setBackgroundColor,
  windowCenterX,
  windowCenterY,
  windowWidth,
} from "aion-render";
import { createScenes } from "./castle-defense/scenes";

const engine = defineEngine(plugins, () => {
  const { $physics, createCube, $camera } = useAion();

  const { RAPIER } = $physics;

  defineLoop(() => {
    emit("update");

    emit("draw");
  });

  setBackgroundColor("black");

  const floor = createCube({
    Transform: createTransform(windowCenterX(), windowCenterY()),
    Rect: {
      h: 10,
      w: windowWidth() * 10,
    },
    Fill: Colors["acapulco:400"],
    Stroke: "white",
    Collider: createCollider({
      auto: 1,
    }),
    Body: createBody({
      type: RAPIER.RigidBodyType.Fixed,
    }),
  });

  setZoom(0.7);
  centerCameraOnEntity(floor);

  on("update", () => {
    translate($camera, direction().scale(10));

    if (key("a")) {
      zoomBy(-0.04);
    }

    if (key("e")) {
      zoomBy(+0.04);
    }
  });

  createScenes();

  onSceneExit("build-castle", () => startScene("place-treasure"));

  startScene("build-castle");
});

const useGame = engine.use;

engine.run();

function plugins() {
  return aionPreset({
    renderDebug: false,
  });
}
