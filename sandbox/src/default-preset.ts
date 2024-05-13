import { defineEngine, on } from "aion-engine";
import {
  AionPreset,
  actor,
  fill,
  getMouseWorldPosition,
  rect,
  rotate,
  setPosition,
  stroke,
  transform,
} from "aion-preset";
import { setBackgroundColor } from "aion-render";

const engine = defineEngine([AionPreset({})], () => {
  const rectangle = actor(
    transform(10, 10),
    rect(),
    fill("red"),
    stroke("black")
    // actor(transform(10, 10), rect(), fill("blue"), stroke("black"))
  );

  setBackgroundColor("grey");

  on("draw", () => {
    // centerCameraOnEntity(rectangle);
    setPosition(rectangle, getMouseWorldPosition());
    rotate(rectangle, 0.01);
  });
});

const useGame = engine.use;

engine.run();
