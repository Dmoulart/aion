import { aion, defineComponent, i32 } from "aion-ecs";
import { defineEngine, defineLoop, emit, on, aionPreset } from "aion-engine";
import { axis, getMouseX, getMouseY, initInputListener } from "aion-input";
import { initWindow, rect } from "aion-render";
import { clear, circle, Colors } from "aion-render";

const engine = defineEngine(() => {
  initWindow();
  initInputListener();

  const { prefab } = aion();

  const Position = defineComponent({
    x: i32,
    y: i32,
  });

  const Velocity = defineComponent({
    x: i32,
    y: i32,
  });

  const createPlayerB = prefab({ Position, Velocity });

  const player = createPlayer();

  defineLoop(() => {
    emit("update");

    clear();
    emit("draw");
  });

  on("draw", () => {
    circle(getMouseX(), getMouseY(), 100).fill(Colors["acapulco:500"]);

    rect(Position.x[player], Position.y[player], 100, 100).stroke("black");
  });

  on("update", () => {
    Velocity.x[player] = axis("horizontal") * 4;
    Velocity.y[player] = axis("vertical") * 4;

    Position.x[player] += Velocity.x[player];
    Position.y[player] += Velocity.y[player];
  });

  return { $player: player, ...aionPreset() };
});

engine.run();
