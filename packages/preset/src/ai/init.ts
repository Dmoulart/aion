import { onEnterQuery } from "aion-ecs";
import { useECS } from "../ecs.js";
import { beforeStart, on } from "aion-engine";
import { Brain, PlanComponent, planifyCurrentGoal } from "./brain.js";
import {
  addBehavior,
  evaluateCurrrentAction,
  getCurrentAction,
  hasBehavior,
  removeBehavior,
  terminateCurrentAction,
} from "./bindings.js";
import { WorldStateStatus, isWorldState } from "./state.js";

export function initAI() {
  beforeStart(() => {
    const { query, attach } = useECS();

    const onAddedBrain = onEnterQuery(query(Brain));

    onAddedBrain((entity) => {
      const plan = planifyCurrentGoal(entity);

      PlanComponent[entity] = plan;
      attach(PlanComponent, entity);
    });

    on("update", () => {
      query(Brain, PlanComponent).each((entity) => {
        const action = getCurrentAction(entity);

        if (action) {
          const status = evaluateCurrrentAction(entity);

          if (status === WorldStateStatus.Potential) {
            if (!hasBehavior(entity, action)) {
              addBehavior(entity, action);
            }
          }

          if (status === WorldStateStatus.Effective) {
            if (hasBehavior(entity, action)) {
              removeBehavior(entity, action);
            }

            terminateCurrentAction(entity);
          }

          if (isWorldState(status)) {
            if (hasBehavior(entity, action)) {
              removeBehavior(entity, action);
            }

            PlanComponent[entity] = planifyCurrentGoal(entity);
            // todo
          }

          console.log(action.action.name);
        } else {
          PlanComponent[entity] = planifyCurrentGoal(entity);
        }

        // beginNextAction(entity);
      });
    });
  });
}
