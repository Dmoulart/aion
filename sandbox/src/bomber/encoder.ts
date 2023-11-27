import {
  Component,
  Entity,
  isSingleTypeSchema,
} from "../../../packages/ecs/dist";

export function defineEncoder(...components: Component) {
  function encode(e: Entity) {}

  function decode(e: Entity) {}

  return [encode, decode];
}

// export function createMessage(
//   world: World,
//   ...components: Component
// ) {
//   return {
//     encode(entity: Entity, view: DataView) {
//       view.setInt32(0, entity); // 4
//     },
//     decode() {},
//   };
// }

// export class Message<T extends Component[]> {
//   static of(...components: Component[]) {}
// }

// export class Encoder<T extends Component[]> {
//   static of(...components: Component[]) {}
// }
