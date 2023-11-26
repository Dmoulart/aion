import {
  Character,
  SPRITES,
  TileDesc,
  blockAsset,
  bombi,
  createTileEntity,
  tileAsset,
} from "./shared.js";

const {prefab, query} = bombi();

const createPlayer = prefab(Character);

initMap();

const ws = new WebSocket('')

const player = createPlayer({
  Position: {
    x: 0,
    y: 0,
  },
  Sprite: SPRITES["./src/bomber/assets/bomberman-b0.png"],
  Velocity: {
    x: 0,
    y: 0,
  },
  Animation: {
    start: 0,
  },
});

const walkable: Array<boolean[]> = [];
function initMap() {
  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 30; y++) {
      createTile(x, y);
    }
  }
}

function createTile(x: number, y: number) {
  const isWalkable = Math.random() > 0.1;
  const t = createTileEntity({
    Position: {
      x,
      y,
    },
    Sprite: SPRITES[isWalkable ? tileAsset : blockAsset],
    TileDesc: {
      blocking: isWalkable ? Number(false) : Number(true),
    },
  });
  const isBlocking = Boolean(TileDesc.blocking[t]);

  walkable[x] ??= [];
  walkable[x][y] = !isBlocking;
}
