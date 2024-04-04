import { Vector, leftDirection } from "aion-core";
import { Entity } from "aion-ecs";
import {
  Transform,
  Rect,
  Fill,
  Stroke,
  Collider,
  Body,
  CharacterController,
  Brain,
  Circle,
  createTransform,
  createCollider,
  createBody,
  createCharacterController,
  addChildTo,
  useECS,
  usePhysics,
  singleton,
  getApproximateDirection,
  scale,
  rotate,
  degreesToRadians,
  flipX,
} from "aion-preset";
import { createTakeTreasureGoal } from "./ai";
import { ENEMY_COLLISION_GROUP } from "./collision-groups";
import { IsEnemy } from "./components";

export const useEnemyPrefabs = singleton(() => {
  const $ecs = useECS();

  const Enemy = $ecs.prefab({
    Transform,
    Rect,
    Fill,
    Stroke,
    Collider,
    Body,
    CharacterController,
    IsEnemy,
    Brain,
  });

  const Sword = $ecs.prefab({
    Transform,
    Rect,
    Fill,
    Stroke,
  });

  return { Enemy, Sword };
});

export function createEnemy(pos: Vector, target: Entity) {
  const { Sword, Enemy } = useEnemyPrefabs();

  const { RAPIER } = usePhysics();

  const sword = Sword({
    Transform: createTransform(10, -20),
    Fill: "grey",
    Stroke: "black",
    Rect: {
      h: 50,
      w: 5,
    },
  });

  const enemy = Enemy({
    Transform: createTransform(pos.x, pos.y),
    Rect: {
      h: 50,
      w: 25,
    },

    Fill: "white",
    Stroke: "blue",
    Brain: {
      goal: createTakeTreasureGoal(target),
    },
    Collider: createCollider({
      auto: 1,
      collisionGroups: ENEMY_COLLISION_GROUP,
    }),
    Body: createBody({
      type: RAPIER.RigidBodyType.Dynamic,
      rotationsEnabled: 0,
    }),
    CharacterController: createCharacterController({
      offset: 0.01,
      autoStepMaxHeight: 0.1,
      autoStepMinWidth: 0.2,
      snapToGround: 1,
      slideEnabled: 1,
    }),
  });

  addChildTo(enemy, sword);

  const comesFromRight = getApproximateDirection(enemy, target).equals(
    leftDirection(),
  );

  // if (comesFromRight) {
  //   flipX(enemy);
  // }
}
