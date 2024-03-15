import { onEnterQuery, all, none, not } from "aion-ecs";
import {
  Body,
  Collider,
  RuntimeBody,
  RuntimeCollider,
  usePhysics,
} from "./index.js";
import { once, on } from "../../lifecycle.js";
import { positionOf, setPosition } from "../basics/index.js";
import { Position } from "../components.js";
import { useECS } from "../ecs.js";
import { Vec, type Vector } from "aion-core";

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
      query(Position, Collider, RuntimeBody, not(RuntimeCollider))
    );

    onCreatedCollider((ent) => {
      console.log("on create collider");
      const parent = RuntimeBody[ent];

      const collider = world.createCollider(Collider[ent]!, parent);

      collider.setTranslation(toSimulation(positionOf(ent)));

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

function fromSimulation(vec: Vector, factor = 50) {
  return new Vec(vec.x * factor, vec.y * factor);
}

function toSimulation(vec: Vector, factor = 50) {
  return new Vec(vec.x / factor, vec.y / factor);
}
