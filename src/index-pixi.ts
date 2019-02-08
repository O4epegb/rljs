import * as PIXI from 'pixi.js';

import { ControlsManager } from './controls';
import { makePlayerTurn } from './engine';
import { Map } from './map';
import { createMap, TileType, Tile, recalculateWallBitmask } from './createMap';
import {
    screenWidth,
    screenHeight,
    mapWidth,
    mapHeight,
    Direction,
    tileSize,
    scaleFactor,
    TILES
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

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const app = new PIXI.Application(16 * 3 * 20, 16 * 3 * 20, {
    backgroundColor: 0x1099bb,
    forceCanvas: true
});
document.body.appendChild(app.view);

app.stage.scale.x = 3;
app.stage.scale.y = 3;

app.ticker.add(delta => {
    //
});

const textures = [
    {
        url: 'entities.png',
        name: 'entities'
    },
    {
        url: 'dungeon.png',
        name: 'dungeon'
    }
];

PIXI.loader.add(textures).load(() => {
    // const frame = new PIXI.Rectangle(0, 0, 16, 16);
    // const frame2 = new PIXI.Rectangle(96, 0, 16, 16);

    // const texture = new PIXI.Texture(
    //     PIXI.loader.resources.entities.texture.baseTexture,
    //     frame
    // );

    // const texture2 = new PIXI.Texture(
    //     PIXI.loader.resources.entities.texture.baseTexture,
    //     frame2
    // );

    // const sprite2 = new PIXI.Sprite(texture2);
    // sprite2.x = 16;

    // app.stage.addChild(sprite2);
    // app.stage.addChild(new PIXI.Sprite(texture));

    scene.create();
});

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

        for (let x = 0; x < mapWidth; x++) {
            for (let y = 0; y < mapHeight; y++) {
                const tile = mapTiles.get(x, y);

                const frame2 = new PIXI.Rectangle(96, 0, 16, 16);

                const texture2 = new PIXI.Texture(
                    PIXI.loader.resources.entities.texture.baseTexture,
                    frame2
                );

                const sprite2 = new PIXI.Sprite(texture2);
                sprite2.x = x * 16;
                sprite2.y = y * 16;

                app.stage.addChild(sprite2);
            }
        }

        // this.render(this.entities, this.mapTiles, this.player);
    }

    // render(entitiesList: Entities, mapTiles: Map<Tile>, player: Entity) {
    //     const fovMatrix = new Map(mapWidth, mapHeight, false);
    //     const entityMatrix = new Map<Entities>(mapWidth, mapHeight, []);

    //     const fov = new ROT.FOV.PreciseShadowcasting((x, y) => {
    //         const tile = mapTiles.get(x, y);
    //         const entityIsBlocking = entitiesList
    //             .filter(
    //                 ({ position, physics }) =>
    //                     physics &&
    //                     position &&
    //                     position.x === x &&
    //                     position.y === y
    //             )
    //             .some(e => e.physics.isLightBlocker);

    //         const isVisibleThrough =
    //             tile && !tile.isLightBlocker && !entityIsBlocking;
    //         return isVisibleThrough;
    //     });

    //     fov.compute(player.position.x, player.position.y, 5, (x, y) => {
    //         const tile = mapTiles.get(x, y);
    //         if (tile) {
    //             tile.isExplored = true;
    //         }

    //         fovMatrix.set(x, y, true);
    //     });

    //     entitiesList
    //         .filter(entity => {
    //             const { position } = entity;
    //             if (!position) {
    //                 return false;
    //             }

    //             const { x, y } = position;
    //             const isVisible = fovMatrix.get(x, y);
    //             return isVisible;
    //         })
    //         .sort((a, b) => b.renderOrder - a.renderOrder)
    //         .forEach(entity => {
    //             const { x, y } = entity.position;
    //             const entitiesOnCoords = entityMatrix.get(x, y);
    //             entityMatrix.set(x, y, [...entitiesOnCoords, entity]);
    //         });

    //     const cam = this.cameras.main;

    //     const realX = Math.max(0, this.map.worldToTileX(cam.scrollX) - 3);
    //     const realY = Math.max(0, this.map.worldToTileY(cam.scrollY) - 3);
    //     const maxX = Math.min(mapWidth, realX + 6 + screenWidth);
    //     const maxY = Math.min(mapHeight, realY + 6 + screenHeight);

    //     this.fovGraphics.clear();

    //     recalculateWallBitmask(mapTiles, realX, realY, maxX, maxY);

    //     for (let x = realX; x < maxX; x++) {
    //         for (let y = realY; y < maxY; y++) {
    //             this.creaturesLayer.removeTileAt(x, y);

    //             const tile = mapTiles.get(x, y);
    //             const fov = fovMatrix.get(x, y);
    //             const entitiesOnCoords = entityMatrix.get(x, y);

    //             if (tile.type === TileType.Wall) {
    //                 this.layer.putTileAt(tile.tileIndex, x, y);
    //             }

    //             if (!fov) {
    //                 const fovXY = this.map.tileToWorldXY(x, y);
    //                 this.fovGraphics.fillStyle(0x000000, 0.5);
    //                 this.fovGraphics.fillRect(fovXY.x, fovXY.y, 16 * 3, 16 * 3);
    //             }

    //             this.layer.getTileAt(x, y).setAlpha(tile.isExplored ? 1 : 0);

    //             if (entitiesOnCoords) {
    //                 const tiles = entitiesOnCoords
    //                     .map(entity => {
    //                         if (entity.appearance) {
    //                             return entity.appearance.getSpriteIndex(
    //                                 entity.position.isFacingLeft
    //                             );
    //                         }
    //                     })
    //                     .filter(x => !isNil(x));

    //                 if (tiles.length) {
    //                     // Does not actually work, because layer cannot render multiple tiles at same position
    //                     this.creaturesLayer.putTilesAt(tiles, x, y);
    //                 }
    //                 // entitiesOnCoords.forEach(entity => {
    //                 //     if (entity.appearance) {
    //                 //         this.creaturesLayer.putTileAt(
    //                 //             entity.appearance.getSpriteIndex(
    //                 //                 entity.position.isFacingLeft
    //                 //             ),
    //                 //             x,
    //                 //             y
    //                 //         );
    //                 //     }
    //                 // });
    //             }
    //         }
    //     }
    // }

    update(time, delta) {
        const now = Date.now();
        const turnDelta = now - lastTurnTime;

        if (turnDelta < 200) {
            return;
        }

        const direction = ControlsManager.getDirection();

        if (gameState === GameState.PlayerTurn && direction) {
            lastTurnTime = now;
            // makePlayerTurn(
            //     this.entities,
            //     this.mapTiles,
            //     this.player,
            //     direction
            // );
            // this.render(this.entities, this.mapTiles, this.player);
        } else if (gameState === GameState.EnemyTurn) {
            //
        } else {
            //
        }
    }
}

const scene = new Scene();

console.log(scene);
