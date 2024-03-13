import { defineComponent } from "aion-ecs";
import RAPIER from "@dimforge/rapier2d-compat";
import { on } from "../../lifecycle.js";
import { useAion } from "../ctx.js";
import { initColliderComponent } from "./collider.js";

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
  options: PhysicsOptions = { gravity: { x: 0.0, y: -9.81 } },
) {
  const Body = defineComponent(
    () => new Array<{ type: RAPIER.RigidBodyType }>(),
  );

  const { Collider } = initColliderComponent();

  const gravity = options.gravity;
  // Use the RAPIER module here.
  const world = new RAPIER.World(gravity);
  // Create the ground
  const groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1);
  world.createCollider(groundColliderDesc);

  // Create a dynamic rigid-body.
  const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0.0, 1.0);
  const rigidBody = world.createRigidBody(rigidBodyDesc);

  // Create a cuboid collider attached to the dynamic rigidBody.
  const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5);
  const collider = world.createCollider(colliderDesc, rigidBody);

  // //@todo use init callback
  // once("update", () => {
  //   const { query } = useECS();
  //   const onBodyCreated = onEnterQuery(query(Body, Collider));

  //   onBodyCreated((ent) => {
  //     // const bodyType = Body[ent]!;
  //     // const body = world.createRigidBody(bodyDesc);
  //     // const colliderDesc = Collider[ent]!;
  //     // world.createCollider(colliderDesc, bodyType);
  //   });
  // });

  on("update", () => {
    // Ste the simulation forward.
    world.step();

    // Get and print the rigid-body's position.
    const position = rigidBody.translation();
    console.log("Rigid-body position: ", position.x, position.y);
  });

  return { RAPIER, world, rigidBody, Body, Collider };
}

export function usePhysics() {
  return useAion().$physics;
}
