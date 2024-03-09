import {
  type Component,
  defineComponent,
  type ComponentId,
} from "./component.js";
import { lo, type Entity, pair, type ID } from "./entity.js";
import { nextID } from "./id.js";
import type { Schema } from "./schemas.js";
import { DEFAULT_WORLD_CAPACITY } from "./world.js";

const isWildcard = (str: unknown): str is "*" => str === "*";

const relations = new Map<ID, Component | ID>();

export function defineRelation<S extends Schema>(
  schema?: S,
  size: number = DEFAULT_WORLD_CAPACITY
) {
  const baseID = nextID();

  const instances: Array<ComponentId | ID> = [];

  return function <T extends Entity | "*">(
    entityOrWildcard: T
  ): T extends "*" ? Array<ComponentId | ID>[] : Component<S> {
    if (isWildcard(entityOrWildcard)) {
      //@todo proper typings
      return instances as T extends "*"
        ? Array<ComponentId | ID>[]
        : Component<S>;
    }

    const entity = entityOrWildcard as Entity;
    // @todo number limit ?
    const id = pair(entity, baseID);

    if (relations.has(id)) {
      const componentOrID = relations.get(id);
      //@todo: proper typing
      return componentOrID as T extends "*"
        ? Array<ComponentId | ID>[]
        : Component<S>;
    }
    let ret: Component | ID;

    if (schema) {
      //@todo proper typing
      //@ts-expect-error
      ret = defineComponent(schema, size, id);
    } else {
      ret = id;
    }

    instances.push(id);
    relations.set(id, ret);
    return ret as T extends "*" ? Array<ComponentId | ID>[] : Component<S>;
  };
}
