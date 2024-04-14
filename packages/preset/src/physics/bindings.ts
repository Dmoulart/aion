import { onEnterQuery, not, onExitQuery } from "aion-ecs";
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
  getLocalScale,
  getWorldMatrix,
  getWorldPosition,
  getWorldRotation,
} from "../basics/transform.js";
import { getRuntimeBody, setBodyOptions } from "./bodies.js";
import {
  Children,
  createIdentityMatrix,
  getMatrixTranslation,
  multiplyMatrices,
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

  const onRemovedBody = onExitQuery(query(Transform, RuntimeBody));

  onRemovedBody((ent) => {
    world.removeRigidBody(getRuntimeBody(ent));
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

  //@todo this a weak, this could not be triggered easily
  const onCreatedBodyWithChildren = onEnterQuery(
    query(Transform, RuntimeBody, Children),
  );

  // attach children colliders

  onCreatedBodyWithChildren((ancestor) => {
    const body = getRuntimeBody(ancestor);
    const ancestorScale = getLocalScale(ancestor);

    traverseDescendants(ancestor, (descendant) => {
      if (has(Collider, descendant)) {
        const collider = createRuntimeCollider(descendant, world, body);

        const position = toSimulationPoint(getLocalPosition(descendant));
        //@todo sync rotation with scale like in init.js
        position.scaleEq(ancestorScale.x, ancestorScale.y);

        collider.setTranslationWrtParent(position);
        collider.setRotationWrtParent(getLocalRotation(descendant));

        RuntimeCollider[descendant] = collider;
        attach(RuntimeCollider, descendant);
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
