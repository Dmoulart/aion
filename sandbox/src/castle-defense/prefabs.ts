import {
  Body,
  Collider,
  Fill,
  Rect,
  Stroke,
  Transform,
  singleton,
  useECS,
} from "aion-preset";
import { IsTreasure, EnemySpawn, Health } from "./components";

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
  });

  return { Treasure, SpawnPoint, Wall };
});
