import { beforeStart, defineEngine, defineLoop, emit, on } from "aion-engine";
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
import { Entity, defineComponent } from "aion-ecs";

export const Floor = defineComponent({});

export const engine = defineEngine(plugins, () => {
  const { $camera, getFloor } = useGame();

  defineLoop(() => {
    emit("update");

    emit("draw");
  });

  setBackgroundColor("black");

  setZoom(0.7);
  centerCameraOnEntity(getFloor());

  createScenes();

  onSceneExit("build-castle", () => startScene("place-treasure"));
  onSceneExit("place-treasure", () => startScene("invasion"));

  startScene("build-castle");

  on("update", () => {
    translate($camera, direction().scale(10));

    if (key("a")) {
      zoomBy(-0.04);
    }

    if (key("e")) {
      zoomBy(+0.04);
    }
  });
});

export const useGame = engine.use;

engine.run();

function plugins() {
  const preset = aionPreset({
    renderDebug: true,
  });

  let floor: Entity = -1;

  function getFloor() {
    return floor;
  }

  beforeStart(() => {
    const { $ecs } = useGame();

    floor = preset.createCube({
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
        type: preset.$physics.RAPIER.RigidBodyType.Fixed,
      }),
    });

    $ecs.attach(Floor, getFloor());
  });

  return { ...preset, getFloor };
}

// export function getFloor() {
//   const { query } = useGame()
// }

// export function getFloorBounds() {
//   return getRectBounds(getFloor());
// }
