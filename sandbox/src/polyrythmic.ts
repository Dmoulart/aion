import { defineComponent, i32 } from "aion-ecs";
import { defineEngine, defineLoop, emit, on } from "aion-engine";
import {
  Transform,
  aionPreset,
  createTransform,
  setCameraPosition,
  setWorldPosition,
  useAion,
  useECS,
  Circle,
  Fill,
  Stroke,
  getX,
  getY,
} from "aion-preset";
import { Colors, setBackgroundColor, windowCenter } from "aion-render";

const engine = defineEngine(
  () =>
    aionPreset({
      renderDebug: true,
    }),
  () => {
    const { createCircle } = useAion();
    const { prefab, query } = useECS();

    const Ring = defineComponent({
      tonality: i32,
    });

    const RingingCircle = prefab({
      Transform,
      Circle,
      Fill,
      Stroke,
      Ring,
    });

    setBackgroundColor("black");

    const center = createCircle({
      Circle: {
        r: 10,
      },
      Fill: Colors["rhino:50"],
      Stroke: "black",
      Transform: createTransform(0, 0),
    });

    setWorldPosition(center, windowCenter());
    setCameraPosition(windowCenter());

    defineLoop(() => {
      emit("update");

      emit("draw");
    });

    for (let i = 0; i < 10; i++) {
      const r = 20;
      const margin = 10;
      const x = getX(center);
      const y = getY(center) - i * (r * 4) + margin;

      RingingCircle({
        Transform: createTransform(x, y),
        Circle: {
          r,
        },
        Fill: "white",
        Stroke: "black",
        Ring: {
          tonality: 100 + i * 1000,
        },
      });
    }
    on("update", () => {
      query(Transform, Ring).each((e) => {});
    });
  },
);

engine.run();
