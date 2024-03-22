import { onEnterQuery, not, type Entity } from "aion-ecs";
import {
  Body,
  Collider,
  RuntimeBody,
  RuntimeCollider,
  setColliderOptions,
  usePhysics,
} from "./index.js";
import { Circle, Rect, Transform } from "../components.js";
import { useECS } from "../ecs.js";
import { Vec, type Vector } from "aion-core";
import type RAPIER from "@dimforge/rapier2d";
import { once, on } from "aion-engine";
import { positionOf, setPosition, setRotation } from "../basics/transform.js";
// import { RigidBodyDesc } from "@dimforge/rapier2d";
import { setBodyOptions } from "./bodies.js";

export function initPhysicsSystems() {
  //@todo use init callback
  once("update", () => {
    const { world, RAPIER } = usePhysics();
    const { query, attach } = useECS();

    const onCreatedBody = onEnterQuery(
      query(Transform, Body, not(RuntimeBody)),
    );

    onCreatedBody((ent) => {
      const bodyDesc = new RAPIER.RigidBodyDesc(Body.type[ent]!);
      setBodyOptions(bodyDesc, ent);
      console.log({ bodyDesc });

      const body = world.createRigidBody(bodyDesc!);

      body.setTranslation(toSimulation(positionOf(ent)), false);

      body.userData = ent;

      RuntimeBody[ent] = body;

      attach(RuntimeBody, ent);
    });

    const onCreatedCollider = onEnterQuery(
      query(Transform, Collider, RuntimeBody, not(RuntimeCollider)),
    );

    onCreatedCollider((ent) => {
      let body = RuntimeBody[ent];

      const auto = Collider.auto[ent];

      if (!auto) {
        throw new Error("not implemented");
      }

      const collidersDesc = createColliderDesc(ent);

      const colliderDesc = collidersDesc[0]!;

      setColliderOptions(colliderDesc, ent);

      const collider = world.createCollider(colliderDesc, body);

      RuntimeCollider[ent] = collider;

      attach(RuntimeCollider, ent);
    });
  });

  on("update", () => {
    const { query } = useECS();

    query(RuntimeBody, Transform).each((ent) => {
      const body = RuntimeBody[ent]!;

      setPosition(ent, fromSimulation(body.translation()));

      setRotation(ent, body.rotation());
    });
  });
}

function createColliderDesc(ent: Entity): RAPIER.ColliderDesc[] {
  const { has } = useECS();
  const { RAPIER } = usePhysics();

  const colliders: RAPIER.ColliderDesc[] = [];

  if (has(Circle, ent)) {
    const radius = Circle.r[ent]!;
    const collider = RAPIER.ColliderDesc.ball((radius / SCALE_FACTOR) | 0);
    colliders.push(collider);
  }

  if (has(Rect, ent)) {
    const w = Rect.w[ent]!;
    const h = Rect.h[ent]!;
    const collider = RAPIER.ColliderDesc.cuboid(
      w / 2 / SCALE_FACTOR,
      h / 2 / SCALE_FACTOR,
    );
    colliders.push(collider);
  }

  return colliders;
}

export const SCALE_FACTOR = 50;

function fromSimulation(vec: Vector, factor = SCALE_FACTOR) {
  return new Vec(vec.x * factor, vec.y * factor);
}

function toSimulation(vec: Vector, factor = SCALE_FACTOR) {
  return new Vec(vec.x / factor, vec.y / factor);
}
