import { Chunk } from "aion-ecs";
import { getMessage, type Message } from "./message.js";
import type { World } from "aion-ecs";

export function createTransport(socket: WebSocket) {
  return new Transport(socket);
}

export class Transport {
  #socket: WebSocket;

  constructor(socket: WebSocket) {
    this.#socket = socket;
  }
  //@todo concat messages
  send(world: World, message: Message) {
    try {
      const data = message.encode(world, new Chunk(new ArrayBuffer(0)));
      return this.#socket.send(data);
    } catch (e) {
      console.error(e);
    }
  }

  receive(world: World, buffer: ArrayBuffer) {
    try {
      let chunk = new Chunk(buffer);
      while (chunk.offset < chunk.buffer.byteLength) {
        const id = chunk.readInt32();
        const message = getMessage(id);
        if (message) {
          chunk = message.decode(world, chunk);
        } else {
          throw Error("Unknown message");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}
