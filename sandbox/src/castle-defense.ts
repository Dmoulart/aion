import { beforeStart, defineEngine, defineLoop, emit, on } from "aion-engine";
import { direction, key } from "aion-input";
import {
  translate,
  zoomBy,
  centerCameraOnEntity,
  setZoom,
  startScene,
  onSceneExit,
  createBody,
  createCollider,
  createTransform,
  defineScene,
  usePhysics,
  aionPreset,
} from "aion-preset";
import {
  Colors,
  setBackgroundColor,
  windowCenterX,
  windowCenterY,
  windowWidth,
} from "aion-render";
import { OBSTACLE_COLLISION_GROUP } from "./castle-defense/collision-groups";
import { Floor } from "./castle-defense/components";
import buildCastle from "./castle-defense/scenes/build-castle";
import placeTreasure from "./castle-defense/scenes/place-treasure";
import invasion from "./castle-defense/scenes/invasion";
import { getFloor } from "./castle-defense/floor";

export const engine = defineEngine(plugins, () => {
  const { $camera } = useGame();

  defineLoop(() => {
    emit("update");

    emit("draw");

    emit("delete-entities");
  });

  setBackgroundColor(Colors["rhino:950"]);

  setZoom(0.7);
  centerCameraOnEntity(getFloor());

  createScenes();

  onSceneExit("build-castle", () => startScene("place-treasure"));
  onSceneExit("place-treasure", () => startScene("invasion"));

  startScene("build-castle");

  on("update", () => {
    translate($camera, direction().scale(20));

    if (key("a")) {
      zoomBy(-0.08);
    }

    if (key("e")) {
      zoomBy(+0.08);
    }
  });
});

export const useGame = engine.use;

engine.run();

export function createScenes() {
  defineScene("build-castle", buildCastle);

  defineScene("place-treasure", placeTreasure);

  defineScene("invasion", invasion);
}

export function plugins() {
  const preset = aionPreset({
    renderDebug: false,
    debugEntityID: false,
  });

  beforeStart(() => {
    const { $ecs } = useGame();
    const { RAPIER } = usePhysics();
    const floor = preset.createCube({
      Transform: createTransform(windowCenterX(), windowCenterY()),
      Rect: {
        h: 10,
        w: windowWidth() * 1,
      },
      Fill: Colors["rhino:900"],
      Stroke: "black",
      Collider: createCollider({
        auto: 1,
        collisionGroups: OBSTACLE_COLLISION_GROUP,
      }),
      Body: createBody({
        type: RAPIER.RigidBodyType.Fixed,
      }),
    });

    $ecs.attach(Floor, floor);
  });

  return { ...preset };
}
