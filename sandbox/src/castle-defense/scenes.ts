import { defineComponent, u16 } from "aion-ecs";
import { on } from "aion-engine";
import { getMouse, click } from "aion-input";
import {
  Fill,
  Rect,
  Stroke,
  Transform,
  Collider,
  Body,
  createCollider,
  createTransform,
  defineScene,
  exitCurrentScene,
  screenToWorldPosition,
  setPosition,
  useAion,
  createBody,
  usePhysics,
  RuntimeCharacterController,
  CharacterController,
  useECS,
  RuntimeCollider,
} from "aion-preset";
import { Colors } from "aion-render";
// import { getFloorBounds } from "../castle-defense";

export function createScenes() {
  const Resistance = defineComponent(u16);

  const { $ecs } = useAion();
  const { RAPIER } = usePhysics();

  // const onCollisionStart = onEnterQuery($ecs.query(Collision));
  // const onCollisionEnd = onExitQuery($ecs.query(Collision));

  const Wall = $ecs.prefab({
    Transform,
    Rect,
    Fill,
    Stroke,
    Collider,
    Body,
    Resistance,
  });

  const Treasure = $ecs.prefab({
    Transform,
    Rect,
    Fill,
    Stroke,
    Collider,
    Body,
  });

  const Enemy = $ecs.prefab({
    Transform,
    Rect,
    Fill,
    Stroke,
    Collider,
    Body,
    CharacterController,
  });

  defineScene("build-castle", () => {
    let wallNumber = 0;

    const player = Wall({
      Transform: createTransform(0, 0),
      Rect: {
        h: 500,
        w: 10,
      },
      Fill: "grey",
      Stroke: "white",
      Collider: createCollider({
        auto: 1,
      }),
      Resistance: 100,
    });

    return on("update", () => {
      const { x, y } = screenToWorldPosition(getMouse());

      setPosition(player, { x, y });

      if (click()) {
        Wall({
          Transform: createTransform(x, y),
          Rect: {
            h: Rect.h[player],
            w: Rect.w[player],
          },
          Fill: Colors["cornflower:600"],
          Stroke: "white",
          Collider: createCollider({
            auto: 1,
          }),
          Resistance: 10,
        });

        wallNumber++;
      }

      if (wallNumber === 4) {
        $ecs.remove(player);
        exitCurrentScene();
      }
    });
  });

  defineScene("place-treasure", () => {
    const player = Treasure({
      Transform: createTransform(0, 0),
      Rect: {
        h: 50,
        w: 50,
      },
      Fill: "yellow",
      Stroke: "white",
      Collider: createCollider({
        auto: 1,
      }),
      Body: createBody({
        type: RAPIER.RigidBodyType.Dynamic,
      }),
    });

    const cleanup = on("update", () => {
      const { x, y } = screenToWorldPosition(getMouse());

      setPosition(player, { x, y });

      if (click()) {
        Treasure({
          Transform: createTransform(x, y),
          Rect: {
            h: Rect.h[player],
            w: Rect.w[player],
          },
          Fill: "yellow",
          Stroke: "white",
          Collider: createCollider({
            auto: 1,
          }),
          Body: createBody({
            type: RAPIER.RigidBodyType.Dynamic,
          }),
        });

        $ecs.remove(player);
        exitCurrentScene();
      }
    });

    return cleanup;
  });

  defineScene("invasion", () => {
    const ENEMY_NUMBER = 10;
    // const { left, top } = getFloorBounds();

    for (let i = 0; i < ENEMY_NUMBER; i++) {
      Enemy({
        Transform: createTransform(i * 10, 0),
        Rect: {
          h: 50,
          w: 10,
        },
        Fill: "blue",
        Stroke: "white",
        Collider: createCollider({
          auto: 1,
        }),
        Body: createBody({
          type: 0,
        }),
        CharacterController: {
          offset: 1,
        },
      });
    }

    return on("update", () => {
      const { query } = useECS();

      query(RuntimeCollider, RuntimeCharacterController).each((entity) => {
        const controller = RuntimeCharacterController[entity]!;
        controller.computeColliderMovement(RuntimeCollider[entity]!, {
          x: 1,
          y: 0,
        });
      });
    });
  });
}
