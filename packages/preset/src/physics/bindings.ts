import { onEnterQuery, not, type Entity } from "aion-ecs";
import {
  Body,
  Collider,
  RuntimeBody,
  RuntimeCollider,
  mapColliderHandleToEntity,
  setColliderOptions,
  usePhysics,
} from "./index.js";
import type RAPIER from "@dimforge/rapier2d-compat";
import { Circle, Rect } from "../components.js";
import { useECS } from "../ecs.js";
import { Vec, type Vector } from "aion-core";
import {
  Transform,
  getLocalPosition,
  getLocalRotation,
  getWorldPosition,
  getWorldRotation,
} from "../basics/transform.js";
import { getRuntimeBody, setBodyOptions } from "./bodies.js";
import { Children, traverseDescendants } from "../index.js";

export function initPhysicsSystems() {
  const { world, RAPIER } = usePhysics();
  const { query, attach, has } = useECS();

  const onCreatedBody = onEnterQuery(query(Transform, Body, not(RuntimeBody)));

  onCreatedBody((ent) => {
    const bodyDesc = new RAPIER.RigidBodyDesc(Body.type[ent]!);

    setBodyOptions(bodyDesc, ent);

    const body = world.createRigidBody(bodyDesc!);

    body.setTranslation(toSimulationPoint(getWorldPosition(ent)), false);
    body.setRotation(getWorldRotation(ent), false);

    body.userData = ent;

    RuntimeBody[ent] = body;

    attach(RuntimeBody, ent);
  });

  const onCreatedColliderWithRuntimeBody = onEnterQuery(
    query(Transform, Collider, RuntimeBody, not(RuntimeCollider)),
  );

  onCreatedColliderWithRuntimeBody((ent) => {
    let body = getRuntimeBody(ent);

    const auto = Collider.auto[ent];

    if (!auto) {
      throw new Error("not implemented");
    }

    const collidersDesc = createColliderDesc(ent);

    const colliderDesc = collidersDesc[0]!;

    setColliderOptions(colliderDesc, ent);

    const collider = world.createCollider(colliderDesc, body);

    mapColliderHandleToEntity(collider.handle, ent);

    collider.setTranslation(toSimulationPoint(getWorldPosition(ent)));
    collider.setRotation(getWorldRotation(ent));

    RuntimeCollider[ent] = collider;

    attach(RuntimeCollider, ent);
  });

  const onCreatedBodyWithChildren = onEnterQuery(
    query(Transform, RuntimeBody, Children),
  );

  // attach children colliders
  onCreatedBodyWithChildren((entity) => {
    const body = getRuntimeBody(entity);

    traverseDescendants(entity, (ent) => {
      if (has(Collider, entity)) {
        const auto = Collider.auto[ent];

        if (!auto) {
          throw new Error("not implemented");
        }

        const collidersDesc = createColliderDesc(ent);

        const colliderDesc = collidersDesc[0]!;

        setColliderOptions(colliderDesc, ent);

        const collider = world.createCollider(colliderDesc, body);

        collider.setTranslationWrtParent(
          toSimulationPoint(getLocalPosition(ent)),
        );

        collider.setRotationWrtParent(getLocalRotation(ent));

        mapColliderHandleToEntity(collider.handle, ent);

        RuntimeCollider[ent] = collider;

        attach(RuntimeCollider, ent);
      }
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

export function fromSimulationPoint(vec: Vector, factor = SCALE_FACTOR) {
  return new Vec(vec.x * factor, vec.y * factor);
}

export function toSimulationPoint(vec: Vector, factor = SCALE_FACTOR) {
  return new Vec(vec.x / factor, vec.y / factor);
}
