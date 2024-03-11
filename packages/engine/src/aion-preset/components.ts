//@todo why src import
import { defineComponent, i32, u32 } from "aion-ecs/src";

export function createComponents() {
  const Position = defineComponent({ x: i32, y: i32 });
  const Velocity = defineComponent({ x: i32, y: i32 });

  const Rect = defineComponent({ w: i32, h: i32 });

  const Circle = defineComponent({ r: i32 });

  const Color = defineComponent(() => new Array<string>());

  return { Position, Velocity, Rect, Circle, Color };
}
