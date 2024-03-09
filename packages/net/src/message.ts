import { Chunk } from "aion-ecs";
import type { World } from "aion-ecs";

export type Message = {
  encode: (world: World, chunk: Chunk) => ArrayBuffer;
  decode: (world: World, chunk: Chunk) => Chunk;
};

const messages: Message[] = [];

let messageId = 0;

const nextMessageId = () => messageId++;

export function defineMessage(message: Message): Message {
  const id = nextMessageId();
  messages[id] = message;
  return {
    encode(world, chunk) {
      chunk.ensureAvailableCapacity(4);
      chunk.writeInt32(id);
      return message.encode(world, chunk);
    },
    decode(world, chunk) {
      return message.decode(world, chunk);
    },
  };
}

export function getMessage(id: number) {
  return messages[id];
}
