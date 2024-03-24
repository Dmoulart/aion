import RAPIER from "@dimforge/rapier2d-compat";
import { useAion } from "../ctx.js";
import { initPhysicsSystems } from "./bindings.js";
import { beforeStart, on, once } from "aion-engine";
import { useECS } from "../ecs.js";
import { Collision } from "./components.js";
import { onEnterQuery, query, onExitQuery, type QueryHandler } from "aion-ecs";
import { initCharacterControllerSystem } from "./character-controller.js";

await RAPIER.init();

export type InitPhysicsOptions = {
  gravity?: { x: number; y: number };
  renderDebug?: boolean;
};

const DEFAULT_GRAVITY = { x: 0.0, y: 9.81 };

export function initPhysics(options?: InitPhysicsOptions) {
  beforeStart(initCharacterControllerSystem);
  beforeStart(initPhysicsSystems);

  const gravity = options?.gravity ?? DEFAULT_GRAVITY;
  // Use the RAPIER module here.
  const world = new RAPIER.World(gravity);

  const eventQueue = new RAPIER.EventQueue(true);

  on("update", () => {
    const { attach, detach } = useECS();

    // Step the simulation forward.
    world.step(eventQueue);

    eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      const colliderA = world.getCollider(handle1);
      const colliderB = world.getCollider(handle2);

      const bodyA = colliderA.parent();
      const bodyB = colliderB.parent();

      if (bodyA) {
        const entityA = bodyA.userData;

        if (entityA) {
          started
            ? attach(Collision, entityA as number)
            : detach(Collision, entityA as number);
        }
      }

      if (bodyB) {
        const entityB = bodyB.userData;

        if (entityB) {
          started
            ? attach(Collision, entityB as number)
            : detach(Collision, entityB as number);
        }
      }
    });
  });

  return { RAPIER, world };
}

export function usePhysics() {
  return useAion().$physics;
}
