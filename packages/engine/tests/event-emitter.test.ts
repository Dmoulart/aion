import { expect, it, describe } from "vitest";
import { createEventEmitter } from "../src/event";
describe("Event emitter", () => {
  it(() => {
    const { on, off, once, emit } = createEventEmitter();

    let counter = 0;

    const increment = () => counter++;

    on("update", increment);

    emit("update");
    expect(counter === 1);

    off("update", increment);

    emit("update");
    expect(counter === 1);

    once("update", increment);

    emit("update");
    expect(counter === 2);

    emit("update");
    expect(counter === 2);
  });
});
