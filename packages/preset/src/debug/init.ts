import { beforeStart, on } from "aion-engine";
import { useECS } from "../ecs.js";
import { fillText, font, strokeStyle, strokeText } from "aion-render";
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
          font("bold 48px Helvetica");
          fillText(ent.toString(), pos.x, pos.y, "white");
          strokeText(ent.toString(), pos.x, pos.y, "black");
        });
      });
    });
  }
}
