import { createECS, onEnterQuery } from "aion-ecs";
import { defineEngine, defineLoop, emit, on } from "aion-engine";
import { getMouseX, getMouseY, initInputListener } from "aion-input";
import {
  Fill,
  Rect,
  Transform,
  getRectHeight,
  getRectWidth,
  getWorldPosition,
  setPosition,
  setupRenderer,
} from "aion-preset";
import { Graphics, createScreen } from "aion-screen";

const renderer = await createScreen();

const engine = defineEngine(
  () => {},
  () => {
    initInputListener({
      el: ".aion-screen",
    });
    setupRenderer(renderer);

    defineLoop(() => {
      emit("update");
      emit("draw");
    });

    const ecs = createECS();

    const onRectCreated = onEnterQuery(ecs.query(Transform, Rect));

    const graphicsList: InstanceType<typeof Graphics>[] = [];

    onRectCreated((ent) => {
      const graphics = new Graphics();
      const { x, y } = getWorldPosition(ent);
      graphics.rect(x, y, getRectWidth(ent), getRectHeight(ent));
      graphics.fill(0xde3249);
      renderer.app.stage.addChild(graphics);
      graphicsList[ent] = graphics;
    });

    const entity = ecs.create();

    setPosition(entity, { x: 0, y: 0 });

    Rect.h[entity] = 100;
    Rect.w[entity] = 100;

    Fill[entity] = "0xde3249";

    ecs.attach(Transform, entity);
    ecs.attach(Fill, entity);
    ecs.attach(Rect, entity);

    on("update", () => {
      setPosition(entity, { x: getMouseX(), y: getMouseY() });

      ecs.query(Transform, Rect).each((ent) => {
        const { x, y } = getWorldPosition(ent);
        graphicsList[ent].x = x;
        graphicsList[ent].y = y;
      });
    });
  }
);

engine.run();
