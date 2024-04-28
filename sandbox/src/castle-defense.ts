import { beforeStart, defineEngine, defineLoop, emit, on } from "aion-engine";
import { direction, key } from "aion-input";
import {
  translate,
  zoomBy,
  centerCameraOnEntity,
  setZoom,
  startScene,
  onSceneExit,
  defineScene,
  aionPreset,
} from "aion-preset";
import { Colors, setBackgroundColor } from "aion-render";
import buildCastle from "./castle-defense/scenes/build-castle";
import placeTreasure from "./castle-defense/scenes/place-treasure";
import invasion from "./castle-defense/scenes/invasion";
import { createFloor, getFloor } from "./castle-defense/floor";

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

  defineScene("build-castle", buildCastle);
  defineScene("place-treasure", placeTreasure);
  defineScene("invasion", invasion);

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

export function plugins() {
  const preset = aionPreset({
    renderDebug: false,
    debugEntityID: false,
  });

  beforeStart(createFloor);

  return { ...preset };
}
