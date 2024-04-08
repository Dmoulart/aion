import RAPIER from "@dimforge/rapier2d-compat";
import { useAion } from "../ctx.js";
import { fromSimulationPoint, initPhysicsSystems } from "./bindings.js";
import { beforeStart, on } from "aion-engine";
import { useECS } from "../ecs.js";
import { Collision, RuntimeBody, RuntimeCollider } from "./components.js";
import { initCharacterControllerSystem } from "./character-controller.js";
import {
  Transform,
  getRuntimeCollider,
  getWorldPosition,
  getWorldRotation,
  setPosition,
  setRotation,
  setWorldPosition,
  setWorldRotation,
} from "../index.js";
import { not } from "aion-ecs";

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
    const { attach, detach, query } = useECS();

    // sync body with transform

    query(RuntimeCollider, not(RuntimeBody), Transform).each((ent) => {
      const collider = getRuntimeCollider(ent);

      // rounding is bad for perfs. compare local positions ?
      const worldPosition = getWorldPosition(ent).round();
      const worldRotation = getWorldRotation(ent);

      const colliderTranslation = fromSimulationPoint(
        collider.translation(),
      ).round();
      const colliderRotation = collider.rotation();

      if (!worldPosition.equals(colliderTranslation)) {
        debugger;
        collider.setTranslation(worldPosition);
      }

      if (worldRotation !== colliderRotation) {
        collider.setRotation(worldRotation);
      }
    });

    // Step the simulation forward.
    world.step(eventQueue);

    // sync transform with body
    query(RuntimeBody, Transform).each((ent) => {
      const body = RuntimeBody[ent]!;

      setWorldPosition(ent, fromSimulationPoint(body.translation()));
      setWorldRotation(ent, body.rotation());
    });

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

export function getGravity() {
  return usePhysics().world.gravity;
}
