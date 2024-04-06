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
  createTransform,
  createCollider,
  createBody,
  createCharacterController,
  addChildTo,
  useECS,
  usePhysics,
  singleton,
  getApproximateDirection,
  flipX,
  useAion,
  degreesToRadians,
} from "aion-preset";
import { createTakeTreasureGoal } from "./ai";
import { ENEMY_COLLISION_GROUP } from "./collision-groups";
import { IsEnemy } from "./components";
import { useGame } from "../castle-defense";
import { Colors } from "aion-render";

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

  const { createRect, createCircle } = useAion();

  // eye
  addChildTo(
    enemy,
    createCircle({
      Transform: createTransform(-7, -10),
      Circle: {
        r: 2,
      },
      Fill: Colors["mine-shaft:900"],
      Stroke: "black",
    }),
  );

  // eyebrow
  addChildTo(
    enemy,
    createRect({
      Transform: createTransform(-10, -20, degreesToRadians(30)),
      Rect: {
        w: 5,
        h: 10,
      },
      Fill: Colors["mine-shaft:900"],
      Stroke: "black",
    }),
  );

  // mouth
  addChildTo(
    enemy,
    createRect({
      Transform: createTransform(-7, 5),
      Rect: {
        w: 10,
        h: 2,
      },
      Fill: Colors["mine-shaft:900"],
      Stroke: "black",
    }),
  );

  //sword
  addChildTo(enemy, sword);

  const comesFromRight = getApproximateDirection(enemy, target).equals(
    leftDirection(),
  );

  if (comesFromRight) {
    flipX(enemy);
  }
}
