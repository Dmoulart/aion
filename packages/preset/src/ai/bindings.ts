import type { Component, Entity, Query } from "aion-ecs";
import { useECS } from "../ecs.js";
import { PlanComponent } from "./brain.js";
import { once } from "aion-engine";
import type { Action, PlannedAction } from "./action.js";
import { evaluateState } from "./state.js";

const BEHAVIORS_COMPONENTS: Record<Action["name"], Component> = {};

export function addBehavior(entity: Entity, { action, target }: PlannedAction) {
  const { attach } = useECS();
  const component = BEHAVIORS_COMPONENTS[action.name]!;
  (component as any).target[entity] = target;
  attach(component, entity);
}

export function defineBehavior(
  action: Action,
  component: Component,
  cb: (entity: Entity) => void,
) {
  const { detach } = useECS();

  BEHAVIORS_COMPONENTS[action.name] = component;

  return (entity: Entity) => {
    const result = evaluateState(entity, [
      action.preconditions,
      (component as any).target[entity],
    ]);

    if (result !== true) {
      //@todo remove components in another system ?
      once("update", () => {
        console.log("ACTION Aborted");

        detach(component, entity);

        PlanComponent[entity]!.shift();

        beginNextAction(entity);
      });
    } else {
      cb(entity);
    }

    const isActionDone = evaluateState(entity, [
      action.effects,
      (component as any).target[entity],
    ]);

    if (isActionDone) {
      //@todo remove components in another system ?
      // removing component in the current system make the all things wacky
      once("update", () => {
        console.log("ACTION Done");

        detach(component, entity);

        PlanComponent[entity]!.shift();

        beginNextAction(entity);
      });
    }
  };
}

export function beginNextAction(entity: Entity) {
  const nextAction = PlanComponent[entity]![0];

  if (nextAction) {
    console.info("begin next action for entity", entity);
    addBehavior(entity, nextAction);
  } else {
    console.info("no next action for entity", entity);
  }
}
