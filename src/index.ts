import * as ROT from 'rot-js';
import * as classnames from 'classnames';

import { matrix } from './matrix';
import { width, height, dirs, keyMap } from './constants';

import 'normalize-css/normalize.css';
import './styles';

document.body.innerHTML = `
<div class="wrapper">
    <div class="map-container">
        <pre class="map"></pre>
        <pre class="fov"></pre>
    </div>
</div>
`;
const gameContainer = document.querySelector('.map');
const fovContainer = document.querySelector('.fov');

const entityMatrix: Array<Entities> = matrix(width, height, {
    char: '-',
    isNothing: true
});

interface Entity {
    x: number;
    y: number;
    char: string;
    isWall?: boolean;
    isPlayer?: boolean;
    isEnemy?: boolean;
    isNothing?: boolean;
    isVisible?: boolean;
    isDoor?: boolean;
    isOpened?: boolean;
    isBlocker?: boolean;
    isLightBlocker?: boolean;
    renderOrder: number;
}
type Entities = Array<Entity>;

let entities = createMap();

function createMap() {
    const entitiesList: Entities = [];
    const possibleMap = new ROT.Map.Digger(width, height);

    possibleMap.create((x, y, isWall) => {
        entitiesList.push({
            x,
            y,
            char: isWall ? ' ' : '.',
            isWall: Boolean(isWall),
            isLightBlocker: Boolean(isWall),
            isBlocker: Boolean(isWall),
            renderOrder: 0
        });
    });

    const rooms = possibleMap.getRooms();

    if (rooms.length < 2) {
        return createMap();
    }

    rooms.forEach((room, i) => {
        room.getDoors((x, y) => {
            if (entitiesList.find(e => e.x === x && e.y === y && e.isDoor)) {
                return;
            }
            entitiesList.push({
                x,
                y,
                char: 'x',
                isDoor: true,
                isOpened: false,
                isLightBlocker: true,
                isBlocker: true,
                renderOrder: 1
            });
        });

        if (i === 0) {
            const [x, y] = room.getCenter();
            entitiesList.push({
                x,
                y,
                isPlayer: true,
                char: '@',
                renderOrder: 9
            });
        }

        if (i === 1) {
            const [x, y] = room.getCenter();
            entitiesList.push({
                x,
                y,
                isEnemy: true,
                isBlocker: true,
                char: 'k',
                renderOrder: 9
            });
        }
    });

    return entitiesList;
}

document.addEventListener('keydown', event => {
    const code = event.which;

    if (!(code in keyMap)) {
        return;
    }

    const [diffX, diffY] = dirs[keyMap[code]];
    const player = entities.find(e => e.isPlayer);
    const enemy = entities.find(e => e.isEnemy);

    const newX = player.x + diffX;
    const newY = player.y + diffY;

    const entititesOnCoord = entities.filter(e => e.x === newX && e.y === newY);
    if (!entititesOnCoord.find(e => e.isWall)) {
        const door = entititesOnCoord.find(e => e.isDoor);
        const enemyOnCoord = entititesOnCoord.find(e => e.isEnemy);
        if (door && !door.isOpened) {
            door.isOpened = true;
            door.isLightBlocker = false;
            door.isBlocker = false;
            door.char = 'o';
        } else if (enemyOnCoord) {
            entities = entities.filter(e => e !== enemyOnCoord);
        } else {
            player.x = newX;
            player.y = newY;
        }
    }

    const isEnemySeePlayer = enemy && isPlayerInFov(enemy, entities);

    if (isEnemySeePlayer) {
        const astar = new ROT.Path.AStar(
            player.x,
            player.y,
            (x, y) => {
                const entititesOnCoord = entities.filter(
                    e => e.x === x && e.y === y
                );

                const isPassable =
                    entititesOnCoord.filter(e => e.isBlocker && !e.isEnemy)
                        .length === 0;

                return isPassable;
            },
            {
                topology: 8
            }
        );

        const paths = [];
        astar.compute(enemy.x, enemy.y, (x, y) => {
            paths.push([x, y]);
        });

        if (paths.length > 2) {
            const [x, y] = paths[1];
            enemy.x = x;
            enemy.y = y;
        }
    }

    renderMap(entities);
});

renderMap(entities);

function renderMap(entitiesList) {
    const fovMatrix = matrix(width, height);
    const player = entitiesList.find(e => e.isPlayer);

    entitiesList.forEach(entity => {
        entity.isVisible = false;
        return entity;
    });

    const fov = new ROT.FOV.PreciseShadowcasting((x, y) => {
        const entitiesAtCoords = entitiesList.filter(
            e => e.x === x && e.y === y
        );
        const isVisibleThrough =
            entitiesAtCoords.filter(e => e.isLightBlocker).length === 0;
        return isVisibleThrough;
    });

    fov.compute(player.x, player.y, 5, (x, y) => {
        const entitiesAtCoords = entitiesList.filter(
            e => e.x === x && e.y === y
        );
        entitiesAtCoords.forEach(e => {
            e.isVisible = true;
            e.isDiscovered = true;
        });
    });

    entitiesList
        .filter(e => e.isVisible || e.isDiscovered)
        .sort((a, b) => a.renderOrder - b.renderOrder)
        .forEach(entity => {
            const { x, y } = entity;
            entityMatrix[y][x] = entity;
            fovMatrix[y][x] = entity;
        });

    gameContainer.innerHTML = entityMatrix
        .map(
            rowEntitites =>
                `<div class="row">
                ${rowEntitites
                    .map(
                        ({ char, isNothing, isWall }) =>
                            `<div class="${classnames('cell', {
                                cell_wall: isWall,
                                cell_nothing: isNothing
                            })}">${char}</div>`
                    )
                    .join('')}
                </div>`
        )
        .join('');

    fovContainer.innerHTML = fovMatrix
        .map(
            rowEntitites =>
                `<div class="row">
                ${rowEntitites
                    .map(
                        entity =>
                            `<div class="${classnames('cell', {
                                'cell_fov-light': entity && entity.isVisible,
                                'cell_fov-shadow': entity && !entity.isVisible
                            })}"></div>`
                    )
                    .join('')}
                </div>`
        )
        .join('');
}

function isPlayerInFov(entity, entitiesList) {
    const fov = new ROT.FOV.PreciseShadowcasting((x, y) => {
        const entitiesAtCoords = entitiesList.filter(
            e => e.x === x && e.y === y
        );
        const isVisibleThrough =
            entitiesAtCoords.filter(e => e.isLightBlocker).length === 0;
        return isVisibleThrough;
    });

    let player;

    fov.compute(entity.x, entity.y, 5, (x, y) => {
        const entitiesAtCoords = entitiesList.filter(
            e => e.x === x && e.y === y
        );
        player = player || entitiesAtCoords.find(e => e.isPlayer);
    });

    return Boolean(player);
}
