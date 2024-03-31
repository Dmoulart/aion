import { Entity } from "aion-ecs";
import { beforeStart, defineEngine, defineLoop, emit, on } from "aion-engine";
import { click, direction, getMouse, key } from "aion-input";
import {
  translate,
  zoomBy,
  centerCameraOnEntity,
  setZoom,
  startScene,
  onSceneExit,
  Body,
  CharacterController,
  Collider,
  Fill,
  Rect,
  RuntimeBody,
  RuntimeCharacterController,
  RuntimeCollider,
  Stroke,
  Transform,
  createBody,
  createCollider,
  createTransform,
  defineScene,
  exitCurrentScene,
  getWorldDistance,
  screenToWorldPosition,
  setBodyPosition,
  useECS,
  usePhysics,
  aionPreset,
  getRectBounds,
  getX,
  getY,
  createCharacterController,
  getGravity,
  castRay,
  Brain,
} from "aion-preset";
import {
  Colors,
  setBackgroundColor,
  windowCenterX,
  windowCenterY,
  windowWidth,
} from "aion-render";
import {
  OBSTACLE_COLLISION_GROUP,
  ENEMY_COLLISION_GROUP,
} from "./castledefense/collision-groups";
import {
  Resistance,
  IsEnemy,
  EnemySpawn,
  Floor,
  IsTreasure,
} from "./castledefense/components";
import { createTakeTreasureGoal, setupAI } from "./castledefense/ai";

export const engine = defineEngine(plugins, () => {
  const { $camera, getFloor } = useGame();

  defineLoop(() => {
    emit("update");

    emit("draw");
  });

  setBackgroundColor("black");

  setZoom(0.7);
  centerCameraOnEntity(getFloor());

  createScenes();

  onSceneExit("build-castle", () => startScene("place-treasure"));
  onSceneExit("place-treasure", () => startScene("invasion"));

  startScene("build-castle");

  on("update", () => {
    translate($camera, direction().scale(10));

    if (key("a")) {
      zoomBy(-0.04);
    }

    if (key("e")) {
      zoomBy(+0.04);
    }
  });
});

export const useGame = engine.use;

engine.run();

export function createScenes() {
  const { $ecs } = useGame();
  const { RAPIER } = usePhysics();

  // const onCollisionStart = onEnterQuery($ecs.query(Collision));
  // const onCollisionEnd = onExitQuery($ecs.query(Collision));

  const Wall = $ecs.prefab({
    Transform,
    Rect,
    Fill,
    Stroke,
    Collider,
    Body,
    Resistance,
  });

  const Treasure = $ecs.prefab({
    Transform,
    Rect,
    Fill,
    Stroke,
    Collider,
    Body,
    IsTreasure,
  });

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

  const SpawnPoint = $ecs.prefab({
    Transform,
    EnemySpawn,
  });

  defineScene("build-castle", () => {
    let wallNumber = 0;

    const player = Wall({
      Transform: createTransform(0, 0),
      Rect: {
        h: 500,
        w: 50,
      },
      Fill: "grey",
      Stroke: "white",
      Collider: createCollider({
        auto: 1,
        collisionGroups: OBSTACLE_COLLISION_GROUP,
      }),
      Resistance: 100,
    });

    return on("update", () => {
      const { x, y } = screenToWorldPosition(getMouse());

      setBodyPosition(player, { x, y });

      if (click()) {
        Wall({
          Transform: createTransform(x, y),
          Rect: {
            h: Rect.h[player],
            w: Rect.w[player],
          },
          Fill: Colors["cornflower:600"],
          Stroke: "white",
          Collider: createCollider({
            auto: 1,
            collisionGroups: OBSTACLE_COLLISION_GROUP,
          }),
          Body: createBody({
            type: RAPIER.RigidBodyType.Fixed,
          }),
          Resistance: 10,
        });

        wallNumber++;
      }

      if (wallNumber === 4) {
        $ecs.remove(player);
        exitCurrentScene();
      }
    });
  });

  let treasure: Entity;
  defineScene("place-treasure", () => {
    const player = Treasure({
      Transform: createTransform(0, 0),
      Rect: {
        h: 50,
        w: 50,
      },
      Fill: "yellow",
      Stroke: "white",
      Collider: createCollider({
        auto: 1,
        collisionGroups: OBSTACLE_COLLISION_GROUP,
      }),
      Body: createBody({
        type: RAPIER.RigidBodyType.Dynamic,
      }),
    });

    const cleanup = on("update", () => {
      const { x, y } = screenToWorldPosition(getMouse());

      setBodyPosition(player, { x, y });

      if (click()) {
        treasure = Treasure({
          Transform: createTransform(x, y),
          Rect: {
            h: Rect.h[player],
            w: Rect.w[player],
          },
          Fill: "yellow",
          Stroke: "white",
          Collider: createCollider({
            auto: 1,
            collisionGroups: OBSTACLE_COLLISION_GROUP,
          }),
          Body: createBody({
            type: RAPIER.RigidBodyType.Dynamic,
          }),
        });

        $ecs.remove(player);
        exitCurrentScene();
      }
    });

    return cleanup;
  });

  defineScene("invasion", () => {
    const { left, right, top } = getFloorBounds();

    setupAI();

    SpawnPoint({
      EnemySpawn: {
        frequency: 2,
        lastSpawn: performance.now(),
      },
      Transform: createTransform(left, top - 25),
    });

    SpawnPoint({
      EnemySpawn: {
        frequency: 2,
        lastSpawn: performance.now(),
      },
      Transform: createTransform(right, top - 25),
    });

    const { query } = useECS();

    const enemies = query(
      RuntimeCollider,
      RuntimeBody,
      RuntimeCharacterController,
      IsEnemy,
    );

    return on("update", () => {
      query(Transform, EnemySpawn).each((entity) => {
        const frequency = EnemySpawn.frequency[entity]!;
        const lastSpawn = EnemySpawn.lastSpawn[entity]!;

        const now = performance.now();

        const secondsSinceLastSpawn = (now - lastSpawn) / 1000;

        if (secondsSinceLastSpawn >= frequency) {
          EnemySpawn.lastSpawn[entity] = now;

          Enemy({
            Transform: createTransform(getX(entity), getY(entity)),
            Rect: {
              h: 50,
              w: 25,
            },
            Fill: "white",
            Stroke: "blue",
            Brain: {
              goal: createTakeTreasureGoal(treasure),
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
        }
      });

      // enemies.each((entity) => {
      //   const hit = castRay(entity, treasure, ENEMY_COLLISION_GROUP, 4.0);
      //   if (hit) {
      //     Fill[hit.entity] = "blue";
      //   }
      // });

      // enemies.each((entity) => {
      //   const controller = RuntimeCharacterController[entity]!;

      //   const movement = getWorldDistance(treasure, entity)
      //     .norm()
      //     .scale(10)
      //     .add(getGravity());

      //   controller.computeColliderMovement(
      //     RuntimeCollider[entity]!,
      //     movement,
      //     undefined,
      //     ENEMY_COLLISION_GROUP,
      //   );

      //   RuntimeBody[entity]!.setLinvel(controller.computedMovement(), false);
      // });
    });
  });
}

export function plugins() {
  const preset = aionPreset({
    renderDebug: true,
    debugEntityID: true,
  });

  // @todo: find a better way to keep a reference to an entity
  let floor: Entity = -1;

  function getFloor() {
    return floor;
  }

  beforeStart(() => {
    const { $ecs } = useGame();
    const { RAPIER } = usePhysics();

    floor = preset.createCube({
      Transform: createTransform(windowCenterX(), windowCenterY()),
      Rect: {
        h: 10,
        w: windowWidth() * 1,
      },
      Fill: Colors["acapulco:400"],
      Stroke: "white",
      Collider: createCollider({
        auto: 1,
        collisionGroups: OBSTACLE_COLLISION_GROUP,
      }),
      Body: createBody({
        type: RAPIER.RigidBodyType.Fixed,
      }),
    });

    $ecs.attach(Floor, getFloor());
  });

  return { ...preset, getFloor };
}

export function getFloorBounds() {
  const { getFloor } = useGame();
  return getRectBounds(getFloor());
}
