import {
  createTransform,
  createCollider,
  usePhysics,
  createBody,
} from "aion-preset";
import { Colors } from "aion-render";
import { OBSTACLE_COLLISION_GROUP } from "./collision-groups";
import { usePrefabs } from "./prefabs";

export function createWall(x: number = 0, y: number = 0, h = 500, w = 50) {
  const { RAPIER } = usePhysics();
  const { Wall } = usePrefabs();

  return Wall({
    Transform: createTransform(x, y),
    Rect: {
      h,
      w,
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
    Health: 1000,
  });
}
