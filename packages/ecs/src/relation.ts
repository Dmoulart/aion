import {
  type Component,
  defineComponent,
  type ComponentID,
} from "./component.js";
import { type Entity, type ID } from "./entity.js";
import { nextID, pair } from "./id.js";
import type { Schema } from "./schemas.js";
import { DEFAULT_WORLD_CAPACITY } from "./world.js";

const isWildcard = (str: unknown): str is "*" => str === "*";

const relations = new Map<ID, Component | ID>();

export function defineRelation<S extends Schema>(
  schema?: S,
  size: number = DEFAULT_WORLD_CAPACITY,
) {
  const baseID = nextID();

  const instances: Array<ComponentID | ID> = [];

  return function <T extends Entity | "*">(
    entityOrWildcard: T,
  ): T extends "*" ? Array<ComponentID | ID> : Component<S> {
    if (isWildcard(entityOrWildcard)) {
      return instances as T extends "*"
        ? Array<ComponentID | ID>
        : Component<S>;
    }

    const entity = entityOrWildcard as Entity;
    // @todo number limit ?
    const id = pair(entity, baseID);

    if (relations.has(id)) {
      const componentOrID = relations.get(id);
      //@todo: proper typing
      return componentOrID as T extends "*"
        ? Array<ComponentID | ID>
        : Component<S>;
    }
    let ret: Component | ID;

    if (schema) {
      throw new Error("Relations with schema not implemented");
      //@todo proper typing
      //@ts-expect-error
      ret = defineComponent(schema, size, id);
    } else {
      ret = id;
    }

    instances.push(id);
    relations.set(id, ret);
    return ret as unknown as T extends "*"
      ? Array<ComponentID | ID>
      : Component<S>;
    // return ret as T extends "*" ? Array<ComponentID | ID> : Component<S>;
  };
}
