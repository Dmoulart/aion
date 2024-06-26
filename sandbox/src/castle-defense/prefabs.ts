import {
  Body,
  Brain,
  CharacterController,
  Collider,
  Fill,
  Rect,
  Stroke,
  Circle,
  Transform,
  singleton,
  useECS,
} from "aion-preset";
import {
  IsTreasure,
  EnemySpawn,
  Health,
  IsEnemy,
  Building,
} from "./components";
import { Weapon } from "./enemy";
import { Gun, AutoTarget, Projectile } from "./turret";

export const usePrefabs = singleton(() => {
  const { prefab } = useECS();

  const Treasure = prefab({
    Transform,
    Rect,
    Fill,
    Stroke,
    Collider,
    Body,
    IsTreasure,
    Health,
    Building,
  });

  const SpawnPoint = prefab({
    Transform,
    EnemySpawn,
  });

  const Wall = prefab({
    Transform,
    Rect,
    Fill,
    Stroke,
    Collider,
    Body,
    Health,
    Building,
  });

  const Enemy = prefab({
    Transform,
    Rect,
    Fill,
    Stroke,
    Collider,
    Body,
    CharacterController,
    IsEnemy,
    Brain,
    Health,
  });

  const Sword = prefab({
    Transform,
    Rect,
    Fill,
    Stroke,
    Weapon,
    Collider,
  });

  const Turret = prefab({
    Transform,
    Circle,
    Fill,
    Stroke,
    Collider,
    Body,
  });

  const Canon = prefab({
    Transform,
    Rect,
    Fill,
    Stroke,
    Gun,
    AutoTarget,
  });

  const Bullet = prefab({
    Transform,
    Rect,
    Fill,
    Stroke,
    Collider,
    Body,
    Projectile,
  });

  return { Treasure, SpawnPoint, Wall, Enemy, Sword, Turret, Canon, Bullet };
});
