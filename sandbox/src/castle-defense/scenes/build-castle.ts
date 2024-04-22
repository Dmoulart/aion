import { downDirection } from "aion-core";
import { on } from "aion-engine";
import { key, click } from "aion-input";
import {
  castRay,
  getMouseWorldPosition,
  getRectHalfHeight,
  setRuntimeBodyPosition,
  exitCurrentScene,
  useECS,
} from "aion-preset";
import { Blueprint } from "../components";
import { createTurret } from "../turret";
import { createWall } from "../wall";

export default () => {
  const { attach, remove } = useECS();

  let wallNumber = 0;

  const blueprint = createWall();

  attach(Blueprint, blueprint);

  return on("update", () => {
    const result = castRay(
      getMouseWorldPosition(),
      downDirection(),
      undefined,
      20,
    );

    if (result) {
      const { point } = result;

      point.y -= getRectHalfHeight(blueprint);

      setRuntimeBodyPosition(blueprint, point);

      if (key("w") && click()) {
        createTurret(point);
      }

      if (click()) {
        createWall(point.x, point.y);

        wallNumber++;
      }
    }

    if (wallNumber === 4) {
      remove(blueprint);
      exitCurrentScene();
    }
  });
};
