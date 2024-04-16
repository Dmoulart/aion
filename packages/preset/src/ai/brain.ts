import { defineComponent, i32, type Entity } from "aion-ecs";
import type { Plan } from "./action.js";
import { planify } from "./planify.js";
import { useECS } from "../ecs.js";

export const Brain = defineComponent({
  goal: [i32, 2],
});

export const PlanComponent = defineComponent(() => new Array<Plan>());

export function planifyCurrentGoal(entity: Entity) {
  const { exists } = useECS();
  const [state, target] = getGoal(entity);

  // maybe this target existance verification should exist at a lower level.
  if (exists(target!)) {
    return planify(entity, [state!, target!]);
  } else {
    return [];
  }
}

export function getGoal(entity: Entity) {
  return Brain.goal[entity]!;
}
