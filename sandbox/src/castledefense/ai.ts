import { Entity, i32 } from "aion-ecs";
import {
  Collider,
  Fill,
  castRay,
  defineAction,
  defineWorldState,
  getWorldDistance,
  useECS,
} from "aion-preset";

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
    const hit = castRay(source, target, Collider.collisionGroups[source], 8.0);
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

export const Kill = defineAction({
  effects: DoesNotExist,
  preconditions: IsAdjacentTo,
  name: "Kill",
});

export const ClearWay = defineAction({
  effects: CanReach,
  preconditions: IsAdjacentTo,
  name: "ClearWay",
});

// const plan = planify(1, [DoesNotExist, 2]);

// console.log(plan);

export function createTakeTreasureGoal(treasure: Entity) {
  const goal = new i32(2);
  goal[0] = IsAdjacentTo;
  goal[1] = treasure;
  return goal;
}
