import { beforeStart, on } from "aion-engine";
import { useECS } from "../ecs.js";
import { fillText, font, strokeStyle, strokeText } from "aion-render";
import { Parent, Transform, getWorldPosition } from "../index.js";
import { defineComponent, not } from "aion-ecs";

// export const Debug = defineComponent(Array<string>);

export type InitDebugOptions = {
  debugEntityID?: boolean;
};

export function initDebug(options?: InitDebugOptions) {
  if (options?.debugEntityID) {
    beforeStart(() => {
      const ecs = useECS();

      on("render", () => {
        ecs.query(Transform, not(Parent)).each((ent) => {
          const pos = getWorldPosition(ent);
          font("bold 18px Helvetica");
          fillText(ent.toString(), pos.x, pos.y, "yellow");
          strokeText(ent.toString(), pos.x, pos.y, "black");
        });
      });
    });
  }
}
