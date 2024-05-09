import { Application, Graphics, type ApplicationOptions } from "pixi.js";

export type CreateScreenOptions = {
  parent?: string | HTMLElement | undefined;
  width?: string;
  height?: string;
  app?: Partial<ApplicationOptions>;
};

const DEFAULT_OPTIONS: CreateScreenOptions = {
  parent: "body",
  width: "100vw",
  height: "100vh",
};

let instance: ReturnType<typeof createScreen>;

export function initScreen(options?: CreateScreenOptions): void {
  instance = createScreen(options);
}

export async function createScreen(options?: CreateScreenOptions) {
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

  const container = document.createElement("div");
  container.classList.add("aion-screen");

  container.style.height = options.height ?? "100vh";
  container.style.width = options.width ?? "100vw";
  container.style.position = "relative";

  const app = new Application();
  // Wait for the Renderer to be available
  await app.init({ ...(options?.app ?? {}) });

  container.appendChild(app.canvas);

  return {
    app,
  };
}
