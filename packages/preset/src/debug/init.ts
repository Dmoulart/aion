import { beforeStart, on } from "aion-engine";
import { useECS } from "../ecs.js";
import { Transform } from "../components.js";
import { fillText } from "aion-render";
import { getWorldPosition } from "../index.js";
export type InitDebugOptions = {
  debugEntityID?: boolean;
};
export function initDebug(options?: InitDebugOptions) {
  if (options?.debugEntityID) {
    beforeStart(() => {
      const ecs = useECS();
      on("draw", () => {
        ecs.query(Transform).each((ent) => {
          const pos = getWorldPosition(ent);
          fillText(ent.toString(), pos.x, pos.y, "red");
        });
      });
    });
  }
}
