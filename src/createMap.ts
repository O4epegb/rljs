import * as ROT from 'rot-js';

import { Map } from './map';

export type Tiles = Array<Tile>;
class Tile {
    type: TileType;
    isExplored = false;
    isBlocker: boolean;
    isLightBlocker: boolean;

    constructor(type: TileType, isBlocker = false, isLightBlocker?: boolean) {
        this.type = type;
        this.isBlocker = isBlocker;
        this.isLightBlocker =
            isLightBlocker === undefined ? isBlocker : isLightBlocker;
    }
}

export enum TileType {
    Wall = 1,
    Floor
}

export function createMap(
    width,
    height
): {
    rotMap: ROT.Map.Digger;
    mapTiles: Map<Tile>;
} {
    const possibleMap = new ROT.Map.Digger(width, height);
    const mapTiles = new Map<Tile>(width, height);

    possibleMap.create((x, y, isWall) => {
        mapTiles.set(
            x,
            y,
            isWall ? new Tile(TileType.Wall, true) : new Tile(TileType.Floor)
        );
    });

    const rooms = possibleMap.getRooms();

    if (rooms.length < 2) {
        return createMap(width, height);
    }

    return {
        rotMap: possibleMap,
        mapTiles
    };
}
