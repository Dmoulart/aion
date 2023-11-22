import {type Component, defineComponent} from "./component.js";
import type {Entity} from "./entity.js";
import {nextID} from "./id.js";

const isWildcard = (str: unknown): str is "*" => str === "*";

const relations = new Set();

export function defineRelation(size: number) {
  const baseID = nextID();

  const instances: Array<Component<any>["id"]> = [];

  return function <T extends Entity | "*">(
    entityOrWildcard: T
  ): T extends "*" ? Component[] : Component {
    if (isWildcard(entityOrWildcard)) {
      //@ts-expect-error
      return instances;
    }

    const entity = entityOrWildcard as Entity;
    // @todo number limit ?
    const id = baseID | (entity << 16);

    if (relations.has(id)) {
      //@ts-expect-error
      return id;
    }

    const component = defineComponent({}, id);
    instances.push(component.id);
    relations.add(id);
    //@ts-expect-error
    return component;
  };
}
