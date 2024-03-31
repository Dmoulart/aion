export type CreateWindowOptions = {
  parent?: string | HTMLElement | undefined;
  width?: string;
  height?: string;
};

export type Window = ReturnType<typeof createWindow>;

const DEFAULT_OPTIONS: CreateWindowOptions = {
  parent: "body",
  width: "100vw",
  height: "100vh",
};

let instance: Window;

export function initWindow(options?: CreateWindowOptions): void {
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
        "Cannot find window parent element - will fallback to body",
      );
    } else {
      parent = el;
    }
  } else if (options.parent instanceof HTMLElement) {
    parent = options.parent;
  }

  parent ??= document.body;

  const windowEl = document.createElement("div");
  windowEl.classList.add("aion-window");

  windowEl.style.height = options.height ?? "100vh";
  windowEl.style.width = options.width ?? "100vw";

  const canvas = document.createElement("canvas");
  canvas.classList.add("aion-canvas");

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Cannot get canvas context");
  }

  windowEl.appendChild(canvas);

  parent.appendChild(windowEl);

  canvas.width = parent.clientWidth;
  canvas.height = parent.clientHeight;

  return {
    canvas,
    ctx,
    rect,
    arc,
    ellipse,
    circle,
    fill,
    fillStyle,
    fillText,
    fillRect,
    stroke,
    strokeStyle,
    strokeText,
    strokeRect,
    drawImage,
    transform,
    translate,
    clip,
    font,
    scale,
    rotate,
    moveTo,
    lineTo,
    beginPath,
    beginFrame,
    closePath,
    endFrame,
    clear,
    moveToCenter,
    begin: beginDraw,
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

export function transform(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
) {
  instance.ctx.transform(a, b, c, d, e, f);

  return instance;
}

export function translate(x: number, y: number) {
  instance.ctx.translate(x, y);

  return instance;
}

export function clip(fillRule?: CanvasFillRule | undefined) {
  instance.ctx.clip(fillRule);

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

export function arc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  counterclockwise?: boolean | undefined,
) {
  instance.ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);

  return instance;
}

export function ellipse(
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  rotation: number,
  startAngle: number,
  endAngle: number,
  counterclockwise?: boolean | undefined,
) {
  instance.ctx.ellipse(
    x,
    y,
    radiusX,
    radiusY,
    rotation,
    startAngle,
    endAngle,
    counterclockwise,
  );

  return instance;
}

export function strokeStyle(style: string | CanvasGradient | CanvasPattern) {
  instance.ctx.strokeStyle = style;

  return instance;
}

export function fillStyle(style: string | CanvasGradient | CanvasPattern) {
  instance.ctx.fillStyle = style;

  return instance;
}

export function strokeRect(x: number, y: number, w: number, h: number) {
  instance.ctx.strokeRect(x, y, w, h);

  return instance;
}

export function fillRect(x: number, y: number, w: number, h: number) {
  instance.ctx.fillRect(x, y, w, h);

  return instance;
}

export function strokeText(
  text: string,
  x: number,
  y: number,
  color?: string,
  maxWidth?: number | undefined,
) {
  if (color) {
    instance.ctx.strokeStyle = color;
  }

  instance.ctx.strokeText(text, x, y, maxWidth);

  return instance;
}

export function fillText(
  text: string,
  x: number,
  y: number,
  color?: string,
  maxWidth?: number | undefined,
) {
  if (color) {
    instance.ctx.fillStyle = color;
  }

  instance.ctx.fillText(text, x, y, maxWidth);

  return instance;
}

export function font(font: string) {
  instance.ctx.font = font;

  return instance;
}

export function drawImage(image: CanvasImageSource, dx: number, dy: number) {
  instance.ctx.drawImage(image, dx, dy);

  return instance;
}

drawImage.resized = drawImageResized;
export function drawImageResized(
  image: CanvasImageSource,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  instance.ctx.drawImage(image, dx, dy, dw, dh);

  return instance;
}

export function moveToCenter() {
  const { x, y } = windowCenter();
  instance.ctx.moveTo(x, y);
  return instance;
}

export function getContext2D() {
  return instance.ctx;
}

export function createRenderLoop(cb: () => void) {
  return function renderLoop() {
    beginDraw();
    cb();
    requestAnimationFrame(renderLoop);
  };
}

export function startRenderLoop(cb: () => void) {
  const startRender = createRenderLoop(cb);
  startRender();
}

export function windowCenter() {
  return {
    x: instance.ctx.canvas.width / 2,
    y: instance.ctx.canvas.height / 2,
  };
}

export function windowBottomLeft() {
  return {
    x: 0,
    y: instance.ctx.canvas.height,
  };
}

export function windowBottomRight() {
  return {
    x: instance.ctx.canvas.width,
    y: instance.ctx.canvas.height,
  };
}

export function windowTopRight() {
  return {
    x: instance.ctx.canvas.width,
    y: 0,
  };
}

export function windowTopLeft() {
  return {
    x: 0,
    y: 0,
  };
}

export function windowCenterX() {
  return instance.ctx.canvas.width / 2;
}

export function windowCenterY() {
  return instance.ctx.canvas.height / 2;
}

export function windowWidth() {
  return instance.ctx.canvas.width;
}

export function windowHeight() {
  return instance.ctx.canvas.height;
}

export function setBackgroundColor(color: string) {
  instance.canvas.style.backgroundColor = color;
}

export function beginDraw() {
  return closePath().clear().beginPath();
}

export function beginFrame() {
  return clear().beginPath();
}

export function endFrame() {
  return closePath();
}
