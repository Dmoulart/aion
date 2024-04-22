import {
  useECS,
  getRectWorldBounds,
  createBody,
  createCollider,
  createTransform,
  usePhysics,
  useAion,
} from "aion-preset";
import { Floor } from "./components";
import { windowCenterX, windowCenterY, windowWidth, Colors } from "aion-render";
import { OBSTACLE_COLLISION_GROUP } from "./collision-groups";

export function getFloor() {
  const { query } = useECS();

  return query(Floor).first()!;
}
export function getFloorBounds() {
  return getRectWorldBounds(getFloor());
}

export function createFloor() {
  const { attach } = useECS();
  const { createCube } = useAion();
  const { RAPIER } = usePhysics();
  const floor = createCube({
    Transform: createTransform(windowCenterX(), windowCenterY()),
    Rect: {
      h: 20,
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

  attach(Floor, floor);
}
