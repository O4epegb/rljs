import { Map } from './map';
import { Tile } from './createMap';
import { mapWidth, mapHeight, TILES, Direction } from './constants';
import { Entities, Entity } from './entity';

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
