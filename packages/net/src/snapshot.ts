import type {Chunk} from "aion-ecs";
import type {Component} from "aion-ecs";
import {defineEncoder} from "aion-ecs";
import type {Entity} from "aion-ecs";
import {query} from "aion-ecs";
import type {World} from "aion-ecs";

export function createSnapshot(
  world: World,
  chunk: Chunk,
  ...components: Component[]
) {
  const [encode] = defineEncoder(components);

  const ents: Array<Entity> = [];

  const archetypes = query(world, ...components).archetypes;

  for (const arch of archetypes) {
    ents.push(...arch.entities.dense);
  }

  return encode(ents, chunk);
}
