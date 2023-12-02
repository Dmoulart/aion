import type {World} from "./world.js";

export type Message = {
  encode: (world: World) => ArrayBuffer;
  decode: (world: World, buffer: ArrayBuffer) => void;
};

export const messages: Message[] = [];

export function defineMessage(id: number, message: Message) {
  messages[id] = message;

  return {
    encode: (world: World) => {
      return message.encode(world);
    },
    decode: (world: World, buffer: ArrayBuffer) => {
      return message.decode(world, buffer);
    },
  };
}
