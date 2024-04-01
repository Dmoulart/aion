import { onEnterQuery } from "aion-ecs";
import { useECS } from "../ecs.js";
import { beforeStart } from "aion-engine";
import { Brain, PlanComponent, planifyGoal } from "./brain.js";
import { beginNextAction } from "./bindings.js";

export function initAI() {
  beforeStart(() => {
    const { query, attach } = useECS();

    const onAddedBrain = onEnterQuery(query(Brain));

    onAddedBrain((entity) => {
      const plan = planifyGoal(entity);
      console.log({ plan });

      PlanComponent[entity] = plan;
      attach(PlanComponent, entity);
    });

    const onAddedPlan = onEnterQuery(query(PlanComponent));

    onAddedPlan(beginNextAction);
  });
}
