import {type Component, isSingleTypeSchema} from "./component.js";
import type {Entity} from "./entity.js";

export function defineEncoder(...components: Component) {
  for (const component of components) {
    if (isSingleTypeSchema(component)) {
    } else {
    }
  }
  function encode(ents: Entity[], dest: ArrayBuffer) {
      const view = new DataView(dest);
      
      
  }

  function decode(dest: ArrayBuffer) {}

  return [encode, decode] as const;
}
