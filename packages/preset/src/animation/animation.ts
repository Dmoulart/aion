import { assert, assertDefined, millitimestamp } from "aion-core";
import { useECS, AnimationComponent } from "../index.js";
import {
  onEnterQuery,
  type Component,
  onExitQuery,
  type Entity,
} from "aion-ecs";

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

    if (sign === -1) {
      debugger;
    }

    const unit = distance / (step.time * 1000);

    const to = () => {
      return (
        baseValue +
        unit * getElaspedTimeSinceStepStart(config, stepName, currentTime)
      );
    };

    update.set(subject, to);
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
  if (step === "initial") return 0;

  let startTime = 0;

  for (const stepName in animation.steps) {
    const state = animation.steps[stepName]!;

    if (step === stepName) {
      break;
    }

    startTime += state.time * 1000;
  }

  return startTime;
}

export function getElaspedTimeSinceStepStart(
  animation: AnimationConfig,
  step: string,
  time: number,
) {
  return time - getAnimationStepStartTime(animation, step);
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
