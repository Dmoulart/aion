import { defineComponent, i32, type Entity } from "aion-ecs";
import type { Plan } from "./action.js";
import { planify } from "./planify.js";

export const Brain = defineComponent({
  goal: [i32, 2],
});

export const PlanComponent = defineComponent(() => new Array<Plan>());

export function planifyCurrentGoal(entity: Entity) {
  const goal = getGoal(entity);

  return planify(entity, [goal[0]!, goal[1]!]);
}

export function getGoal(entity: Entity) {
  return Brain.goal[entity]!;
}
