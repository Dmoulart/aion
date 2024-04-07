import {
  Body,
  Brain,
  CharacterController,
  Collider,
  Fill,
  Rect,
  Stroke,
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
  });

  const Sword = prefab({
    Transform,
    Rect,
    Fill,
    Stroke,
    Weapon,
    Collider,
    Body,
  });

  return { Treasure, SpawnPoint, Wall, Enemy, Sword };
});
