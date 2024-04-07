import { Vector, leftDirection } from "aion-core";
import { Entity, defineComponent } from "aion-ecs";
import {
  createTransform,
  createCollider,
  createBody,
  createCharacterController,
  addChildTo,
  useECS,
  usePhysics,
  getApproximateDirection,
  flipX,
  useAion,
  degreesToRadians,
} from "aion-preset";
import { createTakeTreasureGoal } from "./ai";
import { ENEMY_COLLISION_GROUP } from "./collision-groups";
import { Colors } from "aion-render";
import { usePrefabs } from "./prefabs";

export const Weapon = defineComponent({});
export const EyeBrow = defineComponent({});

export const SWORDS: Array<number> = [];

export function createEnemy(pos: Vector, target: Entity) {
  const { Sword, Enemy } = usePrefabs();

  const { attach } = useECS();

  const { RAPIER } = usePhysics();

  const sword = Sword({
    Transform: createTransform(10, -20),
    Fill: "grey",
    Stroke: "black",
    Rect: {
      h: 50,
      w: 5,
    },
    Collider: createCollider({
      auto: 1,
      isSensor: 1,
    }),
    Body: createBody({
      type: RAPIER.RigidBodyType.KinematicPositionBased,
    }),
  });
  SWORDS.push(sword);

  const enemy = Enemy({
    Transform: createTransform(pos.x, pos.y),
    Rect: {
      h: 50,
      w: 25,
    },
    Fill: "white",
    Stroke: "black",
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

  const eyebrow = createRect({
    Transform: createTransform(-8, -20, degreesToRadians(-30)),
    Rect: {
      w: 10,
      h: 5,
    },
    Fill: Colors["mine-shaft:900"],
    Stroke: "black",
  });

  attach(EyeBrow, eyebrow);
  addChildTo(enemy, eyebrow);

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
