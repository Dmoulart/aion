import { beforeStart, on } from "aion-engine";
import { useECS } from "../ecs.js";
import { fillText } from "aion-render";
import { Transform, getWorldPosition } from "../index.js";
export type InitDebugOptions = {
  debugEntityID?: boolean;
};
export function initDebug(options?: InitDebugOptions) {
  if (options?.debugEntityID) {
    beforeStart(() => {
      const ecs = useECS();

      on("render", () => {
        ecs.query(Transform).each((ent) => {
          const pos = getWorldPosition(ent);
          fillText(ent.toString(), pos.x, pos.y, "red");
        });
      });
    });
  }
}
