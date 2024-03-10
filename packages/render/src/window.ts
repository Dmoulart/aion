export type CreateWindowOptions = {
  parent?: string | HTMLElement | undefined;
  width?: string;
  height?: string;
};

const DEFAULT_OPTIONS: CreateWindowOptions = {
  parent: "body",
  width: "100vw",
  height: "100vh",
};

let instance: ReturnType<typeof createWindow>;

export function initWindow(options?: CreateWindowOptions): void {
  if (instance) {
    throw new Error("Window already instanciated");
  }

  instance = createWindow(options);

  instance.ctx.beginPath();
}

export function createWindow(options?: CreateWindowOptions) {
  options = { ...DEFAULT_OPTIONS, ...(options ?? {}) };

  let parent: HTMLElement;

  if (typeof options.parent === "string") {
    let el = document.querySelector<HTMLElement>(options.parent);

    if (!el) {
      console.error(
        "Cannot find window parent element - will fallback to body"
      );
    } else {
      parent = el;
    }
  } else if (options.parent instanceof HTMLElement) {
    parent = options.parent;
  }

  parent ??= document.body;

  const windowEl = document.createElement("div");
  windowEl.classList.add("window");

  windowEl.style.height = options.height ?? "100vh";
  windowEl.style.width = options.height ?? "100vh";

  const canvas = document.createElement("canvas");

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Cannot get canvas context");
  }

  windowEl.appendChild(canvas);

  parent.appendChild(windowEl);

  canvas.width = windowEl.clientWidth;
  canvas.height = windowEl.clientHeight;

  return {
    canvas,
    ctx,
    rect,
    circle,
    fill,
    stroke,
    scale,
    rotate,
    moveTo,
    lineTo,
    beginPath,
    closePath,
    clear,
    moveToCenter,
    begin,
  };
}

export function stroke(color?: string) {
  if (color) {
    instance.ctx.strokeStyle = color;
  }

  instance.ctx.stroke();

  return instance;
}

export function fill(color?: string, fillRule?: CanvasFillRule | undefined) {
  if (color) {
    instance.ctx.fillStyle = color;
  }

  instance.ctx.fill(fillRule);

  return instance;
}

export function rect(x: number, y: number, width: number, height: number) {
  instance.ctx.rect(x, y, width, height);

  return instance;
}

export function circle(x: number, y: number, r: number) {
  instance.ctx.beginPath();
  instance.ctx.arc(x, y, r, 0, 2 * Math.PI, false);

  return instance;
}

export function rotate(angle: number) {
  instance.ctx.rotate(angle);

  return instance;
}

export function scale(x: number, y: number = x) {
  instance.ctx.scale(x, y);

  return instance;
}

export function moveTo(x: number, y: number = x) {
  instance.ctx.moveTo(x, y);

  return instance;
}

export function lineTo(x: number, y: number = x) {
  instance.ctx.lineTo(x, y);

  return instance;
}

export function beginPath() {
  instance.ctx.beginPath();

  return instance;
}

export function closePath() {
  instance.ctx.closePath();

  return instance;
}

export function clear() {
  instance.ctx.clearRect(0, 0, instance.canvas.width, instance.canvas.height);

  return instance;
}

export function moveToCenter() {
  const { x, y } = getCenter();
  instance.ctx.moveTo(x, y);
  return instance;
}

export function createRenderLoop(cb: () => void) {
  return function renderLoop() {
    begin();
    cb();
    requestAnimationFrame(renderLoop);
  };
}

export function startRenderLoop(cb: () => void) {
  const startRender = createRenderLoop(cb);
  startRender();
}

export function getCenter() {
  return {
    x: instance.ctx.canvas.width / 2,
    y: instance.ctx.canvas.height / 2,
  };
}

export function begin() {
  return closePath().clear().beginPath();
}

// export function strokeText(
//   text: string,
//   x: number,
//   y: number,
//   maxWidth?: number | undefined,
//   color?: string
// ) {
//   if (color) {
//     instance.ctx.strokeStyle = color;
//   }

//   instance.ctx.strokeText(text, x, y, maxWidth);

//   return rect;
// }
