import RAPIER from "@dimforge/rapier2d-compat";
import { bool, defineComponent } from "aion-ecs";

export const Collider = defineComponent({
  auto: bool,
});

export const RuntimeCollider = defineComponent(
  () => new Array<RAPIER.Collider>(),
);

export const Body = defineComponent(() => new Array<RAPIER.RigidBodyDesc>());
export const RuntimeBody = defineComponent(() => new Array<RAPIER.RigidBody>());
