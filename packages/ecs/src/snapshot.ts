import type {Chunk} from "./chunk.js";
import type {Component} from "./component.js";
import {defineEncoder} from "./encoder.js";
import type {Entity} from "./entity.js";
import {query} from "./query.js";
import type {World} from "./world.js";

export function createSnapshot(
  world: World,
  chunk: Chunk,
  ...components: Component[]
) {
  const [encode, decode] = defineEncoder(components);

  const ents: Array<Entity> = [];

  const archetypes = query(world, ...components).archetypes;

  for (const arch of archetypes) {
    ents.push(...arch.entities.dense);
  }

  return encode(ents, chunk);
}
