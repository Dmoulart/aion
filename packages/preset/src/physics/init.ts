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
  getRuntimeBodyEntity,
  getLocalScale,
  getMatrixRotation,
  getLocalMatrix,
  getWorldMatrix,
  getScaleCompensatedRotation,
} from "../index.js";
import { none, not, type Entity, createQuery, all, runQuery } from "aion-ecs";
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
        try {
          const collider = getRuntimeCollider(ent);
          const body = collider.parent();
          // console.log(body);
          // console.log(collider);
          if (body) {
            console.log("rb ent", getRuntimeBodyEntity(body));
            const parent = getRuntimeBodyEntity(body);

            const worldPosition = getWorldPosition(ent).round();
            const worldRotation = getWorldRotation(ent);

            console.log(collider.handle);

            if (!worldPosition.equals(collider.translation())) {
              const parentScale = getLocalScale(parent);

              const position = toSimulationPoint(getLocalPosition(ent));
              //@todo not sure if this is correct code. Works with flipped transforms (-1 values)
              // but other values have not been tested
              position.scaleEq(parentScale.x, parentScale.y);

              collider.setTranslationWrtParent(position);
            }

            if (worldRotation !== collider.rotation()) {
              const parentScale = getLocalScale(parent);

              const rotation = getScaleCompensatedRotation(
                getLocalRotation(ent),
                parentScale.x,
                parentScale.y,
              );

              collider.setRotationWrtParent(rotation);
            }
          }
        } catch (error) {
          debugger;
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
