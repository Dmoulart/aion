import { onEnterQuery, not, type Entity } from "aion-ecs";
import {
  Body,
  Collider,
  RuntimeBody,
  RuntimeCollider,
  usePhysics,
} from "./index.js";
import { positionOf, setPosition } from "../basics/index.js";
import { Circle, Position, Rect } from "../components.js";
import { useECS } from "../ecs.js";
import { Vec, type Vector } from "aion-core";
import type RAPIER from "@dimforge/rapier2d";
import { once, on } from "aion-engine";

export function initPhysicsSystems() {
  //@todo use init callback
  once("update", () => {
    const { world } = usePhysics();
    const { query, attach } = useECS();

    const onCreatedBody = onEnterQuery(query(Position, Body, not(RuntimeBody)));

    onCreatedBody((ent) => {
      console.log("on create body");
      const bodyDesc = Body[ent]!;
      const parent = world.createRigidBody(bodyDesc!);

      parent.setTranslation(toSimulation(positionOf(ent)), false);

      RuntimeBody[ent] = parent;

      attach(RuntimeBody, ent);
    });

    const onCreatedCollider = onEnterQuery(
      query(Position, Collider, RuntimeBody, not(RuntimeCollider)),
    );

    onCreatedCollider((ent) => {
      console.log("on create collider");
      const parent = RuntimeBody[ent];

      const auto = Collider.auto[ent];
      if (!auto) {
        throw new Error("not implemented");
      }

      const collidersDesc = createColliderDescFromShape(ent);

      const colliderDesc = collidersDesc[0]!;

      const collider = world.createCollider(colliderDesc, parent);

      RuntimeCollider[ent] = collider;

      attach(RuntimeCollider, ent);
    });

    // const onCreatedColliderAndBody = onEnterQuery(
    //   query(Position, Collider, Body)
    // );

    // onCreatedColliderAndBody((ent) => {
    //   const bodyDesc = Body[ent]!;
    //   const parent = world.createRigidBody(bodyDesc!);

    //   parent.setTranslation(toSimulation(positionOf(ent)), false);

    //   RuntimeBody[ent] = parent;
    //   attach(RuntimeBody, ent);

    //   const collider = world.createCollider(Collider[ent]!, parent);

    //   collider.setTranslation(toSimulation(positionOf(ent)));

    //   RuntimeCollider[ent] = collider;
    //   attach(RuntimeCollider, ent);
    // });
  });

  on("update", () => {
    const { query } = useECS();

    query(RuntimeBody, Position).each((ent) => {
      const body = RuntimeBody[ent]!;

      setPosition(ent, fromSimulation(body.translation()));
    });
  });
}

function createColliderDescFromShape(ent: Entity): RAPIER.ColliderDesc[] {
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
