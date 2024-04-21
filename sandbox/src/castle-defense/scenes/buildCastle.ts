import { on } from "aion-engine";
import { getMouse, isClicking } from "aion-input";
import {
  createTransform,
  createCollider,
  screenToWorldPosition,
  Rect,
  createBody,
  exitCurrentScene,
  Body,
  Collider,
  Fill,
  Stroke,
  Transform,
} from "aion-preset";
import { Colors } from "aion-render";
import { OBSTACLE_COLLISION_GROUP } from "../collision-groups";
import { useGame } from "../../castle-defense";
import { Resistance } from "../components";

export default () => {
  const { $ecs, $physics } = useGame();
  const { RAPIER } = $physics;

  const Wall = $ecs.prefab({
    Transform,
    Rect,
    Fill,
    Stroke,
    Collider,
    Body,
    Resistance,
  });

  let wallNumber = 0;

  const player = Wall({
    Transform: createTransform(0, 0),
    Rect: {
      h: 500,
      w: 50,
    },
    Fill: Colors["cornflower:800"],
    Stroke: "black",
    Collider: createCollider({
      auto: 1,
      collisionGroups: OBSTACLE_COLLISION_GROUP,
    }),
    Resistance: 100,
  });

  return on("update", () => {
    const { x, y } = screenToWorldPosition(getMouse());

    setBodyPosition(player, { x, y });

    if (isClicking()) {
      Wall({
        Transform: createTransform(x, y),
        Rect: {
          h: Rect.h[player],
          w: Rect.w[player],
        },
        Fill: Colors["cornflower:800"],
        Stroke: "black",
        Collider: createCollider({
          auto: 1,
          collisionGroups: OBSTACLE_COLLISION_GROUP,
        }),
        Body: createBody({
          type: RAPIER.RigidBodyType.Fixed,
        }),
        Resistance: 10,
      });

      wallNumber++;
    }

    if (wallNumber === 4) {
      $ecs.remove(player);
      exitCurrentScene();
    }
  });
};
