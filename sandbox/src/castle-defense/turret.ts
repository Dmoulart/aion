import { Vector, millitimestamp } from "aion-core";
import {
  createTransform,
  createCollider,
  addChildTo,
  useECS,
  Transform,
  usePhysics,
  getPhysicsWorldPosition,
  Fill,
  getRuntimeBodyEntity,
  castRay,
  rotateTowards,
  createBody,
  setRuntimeBodyVelocity,
  getWorldDistance,
  getWorldPosition,
  getWorldRotation,
  Collision,
  getCollidingEntity,
} from "aion-preset";
import {
  OBSTACLE_COLLISION_GROUP,
  TURRET_COLLISION_GROUP,
} from "./collision-groups";
import { Colors } from "aion-render";
import { usePrefabs } from "./prefabs";
import {
  Entity,
  defineComponent,
  eid,
  f32,
  i32,
  onEnterQuery,
  u32,
} from "aion-ecs";
import { Health, IsEnemy } from "./components";
import { on } from "aion-engine";
import { damage } from "./health";

export const Gun = defineComponent({
  force: f32,
  freq: u32,
  lastShot: f32,
});

export const AutoTarget = defineComponent({
  targetComponent: u32,
  target: eid,
  range: u32,
});

export const Projectile = defineComponent({
  hit: u32,
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
        targetComponent: IsEnemy,
        range: 1,
      },
      Gun: {
        freq: 200,
        force: 10,
      },
    }),
  );

  return turret;
}

export function initTurrets() {
  const { query, has, remove } = useECS();

  on("update", () => {
    query(Transform, AutoTarget, Gun).each((entity) => {
      // if (AutoTarget.target[entity] !== 0) {
      //   // if (
      //   //   getWorldDistance(entity, AutoTarget.target[entity]).mag() >
      //   //   AutoTarget.range[entity]
      //   // ) {
      //   //   AutoTarget.target[entity] = 0;
      //   // }
      // }

      if (AutoTarget.target[entity] === 0) {
        searchForTarget(entity);
      }

      if (AutoTarget.target[entity] !== 0) {
        rotateTowards(entity, AutoTarget.target[entity], 3);
        const now = millitimestamp();
        const timeSinceLastShot = now - Gun.lastShot[entity];
        const shootFrequency = Gun.freq[entity];

        if (timeSinceLastShot >= shootFrequency) {
          shoot(entity, AutoTarget.target[entity]);
          Gun.lastShot[entity] = now;
        }
      }
    });
  });

  const onProjectileHit = onEnterQuery(query(Projectile, Collision));

  onProjectileHit((projectile) => {
    debugger;
    const collided = getCollidingEntity(projectile);
    if (collided) {
      if (has(Health, collided)) {
        damage(collided, Projectile.hit[projectile]);
      }
    }
    remove(projectile);
  });
}

function searchForTarget(entity: Entity) {
  const { world, RAPIER } = usePhysics();

  const position = getPhysicsWorldPosition(entity);
  const rotation = 0;
  const maxToi = 4;
  const result = world.castShape(
    position,
    rotation,
    { x: Math.random() > 0.5 ? 1 : -1, y: 0 },
    new RAPIER.Cuboid(20, 20),
    maxToi,
    false,
    undefined,
    TURRET_COLLISION_GROUP,
  );
  if (result) {
    const body = result.collider.parent();
    if (body) {
      const target = getRuntimeBodyEntity(body);

      if (target) {
        Fill[target] = "blue";
        AutoTarget.target[entity] = target;
      }
    }
  }
}

function shoot(entity: Entity, target: Entity) {
  const { Bullet } = usePrefabs();
  const { RAPIER } = usePhysics();

  const position = getWorldPosition(entity);
  const rotation = getWorldRotation(entity);

  const bullet = Bullet({
    Transform: createTransform(position.x, position.y, rotation),
    Collider: createCollider({
      auto: 1,
      collisionGroups: TURRET_COLLISION_GROUP,
      isSensor: 1,
    }),
    Body: createBody({
      type: RAPIER.RigidBodyType.KinematicVelocityBased,
    }),
    Fill: "yellow",
    Rect: {
      w: 10,
      h: 2,
    },
    Stroke: "black",
    Projectile: {
      hit: 10,
    },
  });

  setRuntimeBodyVelocity(
    bullet,
    getWorldDistance(target, entity).norm().scale(Gun.force[entity]),
  );
}

function isTargetReachable(entity: Entity) {
  const result = castRay(
    entity,
    AutoTarget.target[entity],
    TURRET_COLLISION_GROUP,
  );

  if (result) {
    const target = result.entity;
    if (target === AutoTarget.target[entity]) {
      Fill[target] = "red";
    }
    return true;
  }
  return false;
}
