import {
  Component,
  Entity,
  defineComponent,
  eid,
  i32,
  onEnterQuery,
  query,
} from "aion-ecs";
import { on } from "aion-engine";
import {
  Collider,
  Fill,
  PlanComponent,
  PlannedAction,
  RuntimeBody,
  RuntimeCharacterController,
  RuntimeCollider,
  castRay,
  defineAction,
  defineWorldState,
  getGravity,
  getWorldDistance,
  useECS,
} from "aion-preset";
import { ENEMY_COLLISION_GROUP } from "./collision-groups";

// const Destroy = (e: Entity) =>
//   defineGoal(
//     () => isAdjacentTo(e),
//     () => {
//     const {
//       $ecs: { exists },
//     } = useGame();

//     return !exists(e);
//   });

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
    const distance = getWorldDistance(source, target);
    return Math.abs(distance.x) <= 2 && Math.abs(distance.y) <= 2;
  },
);

export const DoesNotExist = defineWorldState(
  "IsDead",
  (_: Entity, target: Entity) => {
    const { exists } = useECS();
    return exists(target);
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
});

export const ClearWay = defineAction({
  effects: CanReach,
  preconditions: IsAdjacentTo,
  name: "ClearWay",
});
export const ClearWayAction = defineComponent({
  target: eid,
});

// const plan = planify(1, [DoesNotExist, 2]);

// console.log(plan);

export function createTakeTreasureGoal(treasure: Entity) {
  const goal = new i32(2);
  goal[0] = IsAdjacentTo;
  goal[1] = treasure;
  return goal;
}

export function setupAI() {
  const { query } = useECS();

  const onAddedPlan = onEnterQuery(query(PlanComponent));

  onAddedPlan((entity) => {
    const nextAction = PlanComponent[entity]![0];

    if (nextAction) {
      attachAction(entity, nextAction);
    }
  });

  setupBehavior(moveToBehavior);
}

export function attachAction(entity: Entity, action: PlannedAction) {
  const { attach } = useECS();

  let component: Component;

  switch (action.action.name) {
    case "MoveTo":
      component = MoveToAction;
      break;
    case "Kill":
      component = KillAction;
      break;
    case "ClearWay":
      component = KillAction;
      break;
    default:
      throw new Error(`No component for action ${action.action.name}`);
  }

  component.target[entity] = action.target;
  attach(component, entity);
}

export function setupBehavior(behavior: () => void) {
  on("update", behavior);
}

export function moveToBehavior() {
  const { query } = useECS();

  query(
    MoveToAction,
    RuntimeCharacterController,
    RuntimeBody,
    RuntimeCollider,
  ).each((entity) => {
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

    RuntimeBody[entity]!.setLinvel(controller.computedMovement(), false);
  });
}
