import { bool, defineComponent, f32, type Entity, i32 } from "aion-ecs";

export const Camera = defineComponent({
  default: bool,
  zoom: i32,
});
