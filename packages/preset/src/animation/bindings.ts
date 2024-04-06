import { defineComponent, u32, type Entity, f32 } from "aion-ecs";
import { getAnimationConfig, getAnimationStepAtTime } from "./animation.js";
import { millitimestamp } from "aion-core";

export const AnimationComponent = defineComponent({
  animation: u32,
  startTime: f32,
});

export function getAnimationCurrentTime(entity: Entity) {
  return millitimestamp() - AnimationComponent.startTime[entity]!;
}

export function getAnimation(entity: Entity) {
  return getAnimationConfig(AnimationComponent.animation[entity]!);
}

export function getAnimationCurrentStep(entity: Entity) {
  const animation = getAnimation(entity);
  const time = getAnimationCurrentTime(entity);

  return getAnimationStepAtTime(animation, time);
}

export function setAnimationStartTime(entity: Entity, time: number) {
  AnimationComponent.startTime[entity] = time;
}
