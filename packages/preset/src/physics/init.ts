import RAPIER from "@dimforge/rapier2d-compat";
import { useAion } from "../ctx.js";
import {
  initPhysicsSystems,
  type InitPhysicsSystemOptions,
} from "./bindings.js";
import { on } from "aion-engine";

await RAPIER.init();

export type InitPhysicsOptions = {
  gravity?: { x: number; y: number };
} & InitPhysicsSystemOptions;

const DEFAULT_GRAVITY = { x: 0.0, y: 9.81 };

export function initPhysics(options?: InitPhysicsOptions) {
  initPhysicsSystems(options);

  const gravity = options?.gravity ?? DEFAULT_GRAVITY;
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
