import { Entity, defineComponent, eid, i32, u8 } from "aion-ecs";
import { on } from "aion-engine";
import {
  Collider,
  Fill,
  RuntimeBody,
  RuntimeCharacterController,
  RuntimeCollider,
  castRay,
  defineAction,
  defineBehavior,
  defineWorldState,
  getBody,
  getFirstChildOf,
  getGravity,
  getLocalPosition,
  getWorldDistance,
  setPosition,
  setRotation,
  toSimulationPoint,
  useECS,
} from "aion-preset";
import { ENEMY_COLLISION_GROUP } from "./collision-groups";
import { vec } from "aion-core";

export const CanReach = defineWorldState(
  "CanReach",
  (source: Entity, target: Entity) => {
    // return false;
    const hit = castRay(source, target, Collider.collisionGroups[source], 18.0);
    if (hit) {
      const hasHitTarget = hit.entity === target;
      if (!hasHitTarget) {
        Fill[hit.entity] = "pink";
      }
      return hasHitTarget ? true : [DoesNotExist, hit.entity];
    } else {
      return false;
    }
  },
);

export const IsAdjacentTo = defineWorldState(
  "IsAdjacentTo",
  (source: Entity, target: Entity) => {
    const distance = toSimulationPoint(getWorldDistance(source, target));
    console.log(
      "distance",
      { source, target },
      Math.abs(distance.x),
      Math.abs(distance.y),
    );
    // @todo consider y
    return Math.abs(distance.x) <= 1; // && Math.abs(distance.y) <= 4;
  },
);

export const DoesNotExist = defineWorldState(
  "IsDead",
  (_: Entity, target: Entity) => {
    const { exists } = useECS();
    return !exists(target);
  },
);

export const MoveTo = defineAction({
  effects: IsAdjacentTo,
  preconditions: CanReach,
  name: "MoveTo",
});

export const MoveToAction = defineComponent({
  target: eid,
});

export const Kill = defineAction({
  effects: DoesNotExist,
  preconditions: IsAdjacentTo,
  name: "Kill",
});

export const KillAction = defineComponent({
  target: eid,
  state: u8,
});

export const ClearWay = defineAction({
  effects: CanReach,
  preconditions: IsAdjacentTo,
  name: "ClearWay",
});
export const ClearWayAction = defineComponent({
  target: eid,
});

export function createTakeTreasureGoal(treasure: Entity) {
  const goal = new i32(2);
  goal[0] = IsAdjacentTo;
  goal[1] = treasure;
  return goal;
}

export function setupAI() {
  const { query } = useECS();

  const moveToTarget = defineBehavior(
    MoveTo,
    MoveToAction,
    (entity: Entity) => {
      const controller = RuntimeCharacterController[entity]!;
      const movement = getWorldDistance(MoveToAction.target[entity], entity)
        .norm()
        .scale(10)
        .add(getGravity());

      controller.computeColliderMovement(
        RuntimeCollider[entity]!,
        movement,
        undefined,
        ENEMY_COLLISION_GROUP,
      );

      const computedMovement = controller.computedMovement();

      RuntimeBody[entity]!.setLinvel(computedMovement, false);
    },
  );

  setupBehavior(() => {
    query(
      MoveToAction,
      RuntimeCharacterController,
      RuntimeBody,
      RuntimeCollider,
    ).each(moveToTarget);
  });

  const killTarget = defineBehavior(Kill, KillAction, (entity: Entity) => {
    console.log("kill !");

    // momentum
    if (KillAction.state[entity] === 0) {
      const body = getBody(entity);

      // @todo: this is not right
      const sword = getFirstChildOf(entity)!;
      const swordPosition = vec(getLocalPosition(sword));

      setPosition(sword, swordPosition.lerp(vec(-20, 0), 0.1));
      // setRotation(sword, )
      // body.setLinvel()
    }
  });

  setupBehavior(() => {
    query(
      MoveToAction,
      RuntimeCharacterController,
      RuntimeBody,
      RuntimeCollider,
    ).each(moveToTarget);
  });

  setupBehavior(() => {
    query(
      KillAction,
      RuntimeCharacterController,
      RuntimeBody,
      RuntimeCollider,
    ).each(killTarget);
  });
}

export function setupBehavior(behavior: () => void) {
  on("update", behavior);
}
