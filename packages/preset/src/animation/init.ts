import { beforeStart, on } from "aion-engine";
import { useECS } from "../ecs.js";
import { onEnterQuery } from "aion-ecs";
import {
  AnimationComponent,
  getAnimation,
  getAnimationCurrentTime,
} from "./bindings.js";
import { getAnimationDuration, updateAnimation } from "./animation.js";
import { millitimestamp } from "aion-core";

export function initAnimations() {
  beforeStart(() => {
    const { query } = useECS();
    const onAnimationStart = onEnterQuery(query(AnimationComponent));

    onAnimationStart((entity) => {
      AnimationComponent.startTime[entity] = millitimestamp();
    });

    on("update", () => {
      query(AnimationComponent).each((entity) => {
        const config = getAnimation(entity);

        let time = getAnimationCurrentTime(entity);

        if (time >= getAnimationDuration(config)) {
          time = 0;
          AnimationComponent.startTime[entity] = millitimestamp();
        }

        updateAnimation(config, time, entity);
      });
    });
  });
}
