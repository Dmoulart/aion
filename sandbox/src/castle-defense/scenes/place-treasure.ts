import { on } from "aion-engine";
import { getMouse, isClicking } from "aion-input";
import {
  createTransform,
  createCollider,
  createBody,
  screenToWorldPosition,
  setRuntimeBodyPosition,
  Rect,
  exitCurrentScene,
  useECS,
  usePhysics,
} from "aion-preset";
import { Colors } from "aion-render";
import { OBSTACLE_COLLISION_GROUP } from "../collision-groups";
import { IsTreasure } from "../components";
import { initTurrets } from "../turret";
import { usePrefabs } from "../prefabs";

export default () => {
  const { RAPIER } = usePhysics();
  const { remove } = useECS();
  const { Treasure } = usePrefabs();

  initTurrets();

  const player = Treasure({
    Transform: createTransform(0, 0),
    Rect: {
      h: 50,
      w: 50,
    },
    Fill: Colors["fuchsia-blue:700"],
    Stroke: "black",
    Collider: createCollider({
      auto: 1,
      collisionGroups: OBSTACLE_COLLISION_GROUP,
    }),
    Body: createBody({
      type: RAPIER.RigidBodyType.Dynamic,
    }),
  });

  const cleanup = on("update", () => {
    const { x, y } = screenToWorldPosition(getMouse());

    setRuntimeBodyPosition(player, { x, y });

    if (isClicking()) {
      Treasure({
        Transform: createTransform(x, y),
        Rect: {
          h: Rect.h[player],
          w: Rect.w[player],
        },
        Fill: Colors["fuchsia-blue:700"],
        Stroke: "black",
        Collider: createCollider({
          auto: 1,
          collisionGroups: OBSTACLE_COLLISION_GROUP,
        }),
        Body: createBody({
          type: RAPIER.RigidBodyType.Dynamic,
        }),
        Health: 1000,
        IsTreasure,
      });

      remove(player);
      exitCurrentScene();
    }
  });

  return cleanup;
};
