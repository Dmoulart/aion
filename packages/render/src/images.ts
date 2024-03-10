import { assertDefined } from "aion-core";

const images: Record<string, HTMLImageElement> = {};

export function img(name: string): HTMLImageElement {
  const image = images[name];

  assertDefined(image);

  return image;
}

export async function loadImages(
  srcArray: string[]
): Promise<HTMLImageElement[]> {
  const images = [];
  // @todo use vite bundle analyze to pre-generate image links ? ?
  const result = await Promise.allSettled(
    srcArray.map((src) => loadImage(src))
  );

  for (const image of result) {
    if (image.status === "fulfilled") {
      images.push(image.value);
    } else {
      console.warn(image.reason);
    }
  }

  return images;
}

export async function loadImage(
  src: string,
  name = src
): Promise<HTMLImageElement> {
  let image = images[name];

  if (image) {
    return image;
  }

  image = await createImage(src);

  images[name] = image;

  return image;
}

export async function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    img.src = src;

    img.onerror = (e) => {
      console.warn(`Cannot load image at path ${src}\n${e}`);
      reject(e);
    };

    img.onload = () => resolve(img);
  });
}

let ghostCanvas: HTMLCanvasElement;
let ghostCtx: CanvasRenderingContext2D;
function drawImageToCanvas(image: HTMLImageElement) {
  if (!ghostCanvas) {
    ghostCanvas = document.createElement("canvas");
  }

  if (!ghostCtx) {
    ghostCtx = ghostCanvas.getContext("2d")!;
  }

  const canvas = ghostCanvas;
  canvas.width = image.width;
  canvas.height = image.height;
  ghostCtx.drawImage(image, 0, 0, image.width, image.height);
}

export function imgToBytes(image: HTMLImageElement): Uint8ClampedArray {
  drawImageToCanvas(image);
  return ghostCtx.getImageData(0, 0, image.width, image.height).data;
}
