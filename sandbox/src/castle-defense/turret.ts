import { Vector } from "aion-core";
import {
  createTransform,
  createCollider,
  addChildTo,
  useECS,
  Transform,
  usePhysics,
  getPhysicsWorldPosition,
  getColliderEntity,
  Fill,
  getRuntimeBodyEntity,
} from "aion-preset";
import {
  ENEMY_COLLISION_GROUP,
  ENEMY_COLLISION_MEMBERSHIP_ID,
  OBSTACLE_COLLISION_GROUP,
  TURET_COLLISION_GROUP,
} from "./collision-groups";
import { Colors } from "aion-render";
import { usePrefabs } from "./prefabs";
import { defineComponent, i32, u32 } from "aion-ecs";
import { IsEnemy } from "./components";
import { on } from "aion-engine";

export const Shoot = defineComponent({
  force: i32,
});

export const AutoTarget = defineComponent({
  target: u32,
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
        target: IsEnemy,
      },
    }),
  );

  return turret;
}

export function initTurrets() {
  const { query } = useECS();

  const { world, RAPIER } = usePhysics();
  on("update", () => {
    // query(Transform, AutoTarget).each((entity) => {
    //   query(Transform, AutoTarget.target[entity]).each((target) => {
    //     const impact = castRay(entity, target, OBSTACLE_COLLISION_GROUP);
    //     if (impact) {
    //       Fill[impact.entity] = "blue";
    //     }
    //   });
    // });

    query(Transform, AutoTarget).each((entity) => {
      const position = getPhysicsWorldPosition(entity);
      const rotation = 0;
      const maxToi = 400;
      const result = world.castShape(
        position,
        rotation,
        { x: Math.random() > 0.5 ? 1 : -1, y: 0 },
        new RAPIER.Cuboid(40, 40),
        maxToi,
        false,
        undefined,
        TURET_COLLISION_GROUP,
      );
      if (result) {
        // const entity = getColliderEntity(result.collider.handle);
        const body = result.collider.parent();
        if (body) {
          const entity = getRuntimeBodyEntity(body);
          if (entity) {
            Fill[entity] = "blue";
          }
        }
      }
      console.log(result);
    });
  });
}
