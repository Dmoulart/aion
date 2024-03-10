import type { KeyboardEventKey } from "./keys.js";

let listener: ReturnType<typeof createInputListener>;

type InputListenerOptions = {
  el: string | HTMLElement;
};

const DEFAULT_OPTIONS: InputListenerOptions = {
  el: ".aion-canvas",
};

export function initInputListener(options?: InputListenerOptions) {
  listener = createInputListener(options);

  return listener;
}

export function createInputListener(options?: InputListenerOptions) {
  options = { ...DEFAULT_OPTIONS, ...(options ?? {}) };

  let root: HTMLElement;

  if (typeof options.el === "string") {
    let el = document.querySelector<HTMLElement>(options.el);

    if (!el) {
      console.error(
        `Cannot find input root element ${options.el} - will fallback to body`
      );
    } else {
      root = el;
    }
  } else if (options.el instanceof HTMLElement) {
    root = options.el;
  }

  root ??= document.body;

  const pressedKeys = new Set<KeyboardEventKey>();
  const mouse = { x: 0, y: 0 };

  document.addEventListener("keydown", (ev) => {
    pressedKeys.add(ev.key as KeyboardEventKey);
  });

  document.addEventListener("keyup", (ev) => {
    pressedKeys.delete(ev.key as KeyboardEventKey);
  });

  root.addEventListener("mousemove", (ev) => {
    mouse.x = ev.offsetX;
    mouse.y = ev.offsetY;
  });

  return {
    pressedKeys,
    mouse,
  };
}

export function axis(axis: "horizontal" | "vertical"): number {
  if (axis === "horizontal") {
    return Number(key("ArrowRight")) - Number(key("ArrowLeft"));
  }

  if (axis === "vertical") {
    return Number(key("ArrowDown")) - Number(key("ArrowUp"));
  }

  throw new Error("Unknown axis");
}

export function getMousePosition() {
  return listener.mouse;
}

export function getMouseX() {
  return listener.mouse.x;
}

export function getMouseY() {
  return listener.mouse.y;
}

export function key(key: KeyboardEventKey) {
  return listener.pressedKeys.has(key);
}

export function direction() {
  return {
    x: Number(key("d")) - Number(key("q")),
    y: Number(key("s")) - Number(key("z")),
  };
}
