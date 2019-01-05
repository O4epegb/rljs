import * as ROT from 'rot-js';
import { sample } from 'lodash';

import { Map } from './map';
import { getWallTilesByBitmask } from './bitmask';
import Digger from 'rot-js/lib/map/digger';

const floorTileIndexes = [23, 24, 36, 49];

export type Tiles = Array<Tile>;
export class Tile {
    type: TileType;
    isExplored = false;
    isBlocker: boolean;
    isLightBlocker: boolean;
    tileIndex = 0;
    tileName = '';
    bitmask = 0;

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
    rotMap: Digger;
    mapTiles: Map<Tile>;
} {
    const possibleMap = new ROT.Map.Digger(width, height);
    const mapTiles = new Map<Tile>(width, height);

    possibleMap.create((x, y, isWall) => {
        const tile = isWall
            ? new Tile(TileType.Wall, true)
            : new Tile(TileType.Floor);
        tile.tileIndex = isWall ? 0 : sample(floorTileIndexes);

        mapTiles.set(x, y, tile);
    });

    const rooms = possibleMap.getRooms();

    if (rooms.length < 2) {
        return createMap(width, height);
    }

    recalculateWallBitmask(mapTiles);

    return {
        rotMap: possibleMap,
        mapTiles
    };
}

function checkFloorTile(tile: Tile) {
    return tile && tile.isExplored && tile.type === TileType.Floor;
}

export function recalculateWallBitmask(
    mapTiles: Map<Tile>,
    x1 = 0,
    y1 = 0,
    x2 = 0,
    y2 = 0
) {
    const { numCols, numRows } = mapTiles;

    const maxX = x2 || numCols;
    const maxY = y2 || numRows;

    for (let x = x1; x < maxX; x++) {
        for (let y = y1; y < maxY; y++) {
            const tile = mapTiles.get(x, y);

            if (tile.type !== TileType.Wall) {
                continue;
            }

            let bitmask = 0;

            const nTile = mapTiles.get(x, y - 1);
            const eTile = mapTiles.get(x + 1, y);
            const sTile = mapTiles.get(x, y + 1);
            const wTile = mapTiles.get(x - 1, y);

            const nwTile = mapTiles.get(x - 1, y - 1);
            const neTile = mapTiles.get(x + 1, y - 1);
            const swTile = mapTiles.get(x - 1, y + 1);
            const seTile = mapTiles.get(x + 1, y + 1);

            if (checkFloorTile(nTile)) {
                bitmask = bitmask + 1;
            }

            if (checkFloorTile(eTile)) {
                bitmask = bitmask + 2;
            }

            if (checkFloorTile(sTile)) {
                bitmask = bitmask + 4;
            }

            if (checkFloorTile(wTile)) {
                bitmask = bitmask + 8;
            }

            if (checkFloorTile(nwTile)) {
                bitmask = bitmask + 16;
            }

            if (checkFloorTile(neTile)) {
                bitmask = bitmask + 32;
            }

            if (checkFloorTile(swTile)) {
                bitmask = bitmask + 64;
            }

            if (checkFloorTile(seTile)) {
                bitmask = bitmask + 128;
            }

            if (tile.bitmask !== bitmask) {
                const { tileName, variants } = getWallTilesByBitmask(bitmask);

                if (tile.tileName !== tileName) {
                    tile.tileName = tileName;
                    tile.tileIndex = sample(variants);
                }
            }

            tile.bitmask = bitmask;
        }
    }
}
