import * as i from "aion-input";
import * as r from "aion-render";

r.initWindow();

i.initInputListener();

r.loadImage("/dodo.png", "dodo").then(() => {
  r.startRenderLoop(() => {
    if (i.key("a")) {
      r.rotate(0.1);
    }

    r.drawImage.resized(r.img("dodo"), i.getMouseX(), i.getMouseY(), 550, 550);

    r.circle(i.getMouseX(), i.getMouseY(), 100).fill(r.Colors["acapulco:800"]);
  });
});
