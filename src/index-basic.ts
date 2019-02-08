import { ControlsManager } from './controls';
import { Map } from './map';
import { createMap, TileType, Tile, recalculateWallBitmask } from './createMap';
import { mapWidth, mapHeight, TILES, Direction } from './constants';
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

// document.body.innerHTML = `
// <div class="wrapper">
//     <div id="canvas-container">
//         <canvas id="canvas"></canvas>
//     </div>
// </div>
// `;

export function makePlayerTurn(
    entities: Entities,
    mapTiles: Map<Tile>,
    player: Entity,
    [diffX, diffY]: Direction
) {
    if (!diffX && !diffY) {
        return;
    }

    const newX = Math.max(0, Math.min(mapWidth - 1, player.position.x + diffX));
    const newY = Math.max(
        0,
        Math.min(mapHeight - 1, player.position.y + diffY)
    );

    const tile = mapTiles.get(newX, newY);
    const entity = entities.find(
        ({ position }) => position && position.x === newX && position.y === newY
    );

    if (diffX !== 0) {
        player.position.isFacingLeft = diffX < 0;
    }

    if (entity) {
        if (entity.door && !entity.door.isOpened) {
            entity.door.isOpened = true;
            entity.appearance.spriteIndexRight = TILES.DOOR_OPENED;
            entity.physics.isBlocker = false;
            entity.physics.isLightBlocker = false;
        } else if (entity.isEnemy && !entity.health.isDead) {
            const power = player.fighter.power + player.equipment.powerBonus;
            entity.health.takeDamage(power);

            if (entity.health.isDead) {
                entity.appearance = null;
                entity.renderOrder = 9;
                entity.physics.isBlocker = false;
            }
        } else if (entity.physics && entity.physics.isBlocker) {
            //
        } else {
            player.position.move(newX, newY);
        }
    } else if (!tile.isBlocker) {
        player.position.move(newX, newY);
    }
}

enum GameState {
    PlayerTurn,
    EnemyTurn
}

const gameState: GameState = GameState.PlayerTurn;

let lastTurnTime = Date.now();

class Scene {
    entities: Entities;
    mapTiles: Map<Tile>;
    player: Entity;

    create() {
        const { mapTiles, rotMap } = createMap(mapWidth, mapHeight);
        const rooms = rotMap.getRooms();

        const player = new Entity({
            renderOrder: 10,
            char: '@',
            name: 'player',
            appearance: new AppearanceComponent(
                TILES.PLAYER.RIGHT,
                TILES.PLAYER.LEFT
            ),
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
                        char: '|||',
                        name: 'door',
                        physics: new PhysicsComponent(true, true),
                        door: new DoorComponent(),
                        appearance: new AppearanceComponent(TILES.DOOR_CLOSED)
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
                    char: 's',
                    name: 'spider',
                    appearance: new AppearanceComponent(
                        TILES.SPIDER.RIGHT,
                        TILES.SPIDER.LEFT
                    ),
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
        const test = [];

        for (let x = 0; x < mapWidth; x++) {
            for (let y = 0; y < mapHeight; y++) {
                const tile = mapTiles.get(x, y);

                if (!test[y]) {
                    test[y] = [];
                }

                test[y][x] = tile.type === TileType.Floor ? '.' : ' ';
            }
        }

        test[player.position.y][player.position.x] = '@';

        console.log(test.map(list => list.join('')).join('\n'));

        // const fovMatrix = new Map(mapWidth, mapHeight, false);
        // const entityMatrix = new Map<Entities>(mapWidth, mapHeight, []);

        // const fov = new ROT.FOV.PreciseShadowcasting((x, y) => {
        //     const tile = mapTiles.get(x, y);
        //     const entityIsBlocking = entitiesList
        //         .filter(
        //             ({ position, physics }) =>
        //                 physics &&
        //                 position &&
        //                 position.x === x &&
        //                 position.y === y
        //         )
        //         .some(e => e.physics.isLightBlocker);

        //     const isVisibleThrough =
        //         tile && !tile.isLightBlocker && !entityIsBlocking;
        //     return isVisibleThrough;
        // });

        // fov.compute(player.position.x, player.position.y, 5, (x, y) => {
        //     const tile = mapTiles.get(x, y);
        //     if (tile) {
        //         tile.isExplored = true;
        //     }

        //     fovMatrix.set(x, y, true);
        // });

        // entitiesList
        //     .filter(entity => {
        //         const { position } = entity;
        //         if (!position) {
        //             return false;
        //         }

        //         const { x, y } = position;
        //         const isVisible = fovMatrix.get(x, y);
        //         return isVisible;
        //     })
        //     .sort((a, b) => b.renderOrder - a.renderOrder)
        //     .forEach(entity => {
        //         const { x, y } = entity.position;
        //         const entitiesOnCoords = entityMatrix.get(x, y);
        //         entityMatrix.set(x, y, [...entitiesOnCoords, entity]);
        //     });

        // const cam = this.cameras.main;

        // const realX = Math.max(0, this.map.worldToTileX(cam.scrollX) - 3);
        // const realY = Math.max(0, this.map.worldToTileY(cam.scrollY) - 3);
        // const maxX = Math.min(mapWidth, realX + 6 + screenWidth);
        // const maxY = Math.min(mapHeight, realY + 6 + screenHeight);

        // this.fovGraphics.clear();

        // recalculateWallBitmask(mapTiles, realX, realY, maxX, maxY);

        // for (let x = realX; x < maxX; x++) {
        //     for (let y = realY; y < maxY; y++) {
        //         this.creaturesLayer.removeTileAt(x, y);

        //         const tile = mapTiles.get(x, y);
        //         const fov = fovMatrix.get(x, y);
        //         const entitiesOnCoords = entityMatrix.get(x, y);

        //         if (tile.type === TileType.Wall) {
        //             this.layer.putTileAt(tile.tileIndex, x, y);
        //         }

        //         if (!fov) {
        //             const fovXY = this.map.tileToWorldXY(x, y);
        //             this.fovGraphics.fillStyle(0x000000, 0.5);
        //             this.fovGraphics.fillRect(fovXY.x, fovXY.y, 16 * 3, 16 * 3);
        //         }

        //         this.layer.getTileAt(x, y).setAlpha(tile.isExplored ? 1 : 0);

        //         if (entitiesOnCoords) {
        //             const tiles = entitiesOnCoords
        //                 .map(entity => {
        //                     if (entity.appearance) {
        //                         return entity.appearance.getSpriteIndex(
        //                             entity.position.isFacingLeft
        //                         );
        //                     }
        //                 })
        //                 .filter(x => !isNil(x));

        //             if (tiles.length) {
        //                 // Does not actually work, because layer cannot render multiple tiles at same position
        //                 this.creaturesLayer.putTilesAt(tiles, x, y);
        //             }
        //             // entitiesOnCoords.forEach(entity => {
        //             //     if (entity.appearance) {
        //             //         this.creaturesLayer.putTileAt(
        //             //             entity.appearance.getSpriteIndex(
        //             //                 entity.position.isFacingLeft
        //             //             ),
        //             //             x,
        //             //             y
        //             //         );
        //             //     }
        //             // });
        //         }
        //     }
        // }
    }

    update(time, delta) {
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

const scene = new Scene();

scene.create();

const updater = () => {
    requestAnimationFrame(() => {
        scene.update(1, 1);

        updater();
    });
};

requestAnimationFrame(updater);

console.log(scene);
