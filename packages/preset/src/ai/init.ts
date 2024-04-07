import { onEnterQuery } from "aion-ecs";
import { useECS } from "../ecs.js";
import { beforeStart } from "aion-engine";
import { Brain, PlanComponent, planifyCurrentGoal } from "./brain.js";
import { beginNextAction } from "./bindings.js";

export function initAI() {
  beforeStart(() => {
    const { query, attach } = useECS();

    const onAddedBrain = onEnterQuery(query(Brain));

    onAddedBrain((entity) => {
      const plan = planifyCurrentGoal(entity);

      PlanComponent[entity] = plan;
      attach(PlanComponent, entity);
    });

    const onAddedPlan = onEnterQuery(query(PlanComponent));

    onAddedPlan(beginNextAction);
  });
}
