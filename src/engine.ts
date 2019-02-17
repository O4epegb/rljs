import * as ROT from 'rot-js';

import { ControlsManager } from './controls';
import { Map } from './map';
import { createMap, TileType, Tile, recalculateWallBitmask } from './createMap';
import { renderView, RenderViewRows } from './renderer';
import { makePlayerTurn } from './turn';
import {
    mapWidth,
    mapHeight,
    TILES,
    screenWidth,
    screenHeight
} from './constants';
import {
    Entities,
    Entity,
    PhysicsComponent,
    DoorComponent,
    PositionComponent,
    FighterComponent,
    HealthComponent,
    EquipmentComponent,
    AppearanceComponent
} from './entity';

enum GameState {
    PlayerTurn,
    EnemyTurn
}

const gameState: GameState = GameState.PlayerTurn;

let lastTurnTime = Date.now();

class Game {
    entities: Entities;
    mapTiles: Map<Tile>;
    player: Entity;

    create() {
        const { mapTiles, rotMap } = createMap(mapWidth, mapHeight);
        const rooms = rotMap.getRooms();

        const player = new Entity({
            renderOrder: 10,
            name: 'player',
            appearance: new AppearanceComponent({
                char: '@',
                spriteIndexRight: TILES.PLAYER.RIGHT,
                spriteIndexLeft: TILES.PLAYER.LEFT
            }),
            position: new PositionComponent(0, 0),
            fighter: new FighterComponent(1),
            health: new HealthComponent(10),
            equipment: new EquipmentComponent({
                rightHand: {
                    powerBonus: 2
                }
            })
        });
        const entities: Entities = [player];

        this.entities = entities;
        this.player = player;
        this.mapTiles = mapTiles;

        rooms.forEach((room, i) => {
            room.getDoors((x, y) => {
                if (
                    entities.find(
                        ({ position }) =>
                            position && position.x === x && position.y === y
                    )
                ) {
                    return;
                }

                entities.push(
                    new Entity({
                        position: new PositionComponent(x, y),
                        name: 'door',
                        physics: new PhysicsComponent(true, true),
                        door: new DoorComponent(),
                        appearance: new AppearanceComponent({
                            char: '#',
                            spriteIndexRight: TILES.DOOR_CLOSED
                        })
                    })
                );
            });

            const [x, y] = room.getCenter();

            if (i === 0) {
                player.position.move(x, y);
            } else {
                const enemy = new Entity({
                    isEnemy: true,
                    renderOrder: 10,
                    name: 'spider',
                    appearance: new AppearanceComponent({
                        char: 's',
                        spriteIndexRight: TILES.SPIDER.RIGHT,
                        spriteIndexLeft: TILES.SPIDER.LEFT
                    }),
                    position: new PositionComponent(x, y),
                    physics: new PhysicsComponent(true, false),
                    fighter: new FighterComponent(),
                    health: new HealthComponent(10)
                });

                entities.push(enemy);
            }
        });

        this.render(this.entities, this.mapTiles, this.player);
    }

    render(entitiesList: Entities, mapTiles: Map<Tile>, player: Entity) {
        const map: RenderViewRows = [];
        const fovMatrix = new Map(mapWidth, mapHeight, false);
        const entityMatrix = new Map<Entities>(mapWidth, mapHeight, []);

        const fov = new ROT.FOV.PreciseShadowcasting((x, y) => {
            const tile = mapTiles.get(x, y);
            const entityIsBlocking = entitiesList
                .filter(
                    ({ position, physics }) =>
                        physics &&
                        position &&
                        position.x === x &&
                        position.y === y
                )
                .some(e => e.physics.isLightBlocker);

            const isVisibleThrough =
                tile && !tile.isLightBlocker && !entityIsBlocking;

            return isVisibleThrough;
        });

        fov.compute(player.position.x, player.position.y, 5, (x, y) => {
            const tile = mapTiles.get(x, y);
            if (tile) {
                tile.isExplored = true;
            }

            fovMatrix.set(x, y, true);
        });

        entitiesList
            .filter(entity => {
                const { position, appearance } = entity;
                if (!position || !appearance) {
                    return false;
                }

                const { x, y } = position;
                const isVisible = fovMatrix.get(x, y);
                return isVisible;
            })
            .sort((a, b) => b.renderOrder - a.renderOrder)
            .forEach(entity => {
                const { x, y } = entity.position;
                const entitiesOnCoords = entityMatrix.get(x, y);
                entityMatrix.set(x, y, [...entitiesOnCoords, entity]);
            });

        for (let x = 0; x < mapWidth; x++) {
            for (let y = 0; y < mapHeight; y++) {
                const tile = mapTiles.get(x, y);

                if (!map[y]) {
                    map[y] = [];
                }

                if (!map[y][x]) {
                    map[y][x] = [];
                }

                const isInFov = fovMatrix.get(x, y);

                const isVisible = isInFov || tile.isExplored;
                const tileCharForView =
                    isVisible && tile.type === TileType.Floor ? '.' : ' ';

                map[y][x].push({
                    char: tileCharForView,
                    isHidden: !isVisible,
                    isInFov,
                    original: tile
                });

                const entitiesOnTile = entityMatrix.get(x, y);

                if (entitiesOnTile.length) {
                    map[y][x].push(
                        ...entitiesOnTile.map(e => {
                            return {
                                char: e.appearance.char,
                                original: e
                            };
                        })
                    );
                }
            }
        }

        map[player.position.y][player.position.x].push({
            char: '@',
            original: player
        });

        // Make sure the x-axis doesn't go to the left of the left bound
        let topLeftX = Math.max(
            0,
            Math.floor(player.position.x - screenWidth / 2)
        );
        // Make sure we still have enough space to fit an entire game screen
        topLeftX = Math.min(topLeftX, mapWidth - screenWidth);
        // Make sure the y-axis doesn't above the top bound
        let topLeftY = Math.max(
            0,
            Math.floor(player.position.y - screenHeight / 2)
        );
        // Make sure we still have enough space to fit an entire game screen
        topLeftY = Math.min(topLeftY, mapHeight - screenHeight);

        recalculateWallBitmask(
            mapTiles,
            topLeftX,
            topLeftY,
            Math.min(mapWidth, topLeftX + screenWidth),
            Math.min(mapHeight, topLeftY + screenHeight)
        );

        renderView(
            map
                .slice(topLeftY, topLeftY + screenHeight)
                .map(row => row.slice(topLeftX, topLeftX + screenWidth))
        );
    }

    update() {
        const now = Date.now();
        const turnDelta = now - lastTurnTime;

        if (turnDelta < 200) {
            return;
        }

        const direction = ControlsManager.getDirection();

        if (gameState === GameState.PlayerTurn && direction) {
            lastTurnTime = now;
            makePlayerTurn(
                this.entities,
                this.mapTiles,
                this.player,
                direction
            );
            this.render(this.entities, this.mapTiles, this.player);
        } else if (gameState === GameState.EnemyTurn) {
            //
        } else {
            //
        }
    }
}

const game = new Game();

game.create();

const gameLoop = () => {
    requestAnimationFrame(() => {
        game.update();

        gameLoop();
    });
};

requestAnimationFrame(gameLoop);
