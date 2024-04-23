import { Entity, defineComponent, eid, i32, u8 } from "aion-ecs";
import { on } from "aion-engine";
import {
  Collider,
  RuntimeBody,
  RuntimeCharacterController,
  RuntimeCollider,
  WorldStateStatus,
  animate,
  bindAnimationToComponent,
  castRay,
  defineAction,
  defineAnimationConfig,
  defineBehavior,
  defineWorldState,
  degreesToRadians,
  findChildOf,
  getGravity,
  getRuntimeBody,
  getRuntimeCollider,
  getWorldDistance,
  setScaleX,
  toSimulationPoint,
  useECS,
} from "aion-preset";
import { ENEMY_COLLISION_GROUP } from "./collision-groups";
import { Weapon } from "./enemy";

export const CanReach = defineWorldState(
  "CanReach",
  (source: Entity, target: Entity) => {
    // return false;
    const hit = castRay(
      source,
      target,
      Collider.collisionGroups[source],
      100.0,
    );
    if (hit) {
      const hasHitTarget = hit.entity === target;

      if (!hasHitTarget) {
        return [DoesNotExist, hit.entity];
      }

      return WorldStateStatus.Effective;
    } else {
      // let's consider the stuff is reachable but too far
      // we'll need to re-planify the actions later
      // WorldStateStatus.Potential;
      return WorldStateStatus.Effective;
    }
  },
);

export const IsAdjacentTo = defineWorldState(
  "IsAdjacentTo",
  (source: Entity, target: Entity) => {
    const distance = toSimulationPoint(getWorldDistance(source, target));

    // @todo consider y
    return Math.abs(distance.x) <= 1
      ? WorldStateStatus.Effective
      : WorldStateStatus.Potential;
  },
);

export const DoesNotExist = defineWorldState(
  "IsDead",
  (_: Entity, target: Entity) => {
    const { exists } = useECS();
    return !exists(target)
      ? WorldStateStatus.Effective
      : WorldStateStatus.Potential;
  },
);

export const MoveToAction = defineAction({
  effects: IsAdjacentTo,
  preconditions: CanReach,
  name: "MoveTo",
});

export const MoveToOrder = defineComponent({
  target: eid,
});

export const KillAction = defineAction({
  effects: DoesNotExist,
  preconditions: IsAdjacentTo,
  name: "Kill",
});

export const KillOrder = defineComponent({
  target: eid,
  state: u8,
});

export function createDestroyTreasureGoal(treasure: Entity) {
  const goal = new i32(2);
  goal[0] = DoesNotExist;
  goal[1] = treasure;
  return goal;
}

export function setupAI() {
  const { query, has } = useECS();

  const moveToTarget = defineBehavior(
    MoveToAction,
    MoveToOrder,
    (entity: Entity) => {
      const controller = RuntimeCharacterController[entity]!;
      const movement = getWorldDistance(MoveToOrder.target[entity], entity)
        .norm()
        .scale(10)
        .add(getGravity());

      controller.computeColliderMovement(
        getRuntimeCollider(entity),
        movement,
        undefined,
        ENEMY_COLLISION_GROUP,
      );
      setScaleX(entity, movement.x >= 0 ? -1 : 1);

      const computedMovement = controller.computedMovement();

      getRuntimeBody(entity).setLinvel(computedMovement, false);
    },
  );

  const AttackAnimation = defineAnimationConfig({
    steps: {
      initial: {
        updates: animate({
          x: 10,
          y: -20,
          rotation: 0,
        }),
        duration: 0.5,
      },
      momentum: {
        updates: animate({
          x: 20,
          y: 0,
          rotation: degreesToRadians(-90),
        }),
        duration: 0.1,
      },
      estoc: {
        updates: animate({
          x: -20,
          y: -10,
          rotation: degreesToRadians(-45),
        }),
        duration: 1,
      },
    },
  });

  bindAnimationToComponent(AttackAnimation, KillOrder, (entity) => {
    return findChildOf(entity, (child) => has(Weapon, child))!;
  });

  on("update", () => {
    query(
      MoveToOrder,
      RuntimeCharacterController,
      RuntimeBody,
      RuntimeCollider,
    ).each((e) => {
      moveToTarget(e);
    });
  });

  const killTarget = defineBehavior(KillAction, KillOrder, (entity: Entity) => {
    // console.log("kill !");
    // // updateAnimation(AttackAnimation, undefined, Transform[entity]!);
    // // momentum
    // if (KillAction.state[entity] === 0) {
    //   const body = getBody(entity);
    //   // @todo: this is not right
    //   const sword = getFirstChildOf(entity)!;
    //   const swordPosition = vec(getLocalPosition(sword));
    //   setPosition(sword, swordPosition.lerp(vec(-20, 0), 0.1));
    //   // setRotation(sword, )
    //   // body.setLinvel()
  });
  on("update", () => {
    const moving = query(
      MoveToOrder,
      RuntimeCharacterController,
      RuntimeBody,
      RuntimeCollider,
    );
    moving.each(moveToTarget);

    const attacking = query(
      KillOrder,
      RuntimeCharacterController,
      RuntimeBody,
      RuntimeCollider,
    );

    attacking.each(killTarget);
  });
}
