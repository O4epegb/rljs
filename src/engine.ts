import * as ROT from 'rot-js';
import * as classnames from 'classnames';

import { Map } from './map';
import {
    screenWidth,
    screenHeight,
    dirs,
    keyMap,
    mapWidth,
    mapHeight
} from './constants';
import { createMap, TileType } from './createMap';
import {
    Entities,
    Entity,
    PhysicsComponent,
    DoorInteractionComponent,
    PositionComponent,
    FighterComponent,
    HealthComponent
} from './entity';

export function startGame(mapContainer) {
    const { mapTiles, rotMap } = createMap(mapWidth, mapHeight);
    const rooms = rotMap.getRooms();

    const player = new Entity({
        renderOrder: 10,
        char: '@',
        name: 'player',
        position: new PositionComponent(0, 0),
        fighter: new FighterComponent(),
        health: new HealthComponent(10)
    });
    const entities: Entities = [player];

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
                    interaction: new DoorInteractionComponent()
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
                char: 'k',
                name: 'kobold',
                position: new PositionComponent(x, y),
                physics: new PhysicsComponent(true, false),
                fighter: new FighterComponent(),
                health: new HealthComponent(2)
            });

            entities.push(enemy);
        }
    });

    document.addEventListener('keydown', event => {
        const code = event.which;

        if (!(code in keyMap)) {
            return;
        }

        const [diffX, diffY] = dirs[keyMap[code]];

        if (diffX || diffY) {
            const newX = Math.max(
                0,
                Math.min(mapWidth - 1, player.position.x + diffX)
            );
            const newY = Math.max(
                0,
                Math.min(mapHeight - 1, player.position.y + diffY)
            );

            const tile = mapTiles.get(newX, newY);
            const entity = entities.find(
                ({ position }) =>
                    position && position.x === newX && position.y === newY
            );

            if (entity) {
                if (entity.interaction) {
                    entity.interaction.act(entity, player);
                } else if (entity.isEnemy && !entity.health.isDead) {
                    player.fighter.basicAttack(entity);

                    if (entity.health.isDead) {
                        entity.char = '%';
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

        renderMap(entities);
    });

    renderMap(entities);

    function renderMap(entitiesList: Entities) {
        const fovMatrix = new Map(mapWidth, mapHeight, false);
        const entityMatrix = new Map<Entities>(mapWidth, mapHeight, []);

        const fov = new ROT.FOV.PreciseShadowcasting((x, y) => {
            const tile = mapTiles.get(x, y);
            const entityIsBlocking = entities
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
                const { position } = entity;
                if (!position) {
                    return false;
                }

                const { x, y } = position;
                const isVisible = fovMatrix.get(x, y);
                return isVisible;
            })
            .sort((a, b) => a.renderOrder - b.renderOrder)
            .forEach(entity => {
                const { x, y } = entity.position;
                const entitiesOnCoords = entityMatrix.get(x, y);
                entityMatrix.set(x, y, [...entitiesOnCoords, entity]);
            });

        // Make sure the x-axis doesn't go to the left of the left bound
        let topLeftX = Math.max(0, player.position.x - screenWidth / 2);
        // Make sure we still have enough space to fit an entire game screen
        topLeftX = Math.min(topLeftX, mapWidth - screenWidth);
        // Make sure the y-axis doesn't above the top bound
        let topLeftY = Math.max(0, player.position.y - screenHeight / 2);
        // Make sure we still have enough space to fit an entire game screen
        topLeftY = Math.min(topLeftY, mapHeight - screenHeight);

        const map = new Map(screenWidth, screenHeight);

        for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
            for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
                const realX = x - topLeftX;
                const realY = y - topLeftY;

                const entitiesOnCoords = entityMatrix.get(x, y);
                const tile = mapTiles.get(x, y);
                const fov = fovMatrix.get(x, y);

                const cells = [];

                if (tile.isExplored) {
                    cells.push({
                        classes: {
                            cell_wall:
                                tile.isExplored && tile.type === TileType.Wall,
                            cell_floor:
                                tile.isExplored && tile.type === TileType.Floor
                        },
                        text: tile.isExplored ? '' : '.'
                    });
                }

                if (entitiesOnCoords) {
                    cells.push(
                        ...entitiesOnCoords.map(entity => {
                            return {
                                text: entity ? entity.char : ''
                            };
                        })
                    );
                }

                cells.push({
                    classes: {
                        'cell_fov-light': fov,
                        'cell_fov-shadow': !fov
                    }
                });

                map.set(realX, realY, cells);
            }
        }

        mapContainer.innerHTML = map
            .map(row => {
                const rowContent = row.map(cells => {
                    const cellContents = cells.map(({ classes, text }) => {
                        return `<div class="${classnames(
                            'cell',
                            classes
                        )}">${text || ''}</div>`;
                    });
                    return `<div class="cell-container">${cellContents.join(
                        ''
                    )}</div>`;
                });
                return `<div class="row">${rowContent.join('')}</div>`;
            })
            .join('');
    }
}
