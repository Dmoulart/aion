import { onEnterQuery, not, type Entity, none } from "aion-ecs";
import {
  Body,
  Collider,
  RuntimeBody,
  RuntimeCollider,
  setColliderOptions,
  usePhysics,
} from "./index.js";
import type RAPIER from "@dimforge/rapier2d-compat";
import { Circle, Rect } from "../components.js";
import { useECS } from "../ecs.js";
import { Vec, assert, type Vector } from "aion-core";
import { on } from "aion-engine";
import {
  Transform,
  getLocalPosition,
  getLocalRotation,
  getWorldPosition,
  getWorldRotation,
  setPosition,
  setRotation,
} from "../basics/transform.js";
import { getRuntimeBody, setBodyOptions } from "./bodies.js";
import { Parent, findNearestAncestorWithComponent } from "../index.js";

export function initPhysicsSystems() {
  const { world, RAPIER } = usePhysics();
  const { query, attach } = useECS();

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

  const onCreatedColliderAndRuntimeBody = onEnterQuery(
    query(Transform, Collider, RuntimeBody, not(RuntimeCollider)),
  );

  onCreatedColliderAndRuntimeBody((ent) => {
    let body = getRuntimeBody(ent);

    const auto = Collider.auto[ent];

    if (!auto) {
      throw new Error("not implemented");
    }

    const collidersDesc = createColliderDesc(ent);

    const colliderDesc = collidersDesc[0]!;

    setColliderOptions(colliderDesc, ent);

    const collider = world.createCollider(colliderDesc, body);

    collider.setTranslation(toSimulationPoint(getWorldPosition(ent)));
    collider.setRotation(getWorldRotation(ent));

    RuntimeCollider[ent] = collider;

    attach(RuntimeCollider, ent);
  });

  const onCreatedChildCollider = onEnterQuery(
    query(Transform, Collider, Parent, none(Body, RuntimeCollider)),
  );

  onCreatedChildCollider((entity) => {
    const ancestorWithBody = findNearestAncestorWithComponent(
      entity,
      RuntimeBody,
    );
    debugger;

    if (!ancestorWithBody) {
      console.info("cannot find an ancestor with body");
    }

    const body = getRuntimeBody(ancestorWithBody!);

    const collidersDesc = createColliderDesc(entity);

    const colliderDesc = collidersDesc[0]!;

    setColliderOptions(colliderDesc, entity);

    const collider = world.createCollider(colliderDesc, body);

    collider.setTranslationWrtParent(
      toSimulationPoint(getLocalPosition(entity)),
    );
    collider.setRotationWrtParent(getLocalRotation(entity));

    RuntimeCollider[entity] = collider;

    attach(RuntimeCollider, entity);
  });

  // on("update", () => {
  //   const { query } = useECS();

  //   query(RuntimeBody, Transform).each((ent) => {
  //     const body = RuntimeBody[ent]!;

  //     setPosition(ent, fromSimulationPoint(body.translation()));
  //     setRotation(ent, body.rotation());
  //   });
  // });
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
