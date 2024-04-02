import { beforeStart, on } from "aion-engine";
import { useECS } from "../ecs.js";
import { onEnterQuery, onExitQuery } from "aion-ecs";
import {
  AnimationComponent,
  getCurrentAnimationState,
  setCurrentAnimationState,
} from "./bindings.js";
import { getAnimationConfig, updateAnimation } from "./animation.js";
import { Transform, getTransform } from "../index.js";

export function initAnimations() {
  beforeStart(() => {
    const { query } = useECS();
    const onAnimationStart = onEnterQuery(query(AnimationComponent, Transform));
    onAnimationStart((entity) => {
      AnimationComponent.currentState[entity] = "initial";
    });

    on("update", () => {
      query(AnimationComponent, Transform).each((entity) => {
        const config = getAnimationConfig(
          AnimationComponent.animation[entity]!,
        );

        const state = getCurrentAnimationState(entity);
        console.log("state", state);

        const nextState = updateAnimation(config, state, getTransform(entity));

        setCurrentAnimationState(entity, nextState);
      });
    });
  });
}
