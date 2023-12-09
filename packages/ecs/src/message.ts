import type {World} from "./world.js";

export type Message = {
  encode: (world: World) => ArrayBuffer;
  decode: (world: World, buffer: ArrayBuffer) => void;
};

const messages: Message[] = [];

export function defineMessage(id: number, message: Message) {
  messages[id] = message;
  return message;
}

export function getMessage(id: number) {
  return messages[id];
}
