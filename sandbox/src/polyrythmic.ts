import {
  createTag,
  defineComponent,
  f32,
  i32,
  onEnterQuery,
  u32,
} from "aion-ecs";
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
  Rect,
  Stroke,
  getX,
  getY,
  rotateAroundPoint,
  Collider,
  getWorldPosition,
  setZoom,
  createCollider,
  Body,
  Collision,
  createBody,
  usePhysics,
  defineCollisionGroup,
  findPhysicalEntityInsideBoundingBox,
  forEachPhysicalEntityInsideBoundingBox,
  getRectWidth,
  getRectHeight,
} from "aion-preset";
import {
  Colors,
  setBackgroundColor,
  windowCenter,
  windowCenterX,
  windowCenterY,
} from "aion-render";

const engine = defineEngine(
  () =>
    aionPreset({
      renderDebug: true,
    }),
  () => {
    const { createCircle } = useAion();
    const { prefab, query } = useECS();
    const { RAPIER } = usePhysics();

    const Ring = defineComponent({
      tonality: i32,
    });

    const Vel = defineComponent(f32);

    const IsDetector = createTag();
    const Detector = prefab({
      Transform,
      Rect,
      Collider,
      IsDetector,
      Fill,
      Body,
    });

    const RingingCircle = prefab({
      Transform,
      Circle,
      Fill,
      Stroke,
      Ring,
      Vel,
      Collider,
      Body,
    });

    setBackgroundColor(Colors["mine-shaft:900"]);

    const center = createCircle({
      Circle: {
        r: 10,
      },
      Fill: Colors["rhino:50"],
      Stroke: "black",
      Transform: createTransform(0, 0),
    });

    const detector = Detector({
      Transform: createTransform(windowCenterX(), windowCenterY() - 500),
      Rect: {
        h: 100,
        w: 10,
      },
      Fill: "blue",
      Collider: createCollider({
        auto: 1,
        // isSensor: 1,
        collisionGroups: defineCollisionGroup()
          .isPartOfGroups(0b01)
          .canInteractWith(0b01)
          .get(),
      }),
      Body: createBody({
        type: RAPIER.RigidBodyType.Fixed,
      }),
      IsDetector,
    });

    setWorldPosition(center, windowCenter());
    setCameraPosition(windowCenter());
    setZoom(0.5);

    defineLoop(() => {
      emit("update");

      emit("draw");
    });

    const onZoneTrigger = onEnterQuery(query(Collision));

    onZoneTrigger((entity) => {
      console.log("hello");
      var audio = new Audio("audio_file.mp3");
      audio.play();
    });

    for (let i = 1; i < 10; i++) {
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
        Vel: i / 100,
        Collider: createCollider({
          auto: 1,
          collisionGroups: defineCollisionGroup()
            .isPartOfGroups(0b01)
            .canInteractWith(0b01)
            .get(),
        }),
        Body: createBody({
          type: RAPIER.RigidBodyType.KinematicPositionBased,
        }),
      });
    }

    on("update", () => {
      query(Transform, Ring).each((e) => {
        const position = getWorldPosition(center);
        rotateAroundPoint(e, position, Vel[e]);

        // forEachPhysicalEntityInsideBoundingBox(
        //   getWorldPosition(detector),
        //   getRectWidth(detector),
        //   getRectHeight(detector),
        //   (entity) => {
        //     if (entity !== detector) {
        //       console.log(entity);
        //     }
        //   },
        // );
      });
    });
  },
);

engine.run();
