import { onEnterQuery, not } from "aion-ecs";
import {
  Body,
  Collider,
  RuntimeBody,
  RuntimeCollider,
  createRuntimeCollider,
  usePhysics,
} from "./index.js";
import { useECS } from "../ecs.js";
import { Vec, type Vector } from "aion-core";
import {
  Transform,
  getLocalMatrix,
  getLocalPosition,
  getLocalRotation,
  getWorldPosition,
  getWorldRotation,
} from "../basics/transform.js";
import { getRuntimeBody, setBodyOptions } from "./bodies.js";
import {
  Children,
  getMatrixTranslation,
  traverseDescendants,
} from "../index.js";

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

    const collider = createRuntimeCollider(ent, world, body);

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
        const collider = createRuntimeCollider(ent, world, body);

        // const mat = getLocalMatrix(ent);
        // const position = getMatrixTranslation(mat); // take scale into account

        collider.setTranslationWrtParent(
          toSimulationPoint(getLocalPosition(ent)),
        );
        collider.setRotationWrtParent(getLocalRotation(ent));

        RuntimeCollider[ent] = collider;
        attach(RuntimeCollider, ent);
      }
    });
  });
}

export const SCALE_FACTOR = 50;

export function fromSimulationPoint(vec: Vector, factor = SCALE_FACTOR) {
  return new Vec(vec.x * factor, vec.y * factor);
}

export function toSimulationPoint(vec: Vector, factor = SCALE_FACTOR) {
  return new Vec(vec.x / factor, vec.y / factor);
}
