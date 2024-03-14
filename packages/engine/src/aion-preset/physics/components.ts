import RAPIER from "@dimforge/rapier2d-compat";
import { defineComponent, onEnterQuery, u32, all, none } from "aion-ecs";
import { usePhysics } from "./init.js";
import { on, once } from "../../lifecycle.js";
import { useECS } from "../ecs.js";
import { Position } from "../components.js";
import { positionOf, setPosition } from "../index.js";
import { Vec, type Vector } from "aion-core";

export function initPhysicsComponent() {
  // const Collider = defineComponent({
  //   events: u8,
  //   activeCollisions: i32,
  //   activeHooks: u8,
  //   contactForceEventThreshold: number,
  //   density: number,
  //   friction: number,
  //   sensor: bool,
  //   mass: number,
  //   centerOfMassX: number,
  //   centerOfMassY: number,
  //   principalAngularInertia: number,
  //   restitution: number,
  //   solverGroups: number,
  //   frictionCombineRule: u8,
  // });

  const Collider = defineComponent(() => new Array<RAPIER.ColliderDesc>());
  const RuntimeCollider = defineComponent(() => new Array<RAPIER.Collider>());

  const Body = defineComponent(() => new Array<RAPIER.RigidBodyDesc>());
  const RuntimeBody = defineComponent(() => new Array<RAPIER.RigidBody>());

  //@todo use init callback
  once("update", () => {
    const { world } = usePhysics();
    const { query, attach, has } = useECS();

    const onCreatedBody = onEnterQuery(
      query(Position, all(Collider, Body), none(RuntimeBody, RuntimeCollider))
    );

    onCreatedBody((ent) => {
      const bodyDesc = Body[ent]!;
      const parent: RAPIER.RigidBody = world.createRigidBody(bodyDesc!);

      parent.setTranslation(toSimulation(positionOf(ent)), false);

      RuntimeBody[ent] = parent;
      attach(RuntimeBody, ent);

      const collider = world.createCollider(Collider[ent]!, parent);
      collider.setTranslation(toSimulation(positionOf(ent)));

      RuntimeCollider[ent] = collider;
      attach(RuntimeCollider, ent);
    });
  });

  on("update", () => {
    const { query } = useECS();

    query(RuntimeBody, Position).each((ent) => {
      const body = RuntimeBody[ent]!;

      setPosition(ent, fromSimulation(body.translation()));
    });
  });

  return { Collider, Body };
}

function fromSimulation(vec: Vector, factor = 50) {
  return new Vec(vec.x * factor, vec.y * factor);
}

function toSimulation(vec: Vector, factor = 50) {
  return new Vec(vec.x / factor, vec.y / factor);
}
// RAPIER.Coll
// Collider[1] = RAPIER.ColliderDesc.ball(1).
// const Collider = defineComponent({
//   events: u8,
//   activeCollisions: i32,
//   activeHooks: u8,
//   contactForceEventThreshold: number,
//   density: number,
//   friction: number,
//   sensor: bool,
//   mass: number,
//   centerOfMassX: number,
//   centerOfMassY: number,
//   principalAngularInertia: number,
//   restitution: number,
//   solverGroups: number,
//   frictionCombineRule: u8,
// });

/**
 * Configure the collider given the rapier body options of the entity.
 * @param colliderDesc
 * @param options
 * @returns colliderDesc
 */
// export function setColliderOptions(
//   colliderDesc: RAPIER.ColliderDesc,
//   ent: Entity,
// ) {
//   const { Collider } = usePhysics();

//   const events = Collider.events[ent]!;
//   colliderDesc.setActiveEvents(events);

//   const activeCollisions = Collider.activeCollisions[ent]!;
//   colliderDesc.setActiveCollisionTypes(activeCollisions);

//   const activeHooks = Collider.activeHooks[ent]!;
//   colliderDesc.setActiveHooks(activeHooks);

//   const contactForceEventThreshold = Collider.contactForceEventThreshold[ent]!;
//   colliderDesc.setContactForceEventThreshold(contactForceEventThreshold);

//   const density = Collider.density[ent]!;
//   colliderDesc.setDensity(density);

//   const friction = Collider.friction[ent]!;
//   colliderDesc.setFriction(friction);

//   const sensor = Collider.sensor[ent];
//   colliderDesc.setSensor(Boolean(sensor));

//   const mass = Collider.mass[ent]!;
//   colliderDesc.setMass(mass);

//   const centerOfMassX = Collider.centerOfMassX[ent]!;
//   const centerOfMassY = Collider.centerOfMassY[ent]!;
//   const principalAngularInertia = Collider.principalAngularInertia[ent]!;
//   colliderDesc.setMassProperties(
//     mass,
//     { x: centerOfMassX, y: centerOfMassY },
//     principalAngularInertia,
//   );

//   const restitution = Collider.restitution[ent]!;
//   colliderDesc.setRestitution(restitution);

//   const solverGroups = Collider.solverGroups[ent]!;
//   colliderDesc.setSolverGroups(solverGroups);

//   const frictionCombineRule = Collider.frictionCombineRule[ent]!;
//   colliderDesc.setFrictionCombineRule(frictionCombineRule);
// }
