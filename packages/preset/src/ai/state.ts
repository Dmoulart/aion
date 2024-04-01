import { assertDefined } from "aion-core";
import type { Entity } from "aion-ecs";

let nextStateID = 0;

const WORLD_STATES: Record<
  StateID,
  { evaluate: EvaluateWorldState; name: string }
> = {};

export type EvaluateWorldState = (
  source: Entity,
  target: Entity,
) => boolean | WorldState; // can return the blocking worldstate

export type StateID = number;

export type WorldState = [StateID, Entity];

export function getState(id: StateID) {
  assertDefined(WORLD_STATES[id]!);

  return WORLD_STATES[id]!;
}

export function defineWorldState(name: string, evaluate: EvaluateWorldState) {
  const id = ++nextStateID;
  WORLD_STATES[id] = { name, evaluate };
  return id;
}

export function evaluateState(source: Entity, [id, target]: WorldState) {
  assertDefined(WORLD_STATES[id]);

  return WORLD_STATES[id]!.evaluate(source, target);
}

export function isWorldState(object: unknown): object is WorldState {
  return Array.isArray(object) && object.length === 2;
}
