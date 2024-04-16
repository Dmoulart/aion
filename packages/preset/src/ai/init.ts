import { onEnterQuery } from "aion-ecs";
import { useECS } from "../ecs.js";
import { beforeStart, on } from "aion-engine";
import { Brain, PlanComponent, planifyCurrentGoal } from "./brain.js";
import {
  addBehavior,
  evaluateCurrrentActionConditions,
  evaluateCurrrentActionEffects,
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
          // maybe the action conditions are not effective anymore and we need to planify again
          const conditions = evaluateCurrrentActionConditions(entity);

          if (conditions !== WorldStateStatus.Effective) {
            if (hasBehavior(entity, action)) {
              removeBehavior(entity, action);
            }

            PlanComponent[entity] = planifyCurrentGoal(entity);
            // let's wait for the next plan evaluation
            return;
          }

          // maybe the action effects are effective now and we need to trigger next action or re-planify
          const status = evaluateCurrrentActionEffects(entity);

          if (status === WorldStateStatus.Potential) {
            if (!hasBehavior(entity, action)) {
              addBehavior(entity, action);
            }
          } else if (status === WorldStateStatus.Effective) {
            if (hasBehavior(entity, action)) {
              removeBehavior(entity, action);
            }

            terminateCurrentAction(entity);
          } else if (isWorldState(status)) {
            if (hasBehavior(entity, action)) {
              removeBehavior(entity, action);
            }

            PlanComponent[entity] = planifyCurrentGoal(entity);
            // todo
          }
        } else {
          PlanComponent[entity] = planifyCurrentGoal(entity);
        }
      });
    });
  });
}
