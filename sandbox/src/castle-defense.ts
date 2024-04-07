import { Entity } from "aion-ecs";
import {
  beforeStart,
  defineEngine,
  defineLoop,
  emit,
  on,
  once,
} from "aion-engine";
import { click, direction, getMouse, key } from "aion-input";
import {
  translate,
  zoomBy,
  centerCameraOnEntity,
  setZoom,
  startScene,
  onSceneExit,
  Body,
  Collider,
  Fill,
  Rect,
  Stroke,
  Transform,
  createBody,
  createCollider,
  createTransform,
  defineScene,
  exitCurrentScene,
  screenToWorldPosition,
  setBodyPosition,
  useECS,
  usePhysics,
  aionPreset,
  getRectBounds,
  getX,
  getY,
  Collision,
  getRuntimeCollider,
  getWorldDistance,
  getWorldPosition,
  getRectWidth,
  getRectHeight,
} from "aion-preset";
import {
  Colors,
  fillRect,
  rect,
  setBackgroundColor,
  windowCenterX,
  windowCenterY,
  windowWidth,
} from "aion-render";
import { OBSTACLE_COLLISION_GROUP } from "./castle-defense/collision-groups";
import {
  EnemySpawn,
  Floor,
  IsTreasure,
  Health,
  Blueprint,
} from "./castle-defense/components";
import { setupAI } from "./castle-defense/ai";
import { createEnemy } from "./castle-defense/enemy";
import { millitimestamp, vec } from "aion-core";
import { usePrefabs } from "./castle-defense/prefabs";
import { createWall } from "./castle-defense/wall";

export const engine = defineEngine(plugins, () => {
  const { $camera, getFloor } = useGame();

  defineLoop(() => {
    emit("update");

    emit("draw");
  });

  setBackgroundColor(Colors["rhino:950"]);

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

  const { Treasure, SpawnPoint } = usePrefabs();

  defineScene("build-castle", () => {
    const { $ecs, $physics, getFloor } = useGame();

    let wallNumber = 0;

    const blueprint = createWall();

    $ecs.attach(Blueprint, blueprint);

    return on("update", () => {
      const { x, y } = screenToWorldPosition(getMouse());

      setBodyPosition(blueprint, { x, y });

      {
        const distance = getWorldDistance(blueprint, getFloor());
        // const w = getRectWidth(getFloor());
        // const h = getRectHeight(getFloor());
        const p = vec({ x, y }).sub(distance);
        // const p = distance.sub(vec({ x, y }));
        console.log({ distance });
        once("render", () => {
          rect(p.x, p.y, 50, 50).fill("yellow");
        });

        const result = $physics.world.projectPoint(
          p,
          true,
          undefined,
          undefined,
          getRuntimeCollider(blueprint),
        );

        console.log({ result });
        if (result?.point) {
          once("render", () => {
            rect(result.point.x, result.point.y, 50, 50).stroke("pink");
          });
        }
      }

      if (click()) {
        createWall(x, y);

        wallNumber++;
      }

      if (wallNumber === 4) {
        $ecs.remove(blueprint);
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
      Fill: Colors["fuchsia-blue:700"],
      Stroke: "black",
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
          Fill: Colors["fuchsia-blue:700"],
          Stroke: "black",
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

    let enemyCreated = false;

    return on("update", () => {
      query(Transform, EnemySpawn).each((entity) => {
        if (enemyCreated) return;
        const frequency = EnemySpawn.frequency[entity]!;
        const lastSpawn = EnemySpawn.lastSpawn[entity]!;

        const now = millitimestamp();

        const secondsSinceLastSpawn = (now - lastSpawn) / 1000;

        if (secondsSinceLastSpawn >= frequency) {
          EnemySpawn.lastSpawn[entity] = now;

          createEnemy({ x: getX(entity), y: getY(entity) }, treasure);

          // enemyCreated = true;
        }
      });
    });
  });
}

export function plugins() {
  const preset = aionPreset({
    renderDebug: false,
    debugEntityID: false,
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
      Fill: Colors["rhino:900"],
      Stroke: "black",
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
