import RAPIER from "@dimforge/rapier2d-compat";
import { useAion } from "../ctx.js";
import {
  fromSimulationPoint,
  initPhysicsSystems,
  toSimulationPoint,
} from "./bindings.js";
import { beforeStart, on } from "aion-engine";
import { useECS } from "../ecs.js";
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
  getLocalPosition,
  getLocalRotation,
  getRuntimeBodyEntity,
  getLocalScale,
  getScaleCompensatedRotation,
  RuntimeBody,
  RuntimeCollider,
  getRuntimeBody,
  getWorldScale,
} from "../index.js";
import { none, not } from "aion-ecs";
import { handleCollisionEvent } from "./collisions.js";

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
    const { attach, detach, query, has, world: w } = useECS();

    // sync collider without body with transform /!\
    query(RuntimeCollider, not(RuntimeBody), Transform).each((ent) => {
      const body = getRuntimeCollider(ent);

      const worldPosition = getWorldPosition(ent);
      const worldRotation = getWorldRotation(ent);

      const colliderTranslation = fromSimulationPoint(body.translation());
      const colliderRotation = body.rotation();

      if (!worldPosition.equals(colliderTranslation)) {
        body.setTranslation(toSimulationPoint(worldPosition));
      }
      // getScaleCompensatedRotation(
      //   colliderRotation,
      //   getWorldScale(ent).x,
      //   getWorldScale(ent).y,
      // );
      if (worldRotation !== colliderRotation) {
        body.setRotation(worldRotation);
      }
    });

    // sync bofy without collider with transform /!\
    query(RuntimeBody, not(RuntimeCollider), Transform).each((ent) => {
      const body = getRuntimeBody(ent);

      const worldPosition = getWorldPosition(ent);
      const worldRotation = getWorldRotation(ent);

      const colliderTranslation = fromSimulationPoint(body.translation());
      const colliderRotation = body.rotation();

      if (!worldPosition.equals(colliderTranslation)) {
        body.setTranslation(toSimulationPoint(worldPosition), false);
      }

      if (worldRotation !== colliderRotation) {
        body.setRotation(worldRotation, false);
      }
    });

    // sync body and collider with transform /!\
    query(RuntimeBody, RuntimeCollider, Transform).each((ent) => {
      const body = getRuntimeBody(ent);

      const worldPosition = getWorldPosition(ent);
      const worldRotation = getWorldRotation(ent);

      const colliderTranslation = fromSimulationPoint(body.translation());
      const colliderRotation = body.rotation();

      if (!worldPosition.equals(colliderTranslation)) {
        body.setTranslation(toSimulationPoint(worldPosition), false);
      }

      if (worldRotation !== colliderRotation) {
        body.setRotation(worldRotation, false);
      }
    });

    // child colliders controlled by bodies up in the hierarchy
    //@todo we only support child controlled by body up one level in the hierarchy
    query(RuntimeCollider, none(Body, RuntimeBody), Transform, Parent).each(
      (ent) => {
        const collider = getRuntimeCollider(ent);
        const body = collider.parent();
        if (body) {
          const parent = getRuntimeBodyEntity(body);

          const worldPosition = getWorldPosition(ent).round();
          const worldRotation = getWorldRotation(ent);

          if (!worldPosition.equals(collider.translation())) {
            const parentScale = getLocalScale(parent);

            const position = toSimulationPoint(getLocalPosition(ent));

            //@todo not sure if this is correct code. Works with flipped transforms (-1 values)
            // but other values have not been tested
            position.x *= parentScale.x;
            position.y *= parentScale.y;

            collider.setTranslationWrtParent(position);
          }

          if (worldRotation !== collider.rotation()) {
            const parentScale = getLocalScale(parent);

            const rotation = getScaleCompensatedRotation(
              getLocalRotation(ent),
              parentScale.x,
              parentScale.y
            );

            collider.setRotationWrtParent(rotation);
          }
        }
      }
    );

    // Step the simulation forward.
    world.step(eventQueue);

    // sync transform with body
    query(RuntimeBody, Transform).each((ent) => {
      const body = getRuntimeBody(ent);

      setWorldPosition(ent, fromSimulationPoint(body.translation()));
      setWorldRotation(ent, body.rotation());
    });

    eventQueue.drainCollisionEvents(handleCollisionEvent);
  });

  return { RAPIER, world };
}

export function usePhysics() {
  return useAion().$physics;
}

export function getGravity() {
  return usePhysics().world.gravity;
}
