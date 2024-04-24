import { Vector, millitimestamp, vec } from "aion-core";
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
  getParentOf,
  getColliderEntity,
  getRuntimeColliderEntity,
  findPhysicalEntityInsideBoundingBox,
} from "aion-preset";
import {
  OBSTACLE_COLLISION_GROUP,
  TURRET_COLLISION_GROUP,
} from "./collision-groups";
import { Colors, fillRect } from "aion-render";
import { usePrefabs } from "./prefabs";
import {
  Entity,
  defineComponent,
  eid,
  f32,
  onEnterQuery,
  onExitQuery,
  u32,
} from "aion-ecs";
import { Health, IsEnemy } from "./components";
import { on, once } from "aion-engine";
import { damage } from "./health";

export const Gun = defineComponent({
  force: f32,
  freq: u32,
  lastShot: f32,
});

export const AutoTarget = defineComponent({
  targetComponent: eid,
  target: eid,
  range: u32,
});

export const Projectile = defineComponent({
  hit: u32,
});

export const IsTargeted = defineComponent({
  attacker: eid,
});

export function createTurret(x: number, y: number) {
  const { Turret, Canon } = usePrefabs();

  const turret = Turret({
    Transform: createTransform(x, y),
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
        range: 200,
      },
      Gun: {
        freq: 350,
        force: 50,
      },
    }),
  );

  return turret;
}

export function initTurrets() {
  const { query, has, remove } = useECS();
  const onTargetKilled = onExitQuery(query(IsTargeted));

  onTargetKilled((entity) => {
    const attacker = IsTargeted.attacker[entity];
    AutoTarget.target[attacker] = 0;
    IsTargeted.attacker[entity] = 0;
  });

  on("update", () => {
    query(Transform, AutoTarget, Gun).each((entity) => {
      if (AutoTarget.target[entity] !== 0) {
        const distance = getWorldDistance(
          AutoTarget.target[entity],
          entity,
        ).mag();
        console.log("distance,", distance);

        if (distance > AutoTarget.range[entity]) {
          AutoTarget.target[entity] = 0;
        }
      }

      if (AutoTarget.target[entity] === 0) {
        searchForTarget(entity);
      }

      if (AutoTarget.target[entity] !== 0) {
        const target = AutoTarget.target[entity];
        rotateTowards(entity, target, 3);
        const now = millitimestamp();

        const timeSinceLastShot = now - Gun.lastShot[entity];
        const shootFrequency = Gun.freq[entity];

        if (timeSinceLastShot >= shootFrequency) {
          shoot(entity, target);
          Gun.lastShot[entity] = now;
        }
      }
    });
  });

  const onProjectileHit = onEnterQuery(query(Projectile, Collision));

  onProjectileHit((projectile) => {
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
  const { attach, has } = useECS();

  const target = findPhysicalEntityInsideBoundingBox(
    getWorldPosition(entity),
    AutoTarget.range[entity],
    AutoTarget.range[entity],
    (entity) => has(IsEnemy, entity),
  );

  if (target) {
    Fill[target] = "blue";
    AutoTarget.target[entity] = target;

    IsTargeted.attacker[target] = entity;
    attach(IsTargeted, target);
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

function isTargetReachable(
  source: Entity,
  target: Entity,
  collisionGroup: number = TURRET_COLLISION_GROUP,
) {
  const result = castRay(source, target, collisionGroup);
  console.log({ result });
  if (result) {
    const hit = result.entity;
    return hit === target;
  }

  return false;
}
