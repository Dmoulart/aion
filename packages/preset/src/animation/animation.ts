import { assert, assertDefined, millitimestamp } from "aion-core";
import { useECS, AnimationComponent } from "../index.js";
import {
  onEnterQuery,
  type Component,
  onExitQuery,
  type Entity,
} from "aion-ecs";

// export type AnimationTransform = [number, number, number]; //x,y,rot

export type AnimationState = {
  updates: Record<
    string,
    {
      get: (subject: Entity) => number;
      set: (subject: Entity, to: () => number) => void;
      value: number;
    }
  >;
  time: number;
  onEnter?: () => void;
  onExit?: () => void;
};

export type AnimationStates = Record<string, AnimationState> & {
  initial: AnimationState;
};

export type AnimationConfig = {
  steps: AnimationStates;
};

export type AnimationInstance = {
  animationID: number;
  state?: string;
};

let nextAnimationID = 0;

const ANIMATIONS: Array<AnimationConfig> = [];

export function defineAnimationConfig(config: AnimationConfig) {
  const id = nextAnimationID++;

  if (!config.steps.initial) {
    throw new Error("You must define the animation's config initial state");
  }

  ANIMATIONS[id] = config;

  return id;
}

export function getAnimationConfig(id: number) {
  const config = ANIMATIONS[id];

  assertDefined(config);

  return config;
}

export function updateAnimation(
  config: AnimationConfig,
  currentTime: number,
  subject: Entity,
) {
  const stepName = getAnimationStepAtTime(config, currentTime)!;
  let nextStepName = getNextStep(config, stepName);
  const nextStep = config.steps[nextStepName]!;

  const step = config.steps[stepName]!;

  for (const id in step.updates) {
    const update = step.updates[id]!;

    const baseValue = update.value;
    const targetValue = nextStep.updates[id]!.value!;

    const distance = targetValue - baseValue;
    const sign = Math.sign(distance);

    const frames = 60 / step.time;

    const increment = distance / frames;

    const to = () => {
      const stepValue = update.get(subject) + increment;
      if (sign === 1) {
        return stepValue > targetValue // coorection
          ? targetValue
          : stepValue;
      } else {
        return stepValue < targetValue // coorection
          ? targetValue
          : stepValue;
      }

      // const stepValue = update.get(subject) + increment;
      // return stepValue > targetValue // coorection
      //   ? targetValue
      //   : stepValue;
    };

    update.set(subject, to);
  }
  const animationDuration = getAnimationDuration(config);
  const nextStepStartTime = getAnimationStepStartTime(config, nextStepName);

  const willMoveNextStep =
    (nextStepName !== "initial" &&
      nextStepStartTime - currentTime <= 60 / step.time) ||
    animationDuration - currentTime <= 60 / step.time;

  if (willMoveNextStep) {
    console.log("will move next step");
    for (const id in nextStep.updates) {
      const update = nextStep.updates[id];
      update?.set(subject, () => update.value);
    }
  }
}

export function getNextStep(config: AnimationConfig, currentState: string) {
  const state = config.steps[currentState];

  assertDefined(state);

  const states = Object.keys(config.steps);

  const index = states.findIndex((state) => state === currentState);

  let nextState: string;

  if (index === -1) {
    throw new Error("unknown state");
  } else if (index === states.length - 1) {
    nextState = states[0]!;
  } else {
    nextState = states[index + 1]!;
  }

  return nextState;
}

export function getPreviousStep(config: AnimationConfig, currentState: string) {
  const state = config.steps[currentState];

  assertDefined(state);

  const states = Object.keys(config.steps);

  const index = states.findIndex((state) => state === currentState);

  assert(index > -1, "unknown animation state");

  let previousState: string;

  if (index === 0) {
    previousState = states.at(-1)!;
  } else {
    previousState = states[index - 1]!;
  }

  return previousState;
}

export function getAnimationStepAtTime(
  animation: AnimationConfig,
  time: number,
) {
  let currentState = "initial";
  let duration = 0;

  for (const stateName in animation.steps) {
    const state = animation.steps[stateName]!;
    duration += state.time * 1000;

    if (time <= duration) {
      currentState = stateName;
      break;
    }
  }

  return currentState;
}

export function getAnimationStepStartTime(
  animation: AnimationConfig,
  step: string,
) {
  let startTime = 0;

  for (const stepName in animation.steps) {
    const state = animation.steps[stepName]!;
    startTime += state.time * 1000;

    if (step === stepName) {
      break;
    }
  }

  return startTime;
}

export function getAnimationDuration(animation: AnimationConfig) {
  let duration = 0;

  for (const stateName in animation.steps) {
    const state = animation.steps[stateName]!;
    duration += state.time * 1000;
  }

  return duration;
}

export function bindAnimationToComponent(
  animationID: number,
  component: Component,
  getTargetEntity: (entity: Entity) => Entity = (entity) => entity,
) {
  const { query, attach, detach } = useECS();

  const onComponentAdded = onEnterQuery(query(component));

  onComponentAdded((entity) => {
    const target = getTargetEntity(entity);
    AnimationComponent.animation[target] = animationID;
    AnimationComponent.startTime[target] = millitimestamp();
    attach(AnimationComponent, target);
  });

  const onComponentRemoved = onExitQuery(query(component));

  onComponentRemoved((entity) => {
    const target = getTargetEntity(entity);
    detach(AnimationComponent, target);
  });
}

export function attachAnimationTo(entity: Entity, animationID: number) {
  const { attach } = useECS();

  AnimationComponent.animation[entity] = animationID;
  AnimationComponent.startTime[entity] = millitimestamp();

  attach(AnimationComponent, entity);
}
