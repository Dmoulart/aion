import { defineComponent, u32, type Entity } from "aion-ecs";

export const AnimationComponent = defineComponent({
  animation: u32,
  currentState: () => Array<string>(),
});

export function getCurrentAnimationState(entity: Entity) {
  return AnimationComponent.currentState[entity]!;
}

export function setCurrentAnimationState(entity: Entity, state: string) {
  AnimationComponent.currentState[entity] = state;
}
