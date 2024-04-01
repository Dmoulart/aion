import { assertDefined } from "aion-core";
import type { Entity } from "aion-ecs";
import { type StateID, getState } from "./state.js";

const WORLD_ACTIONS: Record<StateID, Action[]> = {};

export type Action = {
  preconditions: StateID;
  effects: StateID;
  name: string;
};

export type PlannedAction = { action: Action; source: Entity; target: Entity };

export type Plan = PlannedAction[];

export function defineAction(action: Action) {
  WORLD_ACTIONS[action.effects] ??= [];
  WORLD_ACTIONS[action.effects]?.push(action);
  return action;
}
export function findAction(desiredState: StateID): Action {
  const possibleActions = WORLD_ACTIONS[desiredState]!;

  assertDefined(
    possibleActions,
    `Cannot find action for desired state ${getState(desiredState).name}`,
  );

  return possibleActions[0]!;
}
