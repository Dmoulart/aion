import { Entity, onEnterQuery } from "aion-ecs";
import { beforeStart, defineEngine, defineLoop, emit, on } from "aion-engine";
import { click, direction, getMouse, key } from "aion-input";
import {
  translate,
  zoomBy,
  centerCameraOnEntity,
  setZoom,
  startScene,
  onSceneExit,
  Rect,
  Transform,
  createBody,
  createCollider,
  createTransform,
  defineScene,
  exitCurrentScene,
  screenToWorldPosition,
  setRuntimeBodyPosition,
  useECS,
  usePhysics,
  aionPreset,
  getRectWorldBounds,
  getX,
  getY,
  Collision,
  castRay,
  getRectHalfHeight,
  getCollidingEntity,
} from "aion-preset";
import {
  Colors,
  fillText,
  font,
  setBackgroundColor,
  windowCenterX,
  windowCenterY,
  windowWidth,
} from "aion-render";
import { OBSTACLE_COLLISION_GROUP } from "./castle-defense/collision-groups";
import {
  EnemySpawn,
  Floor,
  Blueprint,
  Destroyable,
  Building,
  Health,
} from "./castle-defense/components";
import { setupAI } from "./castle-defense/ai";
import { Weapon, createEnemy } from "./castle-defense/enemy";
import { downDirection, millitimestamp } from "aion-core";
import { usePrefabs } from "./castle-defense/prefabs";
import { createWall } from "./castle-defense/wall";
import { damage, getHealth } from "./castle-defense/health";

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
    const { $ecs } = useGame();

    let wallNumber = 0;

    const blueprint = createWall();

    $ecs.attach(Blueprint, blueprint);

    return on("update", () => {
      const mouse = screenToWorldPosition(getMouse());

      const result = castRay(mouse, downDirection(), undefined, 20);

      if (result) {
        const { point } = result;
        point.y -= getRectHalfHeight(blueprint);
        setRuntimeBodyPosition(blueprint, point);

        if (click()) {
          createWall(point.x, point.y);

          wallNumber++;
        }
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

      setRuntimeBodyPosition(player, { x, y });

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
        frequency: 60,
        lastSpawn: 0,
      },
      Transform: createTransform(left, top - 25),
    });

    SpawnPoint({
      EnemySpawn: {
        frequency: 60,
        lastSpawn: 0,
      },
      Transform: createTransform(right, top - 25),
    });

    const { query, has, remove } = useECS();

    let enemyCreated = false;

    const onBuildingDamaged = onEnterQuery(query(Building, Health, Collision));

    on("render", () => {
      query(Building, Health).each((entity) => {
        if (getHealth(entity) !== 1000) {
          const { top, left } = getRectWorldBounds(entity);

          font("Arial 48px");
          fillText(getHealth(entity).toString(), left, top, "white");
        }
      });
    });

    onBuildingDamaged((building) => {
      const attacker = getCollidingEntity(building);

      if (has(Weapon, attacker)) {
        damage(building, Weapon.hit[attacker]);
      }

      if (getHealth(building) <= 0) {
        remove(building);
        console.log("----REMOVED", building);
      }
    });

    return on("update", () => {
      query(Transform, EnemySpawn).each((entity) => {
        if (enemyCreated) return;

        const frequency = EnemySpawn.frequency[entity]!;
        const lastSpawn = EnemySpawn.lastSpawn[entity]!;

        const now = millitimestamp();

        const secondsSinceLastSpawn = (now - lastSpawn) / 1000;

        if (secondsSinceLastSpawn >= frequency || lastSpawn === 0) {
          EnemySpawn.lastSpawn[entity] = now;

          createEnemy({ x: getX(entity), y: getY(entity) }, treasure);
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
  return getRectWorldBounds(getFloor());
}
