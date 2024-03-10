import { Colors, rect, initWindow, startRenderLoop } from "aion-render/src";

initWindow();

startRenderLoop(() => {
  rect(0, 0, 100, 100)
    .fill(Colors["equator:200"])
    .stroke(Colors["acapulco:950"])
    .font("30px arial")
    .fillText("Hellooo", 150, 150, "white");
});
