import { assertDefined, lerp } from "aion-core";
import {
  type TransformData,
  createTransform,
  getLocalRotation,
  getTransformRotation,
} from "../index.js";
import { mat2d } from "gl-matrix";

// export type AnimationTransform = [number, number, number]; //x,y,rot

export type AnimationState = {
  transform: {
    x?: number;
    y?: number;
    rotation?: number;
    //@todo scale ?
  };
  lerp?: number;
  onEnter?: () => void;
  onExit?: () => void;
  next?: string;
};
export type AnimationStates = Record<string, AnimationState> & {
  initial: AnimationState;
};

export type AnimationConfig = {
  states: AnimationStates;
};

export type AnimationInstance = {
  animationID: number;
  state?: string;
};

let nextAnimationID = 0;
// let nextAnimationInstanceID = 0;

const ANIMATIONS: Array<AnimationConfig> = [];
// const ANIMATIONS_INSTANCES: Array<AnimationConfig> = [];

export function defineAnimationConfig(config: AnimationConfig) {
  const id = nextAnimationID++;

  if (!config.states.initial) {
    throw new Error("You must define the animation's config initial state");
  }

  ANIMATIONS[id] = config;

  return config;
}

export function getAnimationConfig(id: number) {
  const config = ANIMATIONS[id];

  assertDefined(config);

  return config;
}

export function updateAnimation(
  config: AnimationConfig,
  currentState: string | undefined,
  output: TransformData,
) {
  const hasJustRunAnimation = currentState === undefined;

  if (hasJustRunAnimation) {
    config.states.initial.onEnter?.();
    currentState = "initial";
  }

  const state = hasJustRunAnimation
    ? config.states.initial
    : config.states[currentState!];

  assertDefined(state);

  const lerpValue = state.lerp || 0;

  let x, y, rotation: number | undefined;
  // x
  if (state.transform.x !== undefined) {
    x = lerp(output[4]!, state.transform.x, lerpValue);

    output[4] = x;
  }

  // y
  if (state.transform.y !== undefined) {
    y = lerp(output[5]!, state.transform.y, lerpValue);

    output[5] = y;
  }

  //rot
  if (state.transform.rotation !== undefined) {
    rotation = lerp(
      getTransformRotation(output),
      state.transform.rotation,
      lerpValue,
    );

    mat2d.rotate(output, output, rotation);
  }

  if (shouldMoveNextState(config, currentState!, x, y, rotation)) {
    state.onExit?.();

    const nextState = getNextState(config, currentState!);

    config.states[nextState]!.onEnter?.();

    return nextState;
  }

  return currentState!;
}

export function shouldMoveNextState(
  config: AnimationConfig,
  currentState: string,
  x?: number,
  y?: number,
  rotation?: number,
) {
  const state = config.states[currentState];

  assertDefined(state);

  const finished =
    x === state.transform.x &&
    y === state.transform.y &&
    rotation === state.transform.rotation;

  return finished;
}

export function getNextState(config: AnimationConfig, currentState: string) {
  const state = config.states[currentState];

  assertDefined(state);

  const states = Object.keys(config.states);

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

// export function runAnimation(
//   animationID: number,
//   id: number = nextAnimationInstanceID++,
// ) {
//   ANIMATIONS_INSTANCES[id] =

// }
