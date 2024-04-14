import {
  defineComponent,
  u32,
  type Entity,
  f32,
  onEnterQuery,
  onExitQuery,
  type Component,
  bool,
} from "aion-ecs";
import { getAnimationConfig, getAnimationStepAtTime } from "./animation.js";
import { millitimestamp } from "aion-core";
import { useECS } from "../ecs.js";

export const AnimationComponent = defineComponent({
  animation: u32,
  startTime: f32,
  endsAfterCurrentCycle: bool,
  // remaining: u32, // if 0 it means infinite loop
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

export function bindAnimationToComponent(
  animationID: number,
  component: Component,
  getTargetEntity: (entity: Entity) => Entity = (entity) => entity,
) {
  const { query, detach } = useECS();

  const onComponentAdded = onEnterQuery(query(component));

  onComponentAdded((entity) => {
    const target = getTargetEntity(entity);

    attachAnimationTo(target, animationID);
  });

  const onComponentRemoved = onExitQuery(query(component));

  onComponentRemoved((entity) => {
    debugger;
    const target = getTargetEntity(entity);

    setAnimationEndsAfterCurrentCycle(target, true);
  });
}

export function attachAnimationTo(entity: Entity, animationID: number) {
  const { attach } = useECS();

  // reinitialize animation
  AnimationComponent.animation[entity] = animationID;
  AnimationComponent.startTime[entity] = millitimestamp();
  AnimationComponent.endsAfterCurrentCycle[entity] = Number(false);

  attach(AnimationComponent, entity);
}

export function setAnimationEndsAfterCurrentCycle(
  entity: Entity,
  willEnd: boolean,
) {
  AnimationComponent.endsAfterCurrentCycle[entity] = Number(willEnd);
}

export function animationWillEndAfterCurrentCycle(entity: Entity) {
  return AnimationComponent.endsAfterCurrentCycle[entity]!;
}
// export function getAnimationEndTime(entity: Entity) {
//   return AnimationComponent.endTime[entity]!;
// }
