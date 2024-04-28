import { millitimestamp } from "aion-core";
import { onEnterQuery, onExitQuery } from "aion-ecs";
import { on, stopEngine } from "aion-engine";
import {
  createTransform,
  useECS,
  Collision,
  getRectWorldBounds,
  getCollidingEntity,
  Transform,
  getX,
  getY,
} from "aion-preset";
import { font, fillText, windowCenter, setBackgroundColor } from "aion-render";
import { setupAI } from "../ai";
import { Building, Health, IsTreasure, EnemySpawn } from "../components";
import { Weapon, createEnemy } from "../enemy";
import { getHealth, damage } from "../health";
import { usePrefabs } from "../prefabs";
import { getFloorBounds } from "../floor";

export default () => {
  const { SpawnPoint } = usePrefabs();
  const { left, right, top } = getFloorBounds();

  setupAI();

  SpawnPoint({
    EnemySpawn: {
      frequency: 2,
      lastSpawn: 0,
    },
    Transform: createTransform(left, top - 25),
  });

  SpawnPoint({
    EnemySpawn: {
      frequency: 2,
      lastSpawn: 0,
    },
    Transform: createTransform(right, top - 25),
  });

  const { query, has } = useECS();

  let enemyCreated = false;

  const onBuildingDamaged = onEnterQuery(query(Building, Health, Collision));
  const onTreasureDestroyed = onExitQuery(query(IsTreasure));

  on("render", () => {
    query(Health).each((entity) => {
      const { top, left } = getRectWorldBounds(entity);

      font("Arial 48px");
      fillText(getHealth(entity).toString(), left, top, "white");
    });
  });

  onBuildingDamaged((building) => {
    const attacker = getCollidingEntity(building);

    if (has(Weapon, attacker)) {
      damage(building, Weapon.hit[attacker]);
    }
  });

  onTreasureDestroyed(() => {
    const { x, y } = windowCenter();
    setBackgroundColor("black");

    stopEngine();

    on("render", () => {
      font("Arial 148px").strokeText("GAME OVER", x, y, "white");
    });
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

        const treasure = query(IsTreasure).first();
        if (treasure) {
          createEnemy({ x: getX(entity), y: getY(entity) }, treasure);
        }
      }
    });
  });
};
