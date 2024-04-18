import { defineComponent, bool, f32, u8, eid } from "aion-ecs";

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

export const Body = defineComponent({
  enabled: bool,
  type: u8,
  translationX: f32,
  translationY: f32,
  rotation: f32,
  gravityScale: f32,
  mass: f32,
  massOnly: bool,
  centerOfMassX: f32,
  centerOfMassY: f32,
  translationsEnabledX: bool,
  translationsEnabledY: bool,
  linvelX: f32,
  linvelY: f32,
  angvel: f32,
  principalAngularInertia: f32,
  rotationsEnabled: bool,
  linearDamping: f32,
  angularDamping: f32,
  canSleep: bool,
  sleeping: bool,
  ccdEnabled: bool,
  dominanceGroup: f32,
  additionalSolverIterations: f32,
});

export const Collision = defineComponent({
  with: eid,
});

export const Contact = defineComponent({});
