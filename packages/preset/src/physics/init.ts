import RAPIER from "@dimforge/rapier2d-compat";
import { useAion } from "../ctx.js";
import {
  fromSimulationPoint,
  initPhysicsSystems,
  toSimulationPoint,
} from "./bindings.js";
import { beforeStart, on } from "aion-engine";
import { useECS } from "../ecs.js";
import { Collision, RuntimeBody, RuntimeCollider } from "./components.js";
import { initCharacterControllerSystem } from "./character-controller.js";
import {
  Transform,
  Body,
  getRuntimeCollider,
  getWorldPosition,
  getWorldRotation,
  setWorldPosition,
  setWorldRotation,
  Parent,
  findNearestAncestorWithComponent,
  getRuntimeBody,
  getLocalPosition,
  getLocalRotation,
} from "../index.js";
import { none, not, type Entity } from "aion-ecs";

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

    // sync body with transform /!\
    // query(RuntimeCollider, not(RuntimeBody), Transform).each((ent) => {
    //   const collider = getRuntimeCollider(ent);

    //   // rounding is bad for perfs. compare local positions ?
    //   const worldPosition = getWorldPosition(ent).round();
    //   const worldRotation = getWorldRotation(ent);

    //   const colliderTranslation = fromSimulationPoint(
    //     collider.translation(),
    //   ).round();
    //   const colliderRotation = collider.rotation();

    //   if (!worldPosition.equals(colliderTranslation)) {
    //     collider.setTranslation(worldPosition);
    //   }

    //   if (worldRotation !== colliderRotation) {
    //     collider.setRotation(worldRotation);
    //   }
    // });
    // child colliders controlled by bodies up in the hierarchy
    //@todo we only support child controlled by body up one level in the hierarchy
    query(RuntimeCollider, none(Body, RuntimeBody), Transform, Parent).each(
      (ent) => {
        const collider = getRuntimeCollider(ent);
        const body = collider.parent();

        if (body) {
          const worldPosition = getWorldPosition(ent).round();
          const worldRotation = getWorldRotation(ent);

          if (!worldPosition.equals(collider.translation())) {
            collider.setTranslationWrtParent(
              toSimulationPoint(getLocalPosition(ent)),
            );
          }

          if (worldRotation !== collider.rotation()) {
            collider.setRotationWrtParent(getLocalRotation(ent));
          }
        }
      },
    );

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

      const entityA = bodyA?.userData as Entity;
      const entityB = bodyB?.userData as Entity;

      if (entityA) {
        if (started) {
          attach(Collision, entityA);
        } else {
          detach(Collision, entityA);
        }
      }

      if (entityB) {
        if (started) {
          attach(Collision, entityB);
        } else {
          detach(Collision, entityB);
        }
      }

      if (entityA && entityB) {
        Collision.with[entityA] = entityB;
        Collision.with[entityB] = entityA;
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
