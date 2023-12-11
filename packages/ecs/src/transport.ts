import {Chunk} from "./chunk.js";
import {getMessage, type Message} from "./message.js";
import type {World} from "./world.js";

export function createTransport(socket: WebSocket) {
  return new Transport(socket);
}

export class Transport {
  #socket: WebSocket;

  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  send(world: World, message: Message) {
    const data = message.encode(world, new Chunk(new ArrayBuffer(0)));
    return this.#socket.send(data);
  }

  receive(world: World, buffer: ArrayBuffer) {
    let chunk = new Chunk(buffer);
    while (chunk.offset < chunk.buffer.byteLength) {
      const id = chunk.readInt32();
      const message = getMessage(id);
      if (message) {
        chunk = message.decode(world, chunk);
      }
    }
  }
}
