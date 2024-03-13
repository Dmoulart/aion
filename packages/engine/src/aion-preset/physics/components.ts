import RAPIER from "@dimforge/rapier2d-compat";
import {
  Enum,
  bool,
  defineComponent,
  i32,
  number,
  u8,
  type Entity,
  onEnterQuery,
  u32,
  any,
  query,
  not,
  all,
  none,
} from "aion-ecs";
import { useAion } from "../ctx.js";
import { usePhysics } from "./init.js";
import { on, once } from "../../lifecycle.js";
import { useECS } from "../ecs.js";
import { Position } from "../components.js";
import { positionOf, setPosition } from "../index.js";
import { Vec, vec, type Vector } from "aion-core";

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
  const ColliderHandle = defineComponent(u32);

  const Body = defineComponent(() => new Array<RAPIER.RigidBodyDesc>());
  const BodyHandle = defineComponent(u32);

  //@todo use init callback
  once("update", () => {
    const { world } = usePhysics();
    const { query, attach, has } = useECS();

    const onCreatedBody = onEnterQuery(
      query(Position, all(Collider, Body), none(BodyHandle, ColliderHandle))
    );

    onCreatedBody((ent) => {
      const parent: RAPIER.RigidBody = world.createRigidBody(Body[ent]!);

      parent.setTranslation(toSimulation(positionOf(ent)), true);

      attach(BodyHandle, ent);
      BodyHandle[ent] = parent.handle;

      const collider = world.createCollider(Collider[ent]!, parent);
      collider.setTranslation(toSimulation(positionOf(ent)));

      attach(ColliderHandle, ent);
      ColliderHandle[ent] = collider.handle;
    });
  });

  on("update", () => {
    const { world } = usePhysics();
    const { query } = useECS();

    query(BodyHandle, Position).each((ent) => {
      const handle = BodyHandle[ent]!;

      const body = world.getRigidBody(handle);
      console.log(ent, fromSimulation(body.translation()));

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
