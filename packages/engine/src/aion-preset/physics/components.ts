import RAPIER from "@dimforge/rapier2d-compat";
import { defineComponent } from "aion-ecs";

export const Collider = defineComponent(() => new Array<RAPIER.ColliderDesc>());
export const RuntimeCollider = defineComponent(
  () => new Array<RAPIER.Collider>()
);

export const Body = defineComponent(() => new Array<RAPIER.RigidBodyDesc>());
export const RuntimeBody = defineComponent(() => new Array<RAPIER.RigidBody>());
