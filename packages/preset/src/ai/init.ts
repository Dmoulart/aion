import { onEnterQuery } from "aion-ecs";
import { useECS } from "../ecs.js";
import { beforeStart } from "aion-engine";
import { Brain, PlanComponent, planifyGoal } from "./brain.js";

export function initAI() {
  beforeStart(() => {
    const { query, attach } = useECS();

    const onAddedBrain = onEnterQuery(query(Brain));

    onAddedBrain((entity) => {
      const plan = planifyGoal(entity);

      PlanComponent[entity] = plan;
      attach(PlanComponent, entity);
    });
  });
}
