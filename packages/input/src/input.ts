import { Vec, vec, type Vector } from "aion-core";
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
        `Cannot find input root element ${options.el} - will fallback to body`,
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

  const onClick = (cb: (ev: MouseEvent) => void) =>
    root.addEventListener("click", cb);

  const onMouseUp = (cb: (ev: MouseEvent) => void) =>
    root.addEventListener("mouseup", cb);

  const onceMouseUp = (cb: (ev: MouseEvent) => void) =>
    root.addEventListener("mouseup", cb, { once: true });

  let _isClicking = false;

  root.addEventListener("mousedown", () => (_isClicking = true));
  root.addEventListener("mouseup", () => (_isClicking = false));

  // onceMouseUp()

  return {
    root,
    get isClicking() {
      return _isClicking;
    },
    set isClicking(value) {
      _isClicking = value;
    },
    pressedKeys,
    mouse,
    onClick,
    click: isClicking,
    onMouseUp,
    onceMouseUp,
  };
}

export function axis(axis: "horizontal" | "vertical"): number {
  if (axis === "horizontal") {
    return Number(anyKey("ArrowRight", "d")) - Number(anyKey("ArrowLeft", "q"));
  }

  if (axis === "vertical") {
    return Number(anyKey("ArrowDown", "s")) - Number(anyKey("ArrowUp", "z"));
  }

  throw new Error("Unknown axis");
}

export function getMouse() {
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

export function anyKey(...keys: KeyboardEventKey[]) {
  return keys.some((key) => listener.pressedKeys.has(key));
}

// export function onKeyPressed(fn: ()){

// }

export function isClicking() {
  return listener.isClicking;
}

export function onMouseUp(cb: () => void) {
  return listener.onMouseUp(cb);
}

export function onceMouseUp(cb: () => void) {
  return listener.onceMouseUp(cb);
}

export function direction() {
  return new Vec(axis("horizontal"), axis("vertical"));
}
