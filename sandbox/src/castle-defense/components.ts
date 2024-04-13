import { defineComponent, u16, f32, createTag } from "aion-ecs";

export const Health = defineComponent(u16);
export const EnemySpawn = defineComponent({
  frequency: u16,
  lastSpawn: f32,
});

export const Floor = createTag();
export const IsEnemy = createTag();
export const IsTreasure = createTag();
export const Blueprint = createTag();
export const Building = createTag();

// export const Destroyable = { Building, Health };
