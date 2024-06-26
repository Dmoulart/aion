import { onExitQuery } from "aion-ecs";
import { useECS } from "../ecs.js";
import { Children, removeChildren, traverseDescendants } from "./parenting.js";
import { beforeStart, once } from "aion-engine";

export function initHierarchy() {
  beforeStart(() => {
    const { remove, query } = useECS();

    const onAncestorRemoved = onExitQuery(query(Children));

    onAncestorRemoved((parent) => {
      traverseDescendants(parent, (descendant) => {
        remove(descendant);
      });

      removeChildren(parent);
    });
  });
}
