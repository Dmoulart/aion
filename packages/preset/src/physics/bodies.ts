import {
  defineComponent,
  type Entity,
  type PrefabInstanceOptions,
} from "aion-ecs";
import { Body } from "./components.js";
import RAPIER from "@dimforge/rapier2d-compat";
import type { Vector } from "aion-core";
import { setPosition, toSimulationPoint, usePhysics } from "../index.js";

export const RuntimeBody = defineComponent(Array<number>);

// @todo type crap
const DEFAULT_BODIES_OPTIONS: PrefabInstanceOptions<{
  Body: typeof Body;
}>["Body"] = {
  enabled: Number(true),
  type: RAPIER.RigidBodyType.Dynamic, // dynamic
  translationX: 0,
  translationY: 0,
  rotation: 0,
  gravityScale: 1.0,
  linvelX: 0,
  linvelY: 0,
  mass: 0.0,
  massOnly: Number(false),
  centerOfMassX: 0,
  centerOfMassY: 0,
  translationsEnabledX: Number(true),
  translationsEnabledY: Number(true),
  angvel: 0.0,
  principalAngularInertia: 0.0,
  rotationsEnabled: Number(true),
  linearDamping: 0.0,
  angularDamping: 0.0,
  canSleep: Number(true),
  sleeping: Number(false),
  ccdEnabled: Number(false),
  dominanceGroup: 0,
  additionalSolverIterations: 0,
};

export function createBody(
  options: PrefabInstanceOptions<{ Body: typeof Body }>["Body"],
) {
  return {
    ...DEFAULT_BODIES_OPTIONS,
    ...options,
  };
}

export function setBodyOptions(bodyDesc: RAPIER.RigidBodyDesc, entity: Entity) {
  bodyDesc.setEnabled(Boolean(Body.enabled[entity])!);
  bodyDesc.status = Body.type[entity]!;

  bodyDesc.setLinvel(Body.linvelX[entity]!, Body.linvelY[entity]!);
  bodyDesc.setAngvel(Body.angvel[entity]!);
  bodyDesc.setAdditionalSolverIterations(
    Body.additionalSolverIterations[entity]!,
  );
  bodyDesc.setCanSleep(Boolean(Body.canSleep[entity]!));
  bodyDesc.setRotation(Body.rotation[entity]!);
  bodyDesc.setSleeping(Boolean(Body.sleeping[entity]!));
  bodyDesc.setCcdEnabled(Boolean(Body.ccdEnabled[entity]!));
  bodyDesc.setTranslation(
    Body.translationX[entity]!,
    Body.translationY[entity]!,
  );
  bodyDesc.enabledTranslations(
    Boolean(Body.translationsEnabledX[entity]!),
    Boolean(Body.translationsEnabledY[entity]!),
  );

  if (Body.rotationsEnabled[entity]! === 0) {
    bodyDesc.lockRotations();
  }

  bodyDesc.setGravityScale(Body.gravityScale[entity]!);
  bodyDesc.setLinearDamping(Body.linearDamping[entity]!);
  // bodyDesc.setAdditionalMass(Body.linearDamping[entity]!); ??
  bodyDesc.setDominanceGroup(Body.dominanceGroup[entity]!);
}

export function getRuntimeBody(entity: Entity) {
  const { world } = usePhysics();
  return world.getRigidBody(RuntimeBody[entity]!);
}

export function setRuntimeBody(entity: Entity, body: RAPIER.RigidBody) {
  RuntimeBody[entity] = body.handle;
}

export function getRuntimeBodyEntity(body: RAPIER.RigidBody) {
  return body.userData as Entity;
}

export function setRuntimeBodyVelocity(entity: Entity, velocity: Vector) {
  getRuntimeBody(entity).setLinvel(velocity, true);
}
