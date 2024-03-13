import RAPIER from "@dimforge/rapier2d-compat";
import {
  Enum,
  bool,
  defineComponent,
  i32,
  number,
  u8,
  type Entity,
} from "aion-ecs";
import { useAion } from "../ctx.js";
import { usePhysics } from "./init.js";

export function initColliderComponent() {
  // const Collider = defineComponent(() => new Array<RapierColliderOptions>());

  const Collider = defineComponent({
    events: u8,
    activeCollisions: i32,
    activeHooks: u8,
    contactForceEventThreshold: number,
    density: number,
    friction: number,
    sensor: bool,
    mass: number,
    centerOfMassX: number,
    centerOfMassY: number,
    principalAngularInertia: number,
    restitution: number,
    solverGroups: number,
    frictionCombineRule: u8,
  });

  return { Collider };
}

/**
 * Configure the collider given the rapier body options of the entity.
 * @param colliderDesc
 * @param options
 * @returns colliderDesc
 */
export function setColliderOptions(
  colliderDesc: RAPIER.ColliderDesc,
  ent: Entity,
) {
  const { Collider } = usePhysics();

  const events = Collider.events[ent]!;
  colliderDesc.setActiveEvents(events);

  const activeCollisions = Collider.activeCollisions[ent]!;
  colliderDesc.setActiveCollisionTypes(activeCollisions);

  const activeHooks = Collider.activeHooks[ent]!;
  colliderDesc.setActiveHooks(activeHooks);

  const contactForceEventThreshold = Collider.contactForceEventThreshold[ent]!;
  colliderDesc.setContactForceEventThreshold(contactForceEventThreshold);

  const density = Collider.density[ent]!;
  colliderDesc.setDensity(density);

  const friction = Collider.friction[ent]!;
  colliderDesc.setFriction(friction);

  const sensor = Collider.sensor[ent];
  colliderDesc.setSensor(Boolean(sensor));

  const mass = Collider.mass[ent]!;
  colliderDesc.setMass(mass);

  const centerOfMassX = Collider.centerOfMassX[ent]!;
  const centerOfMassY = Collider.centerOfMassY[ent]!;
  const principalAngularInertia = Collider.principalAngularInertia[ent]!;
  colliderDesc.setMassProperties(
    mass,
    { x: centerOfMassX, y: centerOfMassY },
    principalAngularInertia,
  );

  const restitution = Collider.restitution[ent]!;
  colliderDesc.setRestitution(restitution);

  const solverGroups = Collider.solverGroups[ent]!;
  colliderDesc.setSolverGroups(solverGroups);

  const frictionCombineRule = Collider.frictionCombineRule[ent]!;
  colliderDesc.setFrictionCombineRule(frictionCombineRule);
}
