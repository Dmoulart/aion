import RAPIER from "@dimforge/rapier2d-compat";
import { bool, defineComponent, f32, i32, u16, u8 } from "aion-ecs";

export const Collider = defineComponent({
  auto: bool,
  enabled: bool,
  massPropsMode: f32,
  mass: f32,
  centerOfMassX: f32,
  centerOfMassY: f32,
  principalAngularInertia: f32,
  rotationsEnabled: bool,
  density: f32,
  friction: f32,
  restitution: f32,
  rotation: f32,
  isSensor: bool,
  collisionGroups: f32,
  solverGroups: f32,
  frictionCombineRule: f32,
  restitutionCombineRule: f32,
  activeEvents: f32,
  activeHooks: f32,
  activeCollisionTypes: f32,
  contactForceEventThreshold: f32,
  principalAngularInertiaX: f32,
  principalAngularInertiaY: f32,
  angularInertiaLocalFrame: f32,
});

export const RuntimeCollider = defineComponent(
  () => new Array<RAPIER.Collider>(),
);

export const Body = defineComponent(() => new Array<RAPIER.RigidBodyDesc>());

export const RuntimeBody = defineComponent(() => new Array<RAPIER.RigidBody>());

export const Collision = defineComponent({});
