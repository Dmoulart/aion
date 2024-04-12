import type { Component, Entity, Query, Type } from "aion-ecs";
import { useECS } from "../ecs.js";
import { PlanComponent, planifyCurrentGoal } from "./brain.js";
import { once } from "aion-engine";
import type { Action, PlannedAction } from "./action.js";
import { evaluateState, isWorldState } from "./state.js";

// not ideal
type BehaviorComponent = Component & { target: Uint32Array };
const BEHAVIORS_COMPONENTS: Record<Action["name"], BehaviorComponent> = {};

export function addBehavior(entity: Entity, { action, target }: PlannedAction) {
  const { attach } = useECS();
  const component = BEHAVIORS_COMPONENTS[action.name]!;
  component.target[entity] = target;
  attach(component, entity);
}

export function defineBehavior(
  action: Action,
  component: BehaviorComponent,
  cb: (entity: Entity) => void,
) {
  const { detach, exists } = useECS();

  BEHAVIORS_COMPONENTS[action.name] = component;

  return (entity: Entity) => {
    if (!exists(component.target[entity]!)) {
      const plan = planifyCurrentGoal(entity);

      PlanComponent[entity] = plan;

      beginNextAction(entity);
      return;
    }

    const result = evaluateState(entity, [
      action.preconditions,
      component.target[entity]!,
    ]);

    if (result !== true) {
      //@todo remove components in another system ?
      // once("update", () => {
      detach(component, entity);

      PlanComponent[entity]!.shift();

      beginNextAction(entity);
      // });
    } else {
      cb(entity);
    }

    const isActionDone = evaluateState(entity, [
      action.effects,
      component.target[entity]!,
    ]);

    if (isActionDone) {
      //@todo remove components in another system ?
      // removing component in the current system make the all things wacky
      // once("update", () => {
      detach(component, entity);

      PlanComponent[entity]!.shift();

      beginNextAction(entity);
      // });
    }
  };
}

export function beginNextAction(entity: Entity) {
  const nextAction = getNextAction(entity);

  if (nextAction) {
    const isDone = evaluateNextAction(entity);
    const { exists } = useECS();

    if (!exists(nextAction.target)) {
      debugger;
      const plan = planifyCurrentGoal(entity);

      PlanComponent[entity] = plan;
      // beginNextAction(entity);
      return;
    }

    if (isDone === false) {
      console.info("begin next action for entity", {
        entity,
        name: nextAction.action.name,
        source: nextAction.source,
        target: nextAction.target,
      });
      addBehavior(entity, nextAction);
    } else if (isWorldState(isDone)) {
      debugger;
      const plan = planifyCurrentGoal(entity);
      console.info("planify next action for entity", {
        plan,
      });
      PlanComponent[entity] = plan;
    }
  } else {
    console.info("no next action for entity", entity);

    const plan = planifyCurrentGoal(entity);
    console.info("planify next action for entity", {
      plan,
    });

    PlanComponent[entity] = plan;
    // beginNextAction(entity);
    // wooow loop
  }
}
export function getNextAction(entity: Entity) {
  return PlanComponent[entity]![0]!;
}

export function evaluateNextAction(entity: Entity) {
  const action = getNextAction(entity);

  return evaluateState(entity, [action.action.effects, action.target]);
}
