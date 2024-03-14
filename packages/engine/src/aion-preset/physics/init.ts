import { defineComponent } from "aion-ecs";
import RAPIER from "@dimforge/rapier2d-compat";
import { on } from "../../lifecycle.js";
import { useAion } from "../ctx.js";
import { initPhysicsSystems } from "./bindings.js";

await RAPIER.init();

export type PhysicsOptions = { gravity: { x: number; y: number } };

/**
 * An enum describing the different body types.
 * Uses string to facilitate debugging.
 */
export enum RapierBodyType {
  Fixed = "Fixed",
  Dynamic = "Dynamic",
  Kinematic = "Kinematic", // Same as Kinematic position based
  KinematicPositionBased = "KinematicPositionBased",
  KinematicVelocityBased = "KinematicVelocityBased",
}

export function initPhysics(
  options: PhysicsOptions = { gravity: { x: 0.0, y: 9.81 } }
) {
  initPhysicsSystems();

  const gravity = options.gravity;
  // Use the RAPIER module here.
  const world = new RAPIER.World(gravity);

  on("update", () => {
    // Step the simulation forward.
    world.step();
  });

  return { RAPIER, world };
}

export function usePhysics() {
  return useAion().$physics;
}
