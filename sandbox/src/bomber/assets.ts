export async function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    img.src = path;

    img.onerror = (e) => {
      console.warn(`Cannot load image at path ${path}\n${e}`);
      reject(e);
    };

    img.onload = () => resolve(img);
  });
}
