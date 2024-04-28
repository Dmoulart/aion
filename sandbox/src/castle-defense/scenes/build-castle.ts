import { on } from "aion-engine";
import {
  useECS,
  Transform,
  getMouseWorldPosition,
  usePhysics,
} from "aion-preset";
import { createWall } from "../wall";
import { Blueprint, placeBluePrint } from "../blueprints";
import { getWindowElement } from "aion-render";
import { createTurret } from "../turret";

let construct = createWall;
let newConstruct = false;

export default () => {
  const ecs = useECS();
  const { attach, query, remove } = ecs;
  const { RAPIER } = usePhysics();

  let blueprint = createWall();
  attach(Blueprint, blueprint);

  initUI();
  // const onCreatedBlueprint = onEnterQuery(
  //   query(Blueprint, RuntimeBody, RuntimeCollider),
  // );

  // onCreatedBlueprint((entity) => {
  //   const body = getRuntimeBody(entity)!;
  //   body.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, false);

  //   const collider = getRuntimeCollider(entity)!;
  //   collider.setSensor(true);
  // });

  return on("update", () => {
    if (newConstruct) {
      remove(blueprint);
      const { x, y } = getMouseWorldPosition();
      blueprint = construct(x, y);
      attach(Blueprint, blueprint);
      newConstruct = false;
    }

    query(Blueprint, Transform).each((entity) =>
      placeBluePrint(entity, construct),
    );
  });
};

export function initUI() {
  const container = document.createElement("div");

  container.id = "game-ui";
  getWindowElement().appendChild(container);

  container.innerHTML = ConstructionCards(
    ConstructionCard("Wall"),
    ConstructionCard("Turret"),
  );

  document.querySelectorAll(".construction-card").forEach((card) => {
    const value = card.getAttribute("value");

    card.addEventListener("click", () => {
      if (value === "Wall") {
        construct = createWall;
      } else if (value === "Turret") {
        construct = createTurret;
      } else {
        throw new Error("Unknown construction card");
      }
      newConstruct = true;
    });
  });

  return container;
}

export function ConstructionCards(...comps: Array<() => string>) {
  return `
    <div class="construction-cards">${comps.map((comp) => comp())}</div>
    <style>
      .construction-cards{
        position: absolute;
        top: 0;
        right: 0;
      }
    </style>
 `;
}

export function ConstructionCard(name: string) {
  return () => `
      <button class="construction-card" value="${name}"> ${name} </button>
      <style>
        .construction-card{
          height: 100px;
          width: 75px;
          padding: 8px;
          border-radius: 8px;
          display:flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: grey;
          cursor: pointer;
        }
      </style>
    `;
}
