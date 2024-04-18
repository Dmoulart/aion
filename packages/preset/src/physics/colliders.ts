import {
  type Entity,
  type PrefabInstanceOptions,
  defineComponent,
} from "aion-ecs";
import { Collider } from "./components.js";
import RAPIER from "@dimforge/rapier2d-compat";
import { Circle, Rect } from "../components.js";
import { useECS } from "../ecs.js";
import { SCALE_FACTOR } from "./bindings.js";
import { usePhysics } from "./init.js";

export const RuntimeCollider = defineComponent(Array<number>);

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

export function createRuntimeCollider(
  ent: number,
  world: RAPIER.World,
  body?: RAPIER.RigidBody,
) {
  const auto = Collider.auto[ent];

  if (!auto) {
    throw new Error("not implemented");
  }

  const collidersDesc = createColliderDesc(ent);

  const colliderDesc = collidersDesc[0]!;

  setColliderOptions(colliderDesc, ent);

  const collider = world.createCollider(colliderDesc, body);

  mapColliderHandleToEntity(collider.handle, ent);

  return collider;
}

export function createColliderDesc(ent: Entity): RAPIER.ColliderDesc[] {
  const { has } = useECS();
  const { RAPIER } = usePhysics();

  const colliders: RAPIER.ColliderDesc[] = [];

  if (has(Circle, ent)) {
    const radius = Circle.r[ent]!;
    const collider = RAPIER.ColliderDesc.ball((radius / SCALE_FACTOR) | 0);
    colliders.push(collider);
  }

  if (has(Rect, ent)) {
    const w = Rect.w[ent]!;
    const h = Rect.h[ent]!;
    const collider = RAPIER.ColliderDesc.cuboid(
      w / 2 / SCALE_FACTOR,
      h / 2 / SCALE_FACTOR,
    );
    colliders.push(collider);
  }

  return colliders;
}

export function getRuntimeCollider(entity: Entity) {
  const { world } = usePhysics();
  return world.getCollider(RuntimeCollider[entity]!);
}

export function setRuntimeCollider(entity: Entity, collider: RAPIER.Collider) {
  RuntimeCollider[entity] = collider.handle;
}

// is there a more efficient data structure ? An array ?
export const COLLIDER_HANDLE_TO_ENTITY_ID = new Map<number, Entity>();

export function mapColliderHandleToEntity(handle: number, entity: Entity) {
  COLLIDER_HANDLE_TO_ENTITY_ID.set(handle, entity);
}

export function unmapColliderHandleToEntity(handle: number) {
  COLLIDER_HANDLE_TO_ENTITY_ID.delete(handle);
}

export function getColliderEntity(handle: number): Entity {
  return COLLIDER_HANDLE_TO_ENTITY_ID.get(handle)!;
}
