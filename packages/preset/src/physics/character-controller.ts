import {
  any,
  defineComponent,
  not,
  onEnterQuery,
  onExitQuery,
  query,
  u32,
} from "aion-ecs";
import { usePhysics } from "./init.js";
import { Transform } from "../components.js";
import { Body, Collider, RuntimeBody, RuntimeCollider } from "./components.js";
import { useECS } from "../ecs.js";
import RAPIER from "@dimforge/rapier2d-compat";

export const CharacterController = defineComponent({
  offset: u32,
});

export const RuntimeCharacterController = defineComponent(() =>
  Array<RAPIER.KinematicCharacterController>(),
);

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

    RuntimeCharacterController[ent] = controller;

    attach(RuntimeCharacterController, ent);

    controller.enableSnapToGround(0.1);
    controller.autostepEnabled();
    controller.autostepIncludesDynamicBodies();
    controller.setSlideEnabled(true);
  });

  onRemovedCharacterController((ent) => {
    console.log("remove character controller", ent);
    world.removeCharacterController(RuntimeCharacterController[ent]!);
  });
}
