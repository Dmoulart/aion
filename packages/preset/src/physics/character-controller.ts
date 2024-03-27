import {
  any,
  defineComponent,
  not,
  onEnterQuery,
  onExitQuery,
  type Entity,
  i32,
  bool,
  type PrefabInstanceOptions,
  f32,
} from "aion-ecs";
import { usePhysics } from "./init.js";
import { Transform } from "../components.js";
import { Body, Collider, RuntimeBody, RuntimeCollider } from "./components.js";
import { useECS } from "../ecs.js";
import RAPIER from "@dimforge/rapier2d-compat";

export const CharacterController = defineComponent({
  offset: f32,
  snapToGround: f32,
  slideEnabled: bool,
  upDirection: [f32, 2],
  autoStepMaxHeight: f32,
  autoStepMinWidth: f32,
  autoStepIncludeRigidBodies: bool,
});

export const RuntimeCharacterController = defineComponent(() =>
  Array<RAPIER.KinematicCharacterController>(),
);

// Up direction as an array
const UP_DIRECTION = new f32(2);
UP_DIRECTION[0] = 0;
UP_DIRECTION[1] = -1;

// @todo type crap
const DEFAULT_CHARACTER_CONTROLLER_OPTIONS: PrefabInstanceOptions<{
  CharacterController: typeof CharacterController;
}>["CharacterController"] = {
  offset: 1,
  snapToGround: 0.5,
  slideEnabled: Number(true),
  upDirection: UP_DIRECTION,
  autoStepMaxHeight: 0.1,
  autoStepMinWidth: 1,
  autoStepIncludeRigidBodies: Number(true),
};

export function createCharacterController(
  options: PrefabInstanceOptions<{
    CharacterController: typeof CharacterController;
  }>["CharacterController"],
) {
  return {
    ...DEFAULT_CHARACTER_CONTROLLER_OPTIONS,
    ...options,
  };
}

export function initCharacterControllerSystem() {
  const { world } = usePhysics();
  const { query, attach } = useECS();

  const characterControllersQuery = query(
    Transform,
    CharacterController,
    any(Body, Collider),
    any(RuntimeBody, RuntimeCollider),
    not(RuntimeCharacterController),
  );

  const onCreatedCharacterController = onEnterQuery(characterControllersQuery);

  const onRemovedCharacterController = onExitQuery(query(CharacterController));

  onCreatedCharacterController((ent) => {
    const controller = world.createCharacterController(
      CharacterController.offset[ent]!,
    );
    setCharacterControllerOptions(ent, controller);
    RuntimeCharacterController[ent] = controller;

    attach(RuntimeCharacterController, ent);
  });

  onRemovedCharacterController((ent) => {
    world.removeCharacterController(RuntimeCharacterController[ent]!);
  });
}

export function setCharacterControllerOptions(
  entity: Entity,
  controller: RAPIER.KinematicCharacterController,
) {
  const snapToGround = CharacterController.snapToGround[entity]!;

  if (snapToGround) {
    controller.enableSnapToGround(CharacterController.snapToGround[entity]!);
  }

  controller.setSlideEnabled(
    Boolean(CharacterController.slideEnabled[entity]!),
  );

  const upDirection = CharacterController.upDirection[entity]!;
  if (upDirection[0] !== 0 || upDirection[1] !== 0) {
    controller.setUp({ x: upDirection[0]!, y: upDirection[1]! });
  }

  const autoStepMaxHeight = CharacterController.autoStepMaxHeight[entity]!;
  const autoStepMinWidth = CharacterController.autoStepMinWidth[entity]!;
  const autoStepIncludeRigidBodies =
    CharacterController.autoStepIncludeRigidBodies[entity]!;

  if (autoStepMaxHeight || autoStepMinWidth || autoStepIncludeRigidBodies) {
    controller.enableAutostep(
      autoStepMaxHeight,
      autoStepMinWidth,
      Boolean(autoStepIncludeRigidBodies),
    );
  }
}
