import { Colors, initWindow, rect } from "../../packages/render/dist/index";

initWindow();

rect(10, 10, 100, 100)
  .rect(120, 120, 100, 100)
  .fill(Colors["acapulco:100"])
  .stroke(Colors["shamrock:950"]);
