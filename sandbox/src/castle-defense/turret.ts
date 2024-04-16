import { Vector } from "aion-core";
import {
  createTransform,
  createCollider,
  addChildTo,
  useECS,
  Transform,
} from "aion-preset";
import { OBSTACLE_COLLISION_GROUP } from "./collision-groups";
import { Colors } from "aion-render";
import { usePrefabs } from "./prefabs";
import { defineComponent, i32, u32 } from "aion-ecs";
import { IsEnemy } from "./components";

export const Shoot = defineComponent({
  force: i32,
});

export const AutoTarget = defineComponent({
  component: u32,
});

export function createTurret(pos: Vector) {
  const { Turret, Canon } = usePrefabs();

  const turret = Turret({
    Transform: createTransform(pos.x, pos.y),
    Circle: {
      r: 20,
    },
    Fill: "white",
    Stroke: "black",
    Collider: createCollider({
      auto: 1,
      collisionGroups: OBSTACLE_COLLISION_GROUP,
    }),
  });

  // eye
  addChildTo(
    turret,
    Canon({
      Transform: createTransform(-10, 0),
      Rect: {
        w: 50,
        h: 5,
      },
      Fill: Colors["mine-shaft:900"],
      Stroke: "black",
      AutoTarget: {
        component: IsEnemy,
      },
    }),
  );

  return turret;
}

export function initTurrets() {
  const { query } = useECS();

  query(Transform, AutoTarget).each((entity) => {});
}
