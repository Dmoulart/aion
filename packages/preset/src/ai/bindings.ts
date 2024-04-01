import type { Component, Entity, Query } from "aion-ecs";
import { evaluateState, type Action, type PlannedAction } from "./goal.js";
import { useECS } from "../ecs.js";
import { PlanComponent } from "./brain.js";

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

    console.log({ result });

    cb(entity);

    // if (result !== true) {
    //   // detach(component, entity);
    //   // PlanComponent[entity]!.shift();
    //   // beginNextAction(entity);
    // } else {
    //   cb(entity);
    // }
  };
}

export function beginNextAction(entity: Entity) {
  const nextAction = PlanComponent[entity]![0];

  if (nextAction) {
    console.info("begin next action for entity", entity);
    addBehavior(entity, nextAction);
  } else {
    console.info("no next action for entity", entity);
    // throw new Error("no next Action");
  }
}
