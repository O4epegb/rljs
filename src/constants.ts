const browserScreenWidth =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

const browserScreenHeight =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

export const mapWidth = 80;
export const mapHeight = 80;

export const spriteTileSize = 16;
export const tileSize = 20;
export const scaleFactor = 3;

const screenPadding = 2;
const screenWidthPixels = browserScreenWidth - screenPadding;
const screenHeightPixels = browserScreenHeight - screenPadding;
export const useDynamicScreen = true;
export const screenWidth = Math.min(
    useDynamicScreen ? Math.floor(screenWidthPixels / tileSize) : 20,
    mapWidth
);
export const screenHeight = Math.min(
    useDynamicScreen ? Math.floor(screenHeightPixels / tileSize) : 20,
    mapHeight
);

export const TILES = {
    PLAYER: {
        RIGHT: 0,
        LEFT: 1
    },
    SPIDER: {
        RIGHT: 2,
        LEFT: 3
    },
    SKELETON: {
        RIGHT: 4,
        LEFT: 5
    },
    DOOR_OPENED: 6,
    DOOR_CLOSED: 7
};

type DirectionNumber = -1 | 0 | 1;
export type Direction = [DirectionNumber, DirectionNumber];
