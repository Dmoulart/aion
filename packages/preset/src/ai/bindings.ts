import type { Component, Entity } from "aion-ecs";
import { useECS } from "../ecs.js";
import { PlanComponent } from "./brain.js";
import type { Action, PlannedAction } from "./action.js";
import { evaluateState } from "./state.js";
import { assertDefined } from "aion-core";

// not ideal
type BehaviorComponent = Component & { target: Uint32Array };
const BEHAVIORS_COMPONENTS: Record<Action["name"], BehaviorComponent> = {};

export function addBehavior(entity: Entity, { action, target }: PlannedAction) {
  const { attach } = useECS();
  const component = BEHAVIORS_COMPONENTS[action.name]!;
  component.target[entity] = target;
  attach(component, entity);
}

export function removeBehavior(entity: Entity, { action }: PlannedAction) {
  const { detach } = useECS();
  const component = BEHAVIORS_COMPONENTS[action.name]!;
  detach(component, entity);
}

export function hasBehavior(entity: Entity, { action, target }: PlannedAction) {
  const { has } = useECS();
  const component = BEHAVIORS_COMPONENTS[action.name]!;
  component.target[entity] = target;
  return has(component, entity);
}

export function defineBehavior(
  action: Action,
  component: BehaviorComponent,
  cb: (entity: Entity) => void,
) {
  BEHAVIORS_COMPONENTS[action.name] = component;

  return (entity: Entity) => {
    cb(entity);
    // if (!exists(component.target[entity]!)) {
    //   const plan = planifyCurrentGoal(entity);
    //   PlanComponent[entity] = plan;
    //   beginNextAction(entity);
    //   return;
    // }
    // const result = evaluateState(entity, [
    //   action.preconditions,
    //   component.target[entity]!,
    // ]);
    // if (result === WorldStateStatus.Effective) {
    //   //@todo remove components in another system ?
    //   // once("update", () => {
    //   detach(component, entity);
    //   PlanComponent[entity]!.shift();
    //   beginNextAction(entity);
    //   // });
    // } else {
    //   cb(entity);
    // }
    // const isActionDone = evaluateState(entity, [
    //   action.effects,
    //   component.target[entity]!,
    // ]);
    // if (isActionDone) {
    //   //@todo remove components in another system ?
    //   // removing component in the current system make the all things wacky
    //   // once("update", () => {
    //   detach(component, entity);
    //   PlanComponent[entity]!.shift();
    //   beginNextAction(entity);
    //   // });
    // }
  };
}

export function getCurrentAction(entity: Entity) {
  return PlanComponent[entity]![0];
}

export function terminateCurrentAction(entity: Entity) {
  PlanComponent[entity]!.shift();
}

export function evaluateCurrrentAction(entity: Entity) {
  const action = getCurrentAction(entity);

  assertDefined(action);

  return evaluateState(entity, [action.action.effects, action.target]);
}
