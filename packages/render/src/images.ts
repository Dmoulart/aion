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

// export async function loadAllImages() {
//   // use vite bundle analyze to pre-generate image links ? ?
//   //   return await import(path).catch((e) =>
//   //     console.warn(`Cannot load image at path ${path}\n${e}`)
//   //   );
//   await Promise.all(
//     register.map((path) => loadImage(path).then((img) => (images[path] = img)))
//   );
// }

// export function getAsset(index: number): AssetPath {
//   const asset = register[index] as AssetPath;
//   assertIsDefined(asset);
//   return asset;
// }

// export function getAssetID(filepath: AssetPath): AssetID {
//   const assetID = register.indexOf(filepath); // efficiency ?
//   assertIsDefined(assetID);
//   return assetID;
// }
