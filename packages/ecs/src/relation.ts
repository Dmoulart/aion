import {type Component, defineComponent} from "./component.js";
import {lo, type Entity, pair, type ID} from "./entity.js";
import {nextID} from "./id.js";
import type {Schema} from "./schemas.js";
import {DEFAULT_WORLD_CAPACITY} from "./world.js";

const isWildcard = (str: unknown): str is "*" => str === "*";

const relations = new Set();

export function defineRelation<S extends Schema>(
  schema?: S,
  size: number = DEFAULT_WORLD_CAPACITY
) {
  const baseID = nextID();

  const instances: Array<Component["id"] | ID> = [];

  return function <T extends Entity | "*">(
    entityOrWildcard: T
  ): T extends "*" ? Component<S>[] : Component<S> {
    if (isWildcard(entityOrWildcard)) {
      //@ts-expect-error
      return instances;
    }

    const entity = entityOrWildcard as Entity;
    // @todo number limit ?
    const id = pair(entity, baseID);

    if (relations.has(id)) {
      //@ts-expect-error
      return id;
    }
    let ret: Component | ID;

    if (schema) {
      ret = defineComponent({}, size, id);
    } else {
      ret = id;
    }

    instances.push(id);
    relations.add(id);
    //@ts-expect-error
    return ret;
  };
}
