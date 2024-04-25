import { onEnterQuery, not, onExitQuery, type Entity } from "aion-ecs";
import {
  Body,
  Collider,
  RuntimeBody,
  RuntimeCollider,
  createRuntimeCollider,
  getRuntimeCollider,
  setRuntimeCollider,
  unmapColliderHandleToEntity,
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
import { getRuntimeBody, setBodyOptions, setRuntimeBody } from "./bodies.js";
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

    setRuntimeBody(ent, body);

    attach(RuntimeBody, ent);
  });

  const onRemovedCollider = onExitQuery(query(Transform, RuntimeCollider));
  const onRemovedBody = onExitQuery(query(Transform, RuntimeBody));

  onRemovedCollider((ent) => {
    const collider = getRuntimeCollider(ent);
    if (collider) {
      unmapColliderHandleToEntity(collider.handle);
      world.removeCollider(collider, true);
    }
  });

  onRemovedBody((ent) => {
    const body = getRuntimeBody(ent);

    if (body) {
      // for (let i = 0; i < body.numColliders(); i++) {
      //   const collider = body.collider(i);
      //   world.removeCollider(collider, false);
      //   unmapColliderHandleToEntity(collider.handle);
      // }
      world.removeRigidBody(getRuntimeBody(ent));
    }
  });

  const onCreatedColliderWithRuntimeBody = onEnterQuery(
    query(Transform, Collider, RuntimeBody, not(RuntimeCollider)),
  );

  onCreatedColliderWithRuntimeBody((ent) => {
    let body = getRuntimeBody(ent);

    const collider = createRuntimeCollider(ent, world, body);

    collider.setTranslation(toSimulationPoint(getWorldPosition(ent)));
    collider.setRotation(getWorldRotation(ent));
    setRuntimeCollider(ent, collider);
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
        setRuntimeCollider(descendant, collider);
        attach(RuntimeCollider, descendant);
      }
    });
  });
}

export const SCALE_FACTOR = 50;

export function getPhysicsWorldPosition(entity: Entity) {
  return toSimulationPoint(getWorldPosition(entity));
}

export function fromSimulationPoint(vec: Vector, factor = SCALE_FACTOR) {
  return new Vec(vec.x * factor, vec.y * factor);
}

export function toSimulationPoint(vec: Vector, factor = SCALE_FACTOR) {
  return new Vec(vec.x / factor, vec.y / factor);
}

export function toSimulationValue(value: number, factor = SCALE_FACTOR) {
  return value / factor;
}

export function fromSimulationValue(value: number, factor = SCALE_FACTOR) {
  return value * factor;
}
