const browserScreenWidth =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

const browserScreenHeight =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

export const mapWidth = 40;
export const mapHeight = 40;

export const tileSize = 16;
export const scaleFactor = 3;

// const screenWidthPixels =
//     browserScreenWidth - (browserScreenWidth % (tileSize * scaleFactor));
// const screenHeightPixels =
//     browserScreenHeight - (browserScreenHeight % (tileSize * scaleFactor));
// export const screenWidth = screenWidthPixels / tileSize;
// export const screenHeight = screenHeightPixels / tileSize;

const screenWidthPixels = browserScreenWidth;
const screenHeightPixels = browserScreenHeight;
export const screenWidth = Math.ceil(screenWidthPixels / tileSize);
export const screenHeight = Math.ceil(screenHeightPixels / tileSize);

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

export const keyToDir: Record<string, Direction> = {
    104: [0, -1],
    105: [1, -1],
    102: [1, 0],
    99: [1, 1],
    98: [0, 1],
    97: [-1, 1],
    100: [-1, 0],
    103: [-1, -1],
    101: [0, 0]
};

export const directionKeys = Object.keys(keyToDir);
