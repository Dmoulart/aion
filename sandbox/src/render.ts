import {
  getMousePosition,
  getMouseX,
  getMouseY,
  key,
  listenToInput,
} from "aion-input";
import { img, loadImage } from "aion-render";
import { Colors, rect, initWindow, startRenderLoop } from "aion-render/src";

initWindow();

listenToInput();

loadImage(
  "https://t1.gstatic.com/licensed-image?q=tbn:ANd9GcTflWoa5uHKQ4sP07UBLXaal8F-e8FzQt3nvbnJYKnDUm1G9eQeaWkCbFEWi5b6t87E",
  "dodo"
).then(() => {
  startRenderLoop(() => {
    rect(getMouseX(), getMouseY(), 100, 100)
      .fill(Colors["equator:200"])
      .stroke(Colors["acapulco:950"])
      .font("30px arial")
      .fillText("Hellooo", 150, 150, "white")
      .drawImage.resized(img("dodo"), 100, 100, 50, 50);
  });
});
