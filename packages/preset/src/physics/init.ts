import RAPIER from "@dimforge/rapier2d-compat";
import { useAion } from "../ctx.js";
import { initPhysicsSystems } from "./bindings.js";
import { on } from "aion-engine";

await RAPIER.init();

export type PhysicsOptions = { gravity: { x: number; y: number } };

export function initPhysics(
  options: PhysicsOptions = { gravity: { x: 0.0, y: 9.81 } },
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
