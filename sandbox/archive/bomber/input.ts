export function createInputListener(el: HTMLElement = document.body) {
  const keys = new Set<string>();
  const mouse = {x: 0, y: 0};

  document.addEventListener("keydown", (ev) => {
    keys.add(ev.key as string);
  });

  document.addEventListener("keyup", (ev) => {
    keys.delete(ev.key as string);
  });

  el.addEventListener("mousemove", (ev) => {
    const {clientX, clientY} = ev;

    mouse.x = clientX;
    mouse.y = clientY;
  });

  const key = (key: string) => keys.has(key);

  return {
    key,
    get mouse() {
      return mouse;
    },
    direction() {
      return {
        x: Number(key("d")) - Number(key("q")),
        y: Number(key("s")) - Number(key("z")),
      };
    },
    axis(axis: "horizontal" | "vertical"): number {
      if (axis === "horizontal") {
        return Number(key("ArrowRight")) - Number(key("ArrowLeft"));
      }
      if (axis === "vertical") {
        return Number(key("ArrowDown")) - Number(key("ArrowUp"));
      }

      throw new Error("Unknown axis");
    },
  };
}
type InputListener = ReturnType<typeof createInputListener>;

export let useInput = (): InputListener => {
  const input = createInputListener();

  useInput = () => input;
  return input;
};
