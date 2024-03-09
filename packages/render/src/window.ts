export type CreateWindowOptions = {
  parent?: string | HTMLElement | undefined;
  width?: string;
  height?: string;
};

export type Window = {
  ctx: CanvasRenderingContext2D;
  rect: typeof rect;
  circle: typeof circle;
  fill: typeof fill;
  stroke: typeof fill;
  rotate: typeof rotate;
  scale: typeof scale;
};

const DEFAULT_OPTIONS: CreateWindowOptions = {
  parent: "body",
  width: "100vw",
  height: "100vh",
};

let instance: Window;

export function initWindow(options?: CreateWindowOptions): void {
  if (instance) {
    throw new Error("Window already instanciated");
  }

  instance = createWindow(options);
}

export function createWindow(options?: CreateWindowOptions): Window {
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
    ctx,
    rect,
    circle,
    fill,
    stroke,
    scale,
    rotate,
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

rect.stroke = stroke;

rect.fill = fill;

export function circle(x: number, y: number, r: number) {
  instance.ctx.beginPath();
  instance.ctx.arc(95, 50, r, 0, 2 * Math.PI);

  return instance;
}

circle.stroke = stroke;
circle.fill = fill;

export function rotate(angle: number) {
  instance.ctx.rotate(angle);

  return instance;
}

export function scale(x: number, y: number = x) {
  instance.ctx.scale(x, y);

  return instance;
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
