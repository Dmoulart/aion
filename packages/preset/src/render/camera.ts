import { bool, defineComponent, f32 } from "aion-ecs";

export const Camera = defineComponent({
  zoom: f32,
  default: bool,
});
