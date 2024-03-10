import { getMouseX, getMouseY, listenToInput } from "aion-input";
import * as r from "aion-render";

r.initWindow();

listenToInput();

r.loadImage("/dodo.png", "dodo").then(() => {
  r.startRenderLoop(() => {
    r.drawImage.resized(r.img("dodo"), getMouseX(), getMouseY(), 550, 550);
  });
});
