import { defineComponent, u16, f32 } from "aion-ecs";

export const Floor = defineComponent({});
export const Health = defineComponent(u16);
export const EnemySpawn = defineComponent({
  frequency: u16,
  lastSpawn: f32,
});
export const IsEnemy = defineComponent({});
export const IsTreasure = defineComponent({});
export const Blueprint = defineComponent({});
export const Building = defineComponent({});

export const Destroyable = { Building, Health };
