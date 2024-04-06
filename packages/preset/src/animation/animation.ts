import { assertDefined, lerp } from "aion-core";
import {
  useECS,
  AnimationComponent,
  Transform,
  getTransformRotation,
  setTransformRotation,
  setTransformX,
  setTransformY,
  getTransformX,
  getTransformY,
} from "../index.js";
import {
  onEnterQuery,
  type Component,
  onExitQuery,
  type Entity,
} from "aion-ecs";

// export type AnimationTransform = [number, number, number]; //x,y,rot

export type AnimationState = {
  transform: {
    x?: number;
    y?: number;
    rotation?: number;
    //@todo scale ?
  };
  time: number;
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

  return id;
}

export function getAnimationConfig(id: number) {
  const config = ANIMATIONS[id];

  assertDefined(config);

  return config;
}

export function updateAnimation(
  config: AnimationConfig,
  currentState: string | undefined,
  output: Transform,
) {
  const hasJustRunAnimation = !currentState;

  if (hasJustRunAnimation) {
    config.states.initial.onEnter?.();
    currentState = "initial";
  }

  const state = hasJustRunAnimation
    ? config.states.initial
    : config.states[currentState!];

  assertDefined(state);

  const lerpValue = state.lerp || 1;

  let x, y, rotation: number | undefined;
  debugger;
  // x
  if (state.transform.x !== undefined) {
    x = lerp(getTransformX(output), state.transform.x, lerpValue);

    setTransformX(output, x);
  }

  // y
  if (state.transform.y !== undefined) {
    y = lerp(getTransformY(output), state.transform.y, lerpValue);

    setTransformY(output, y);
  }

  //rot
  if (state.transform.rotation !== undefined) {
    debugger;

    const currentRotation = getTransformRotation(output);

    const desiredRotation = state.transform.rotation;

    rotation = lerp(currentRotation, desiredRotation, lerpValue);

    setTransformRotation(output, rotation);
  }

  if (shouldMoveNextState(config, currentState!, x, y, rotation)) {
    state.onExit?.();

    const nextState = getNextState(config, currentState!);

    config.states[nextState]!.onEnter?.();

    return nextState;
  }

  return currentState!;
}

function keepThreeDecimals(num: number) {
  return Math.floor(num * 1_000) / 1_000;
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

  const endX = x !== undefined && state.transform.x !== undefined;

  const hasEndedX = endX ? state.transform.x === x : true;

  const endY = y !== undefined && state.transform.y !== undefined;

  const hasEndedY = endY ? state.transform.y === y : true;

  console.log(x, state.transform.x);
  console.log(y, state.transform.y);

  // const endRotation =
  //   rotation !== undefined && state.transform.rotation !== undefined;

  // const hasEndedRotation = endRotation
  //   ? keepThreeDecimals(rotation as number) - endRotation < 0.1
  //   : true;

  const finished = hasEndedX && hasEndedY;

  // const finished =
  //   keepThreeDecimals(x) === state.transform.x &&
  //   y === state.transform.y &&
  //   (endRotationValue
  //     ? keepThreeDecimals(rotation as number) ===
  //       keepThreeDecimals(endRotationValue)
  //     : true);

  // const finished =
  //   x === state.transform.x &&
  //   y === state.transform.y &&
  //   (endRotationValue
  //     ? keepThreeDecimals(rotation as number) ===
  //       keepThreeDecimals(endRotationValue)
  //     : true);

  // console.log({
  //   finished,
  //   rotation: keepThreeDecimals(rotation as number),
  //   stateRotation: keepThreeDecimals(endRotation as number),
  //   x,
  //   endX: state.transform.x,
  //   y,
  //   endY: state.transform.y,
  // });

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
    AnimationComponent.currentState[target] = "";
    attach(AnimationComponent, target);
  });

  const onComponentRemoved = onExitQuery(query(component));

  onComponentRemoved((entity) => {
    const target = getTargetEntity(entity);
    detach(AnimationComponent, target);
  });
}

export function attachAnimationTo(
  entity: Entity,
  animationID: number,
  initialState = "initial",
) {
  const { attach } = useECS();

  AnimationComponent.animation[entity] = animationID;
  AnimationComponent.currentState[entity] = initialState;

  attach(AnimationComponent, entity);
}
