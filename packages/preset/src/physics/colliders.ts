import { SparseSet, type Entity, type PrefabInstanceOptions } from "aion-ecs";
import { Collider, RuntimeCollider } from "./components.js";
import RAPIER from "@dimforge/rapier2d-compat";

// @todo: these seems to be the defaults of RAPIER but it does not work.
// Collider init is not ideal
const DEFAULT_COLLIDER_OPTIONS: PrefabInstanceOptions<{
  Collider: typeof Collider;
}>["Collider"] = {
  enabled: Number(true),
  massPropsMode: RAPIER.MassPropsMode.Density,
  density: 1.0,
  friction: 0.5,
  restitution: 0.0,
  rotation: RAPIER.RotationOps.identity(),
  isSensor: Number(false),
  collisionGroups: 0xffff_ffff,
  solverGroups: 0xffff_ffff,
  frictionCombineRule: RAPIER.CoefficientCombineRule.Average,
  restitutionCombineRule: RAPIER.CoefficientCombineRule.Average,
  activeCollisionTypes: RAPIER.ActiveCollisionTypes.DEFAULT,
  activeEvents: RAPIER.ActiveEvents.COLLISION_EVENTS,
  activeHooks: RAPIER.ActiveHooks.NONE,
  mass: 1.0,
  centerOfMassX: 0.0,
  centerOfMassY: 0.0,
  contactForceEventThreshold: 0.0,
  principalAngularInertiaX: 0.0,
  principalAngularInertiaY: 0.0,
  angularInertiaLocalFrame: RAPIER.RotationOps.identity(),
};

export function createCollider(
  options: PrefabInstanceOptions<{ Collider: typeof Collider }>["Collider"],
) {
  return {
    ...DEFAULT_COLLIDER_OPTIONS,
    ...options,
  };
}

export function setColliderOptions(
  colliderDesc: RAPIER.ColliderDesc,
  entity: Entity,
) {
  colliderDesc.setActiveEvents(Collider.activeEvents[entity]!);
  colliderDesc.setActiveCollisionTypes(Collider.activeCollisionTypes[entity]!);
  colliderDesc.setCollisionGroups(Collider.collisionGroups[entity]!);
  colliderDesc.setActiveHooks(Collider.activeHooks[entity]!);
  colliderDesc.setContactForceEventThreshold(
    Collider.contactForceEventThreshold[entity]!,
  );
  colliderDesc.setDensity(Collider.density[entity]!);
  colliderDesc.setFriction(Collider.friction[entity]!);
  colliderDesc.setSensor(Boolean(Collider.isSensor[entity]!));
  colliderDesc.setMass(Collider.mass[entity]!);
  // colliderDesc.setMassProperties(
  //   Collider.mass[entity]!,
  //   {
  //     x: Collider.centerOfMassX[entity]!,
  //     y: Collider.centerOfMassY[entity]!,
  //   },
  //   Collider.principalAngularInertia[entity]!,
  // );
  colliderDesc.setRestitution(Collider.restitution[entity]!);
  // colliderDesc.setSolverGroups(Collider.solverGroups[entity]!); !!!
  colliderDesc.setFrictionCombineRule(Collider.frictionCombineRule[entity]!);
  // colliderDesc.rotationsEnabled = Boolean(Collider.rotationsEnabled[entity]!);
}

export const COLLIDERS_HANDLE_TO_ENTITY_ID = new Map<number, Entity>();

export function mapColliderHandleToEntity(handle: number, entity: Entity) {
  COLLIDERS_HANDLE_TO_ENTITY_ID.set(handle, entity);
}

export function unmapColliderHandleToEntity(handle: number) {
  COLLIDERS_HANDLE_TO_ENTITY_ID.delete(handle);
}

export function getColliderEntity(handle: number): Entity {
  return COLLIDERS_HANDLE_TO_ENTITY_ID.get(handle)!;
}

export function getRuntimeCollider(entity: Entity) {
  return RuntimeCollider[entity]!;
}
