import { assert, assertDefined } from "aion-core";
import { defineComponent, type Entity } from "aion-ecs";

let nextID = 0;
const WORLD_STATES: Record<
  StateID,
  { evaluate: EvaluateWorldState; name: string }
> = {};

const WORLD_ACTIONS: Record<StateID, Action[]> = {};

export type EvaluateWorldState = (
  source: Entity,
  target: Entity,
) => boolean | WorldState; // can return the blocking worldstate

export type StateID = number;

export type WorldState = [StateID, Entity];

export type Goal = WorldState;

export type Action = {
  preconditions: StateID;
  effects: StateID;
  name: string;
};

export type PlannedAction = { action: Action; source: Entity; target: Entity };
export type Plan = PlannedAction[];

export function getState(id: StateID) {
  assertDefined(WORLD_STATES[id]!);

  return WORLD_STATES[id]!;
}

export function defineWorldState(name: string, evaluate: EvaluateWorldState) {
  const id = ++nextID;
  WORLD_STATES[id] = { name, evaluate };
  return id;
}

export function defineAction(action: Action) {
  WORLD_ACTIONS[action.effects] ??= [];
  WORLD_ACTIONS[action.effects]?.push(action);
}

export function evaluateState(source: Entity, [id, target]: WorldState) {
  assertDefined(WORLD_STATES[id]);

  return WORLD_STATES[id]!.evaluate(source, target);
}

export function findAction(desiredState: StateID): Action {
  const possibleActions = WORLD_ACTIONS[desiredState]!;

  assertDefined(
    possibleActions,
    `Cannot find action for desired state ${getState(desiredState).name}`,
  );

  return possibleActions[0]!;
}

export function isWorldState(object: unknown): object is WorldState {
  return Array.isArray(object) && object.length === 2;
}

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
  console.log("Desired state", getState(desiredState).name, { source, target });

  const result = evaluateState(source, goal);

  if (result === true) {
    return plan;
  } else if (isWorldState(result)) {
    return planify(source, result, iter, plan);
  } else {
    const action = findAction(desiredState);
    console.log("Desired state action :", action.name, { source, target });

    plan.push({ action, source, target });

    return planify(source, [action.preconditions, target], iter, plan);
  }
}
