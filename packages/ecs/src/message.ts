import {Chunk} from "./chunk.js";
import type {World} from "./world.js";

export type Message = {
  encode: (world: World, chunk: Chunk) => ArrayBuffer;
  decode: (world: World, chunk: Chunk) => Chunk;
};

const messages: Message[] = [];

let messageId = 0;

const nextMessageId = () => messageId++;

export function defineMessage(message: Message): Message {
  const id = nextMessageId();
  console.log("mid", {id});
  messages[id] = message;
  return {
    encode(world, chunk) {
      chunk.ensureAvailableCapacity(4);
      chunk.writeInt32(id);
      console.log("write int 32", id);
      return message.encode(world, chunk);
    },
    decode(world, chunk) {
      // const chunk = new Chunk(buffer);
      // const id = chunk.readInt32();
      return message.decode(world, chunk);
    },
  };
}

export function getMessage(id: number) {
  return messages[id];
}
