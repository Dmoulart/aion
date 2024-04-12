import type { Entity } from "aion-ecs";
import { type Plan, findAction } from "./action.js";
import type { Goal } from "./goal.js";
import { evaluateState, isWorldState } from "./state.js";

export function planify(
  source: Entity,
  goal: Goal,
  iter = 10,
  plan: Plan = [],
): Plan {
  //limit
  if (iter-- === 0) {
    return plan;
  }

  const [desiredState, target] = goal;

  const result = evaluateState(source, goal);
  // action is already done
  if (result === true) {
    return plan;
    // blocking world state, replanify based on this world state
  } else if (isWorldState(result)) {
    return planify(source, result, iter, plan);
    // action is doable
  } else {
    const action = findAction(desiredState);

    plan.unshift({ action, source, target });

    return planify(source, [action.preconditions, target], iter, plan);
  }
}
