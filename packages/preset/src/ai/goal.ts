import { assert, assertDefined } from "aion-core";
import { defineComponent, type Entity } from "aion-ecs";

// export const ACTIONS = {
//   Kill: 0,
//   MoveTo: 1,
//   AdjacentTo: 2,
// } as const;

// export type Goal = {
//   precondition: () => boolean;
//   desiredWorldState: () => boolean;
// };

// export type Action = {
//   precondition: () => boolean;
//   effect: () => void;
// };

// export function defineGoal(
//   precondition: () => boolean,
//   desiredWorldState: () => boolean,
// ) {}

// export const ACTIONS = {
//   Kill: 0,
//   MoveTo: 1,
//   AdjacentTo: 2,
// } as const;

// umwelt
// export const State = {
//   IsAdjacentTo: 0,
//   CanReach: 1,
//   Dead: 2,
// } as const;

// export const verify: Record<
//   State,
//   (source: Entity, Target: Entity) => boolean | WorldState
// > = {
//   [State.IsAdjacentTo](source: Entity, subject: Entity) {
//     return true;
//   },
//   [State.CanReach](source: Entity, subject: Entity) {
//     return [State.Dead, 3];
//   },
//   [State.Dead](source: Entity, subject: Entity) {
//     return false;
//   },
// };

// export type State = (typeof State)[keyof typeof State];
// export type Subject = Entity;

// //
// export type Goal = {
//   desire: WorldState[];
// };

// export type Action = {
//   preconditions: WorldState[];
//   effect: WorldState[];
// };

// export type Plan = Action[];

// export type WorldState = [State, Subject];

// const MoveTo = (ent: Entity): Action => ({
//   preconditions: [[State.CanReach, ent]],
//   effect: [[State.IsAdjacentTo, ent]],
// });

// const Kill = (ent: Entity): Action => ({
//   preconditions: [[State.IsAdjacentTo, ent]],
//   effect: [[State.Dead, ent]],
// });

// // keyed by effects
// const ACTIONS: Record<State, Action[]> = {};

// export function defineAction(): Action {}

// export function planify(entity: Entity, desire: WorldState): Plan {
//   const [desiredState, target] = desire;

//   const accomplished = verify[desiredState](entity, target);

//   if (accomplished === true) {
//     return [];
//   }

//   accomplished
// }

// planify(1, [State.Dead, 2]);

// console.log(Kill(1));
//
//
// export type Goal = {
//   precondition: () => boolean;
//   desiredWorldState: () => boolean;
// };

// export type Action = {
//   precondition: () => boolean;
//   effect: () => void;
// };
//

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

export type Plan = Action[];

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
export function planify(source: Entity, goal: Goal, plan: Plan = []): Plan {
  const [desiredState, target] = goal;
  console.log("Desired state", getState(desiredState).name);

  const result = evaluateState(source, goal);

  if (result === true) {
    return [];
  } else if (isWorldState(result)) {
    const [necessaryState, target] = result;
    const action = findAction(necessaryState);

    console.log("Necessary state : ", getState(necessaryState).name);
    console.log("Necessary state action :", action.name);
    plan.push(action);

    return planify(source, [action.preconditions, target]);
  } else {
    const action = findAction(desiredState);
    console.log("Desired state action :", action.name);

    plan.push(action);

    return planify(source, [action.preconditions, target]);
  }
}

// const plan = planify(1, [DoesNotExist, 2]);

// console.log(plan);
//
//
// const CanReach = defineWorldState(
//   "CanReach",
//   (source: Entity, target: Entity) => {
//     // return false;

//     return Math.random() > 0.5 ? [DoesNotExist, 3] : true;
//   },
// );

// const IsAdjacentTo = defineWorldState(
//   "IsAdjacentTo",
//   (source: Entity, target: Entity) => {
//     return false;
//   },
// );

// const DoesNotExist = defineWorldState(
//   "IsDead",
//   (source: Entity, target: Entity) => {
//     return false;
//   },
// );

// const MoveTo = defineAction({
//   effects: IsAdjacentTo,
//   preconditions: CanReach,
//   name: "MoveTo",
// });

// const Kill = defineAction({
//   effects: DoesNotExist,
//   preconditions: IsAdjacentTo,
//   name: "Kill",
// });

// const ClearWay = defineAction({
//   effects: CanReach,
//   preconditions: IsAdjacentTo,
//   name: "ClearWay",
// });
