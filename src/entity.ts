import { reduce } from 'lodash';
// import * as ROT from 'rot-js';

interface EntityParams {
    name: string;
    renderOrder?: number;
    isEnemy?: boolean;
    position?: PositionComponent;
    ai?: AIComponent;
    physics?: PhysicsComponent;
    fighter?: FighterComponent;
    health?: HealthComponent;
    inventory?: InventoryComponent;
    equipment?: EquipmentComponent;
    appearance?: AppearanceComponent;
    door?: DoorComponent;
}

export class AppearanceComponent {
    char: string;
    spriteIndexRight: number;
    spriteIndexLeft: number;

    constructor({
        char = '?',
        spriteIndexRight,
        spriteIndexLeft
    }: {
        char: string;
        spriteIndexRight: number;
        spriteIndexLeft?: number;
    }) {
        this.char = char;
        this.spriteIndexRight = spriteIndexRight;
        this.spriteIndexLeft =
            spriteIndexLeft === undefined ? spriteIndexRight : spriteIndexLeft;
    }

    getSpriteIndex(isFacingLeft: boolean) {
        return isFacingLeft ? this.spriteIndexLeft : this.spriteIndexRight;
    }
}

export class PositionComponent {
    x: number;
    y: number;
    isFacingLeft = false;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    move(x, y) {
        // this.isFacingLeft = x === this.x ? this.isFacingLeft : x < this.x;
        this.x = x;
        this.y = y;
    }
}

export class AIComponent {
    act(entities: Entities) {
        //
    }
}

export class HealthComponent {
    totalHealth: number;
    currentHealth: number;
    isDead = false;

    constructor(totalHealth: number, currentHealth?: number) {
        this.totalHealth = totalHealth;
        this.currentHealth =
            currentHealth === undefined ? totalHealth : currentHealth;
    }

    takeDamage(damage) {
        this.currentHealth = this.currentHealth - damage;

        if (this.currentHealth <= 0) {
            this.isDead = true;
        }
    }
}

export class FighterComponent {
    power: number;

    constructor(power = 0) {
        this.power = power;
    }

    basicAttack(target: Entity) {
        target.health.takeDamage(this.power);
    }
}

export class EquipmentComponent {
    slots = {
        leftHand: null,
        rightHand: null
    };

    constructor(items) {
        this.slots = {
            ...this.slots,
            ...items
        };
    }

    unequip(slotName) {
        const item = this.slots[slotName];
        this.slots[slotName] = null;
        return item;
    }

    equip(item) {
        this.slots[item.slotName] = item;
    }

    get powerBonus() {
        return reduce(
            this.slots,
            (acc, item, key) => {
                if (item) {
                    return acc + (item.powerBonus || 0);
                }
                return acc;
            },
            0
        );
    }
}

export class InventoryComponent {
    items: Array<any>;

    constructor() {
        //
    }

    add(item: any) {
        this.items.push(item);
    }
}

export class PhysicsComponent {
    isBlocker = false;
    isLightBlocker = false;

    constructor(isBlocker = false, isLightBlocker?: boolean) {
        this.isBlocker = isBlocker;
        this.isLightBlocker =
            isLightBlocker === undefined ? isBlocker : isLightBlocker;
    }
}

export class DoorComponent {
    isOpened = false;

    constructor(isOpened = false) {
        this.isOpened = isOpened;
    }
}

export type Entities = Array<Entity>;
export class Entity {
    name;
    renderOrder = 0;
    isEnemy: boolean;

    position?: PositionComponent;
    physics?: PhysicsComponent;
    ai?: AIComponent;
    fighter?: FighterComponent;
    health?: HealthComponent;
    inventory?: InventoryComponent;
    equipment?: EquipmentComponent;
    appearance?: AppearanceComponent;
    door?: DoorComponent;

    constructor(params: EntityParams) {
        const {
            name,
            renderOrder = 1,
            isEnemy = false,
            physics,
            position,
            ai,
            fighter,
            health,
            inventory,
            equipment,
            appearance,
            door
        } = params;

        this.name = name;
        this.renderOrder = renderOrder;
        this.isEnemy = isEnemy;
        this.physics = physics;
        this.position = position;
        this.ai = ai;
        this.fighter = fighter;
        this.health = health;
        this.inventory = inventory;
        this.equipment = equipment;
        this.appearance = appearance;
        this.door = door;
    }

    moveTowards(x, y, map, entities) {
        // const astar = new ROT.Path.AStar(
        //     player.x,
        //     player.y,
        //     (x, y) =>
        //         getEntitiesOnCoord(entities, x, y).filter(
        //             e => e.isBlocker && !e.isEnemy
        //         ).length === 0,
        //     {
        //         topology: 8
        //     }
        // );
        // const paths = [];
        // astar.compute(enemy.x, enemy.y, (x, y) => {
        //     paths.push([x, y]);
        // });
        // if (paths.length > 2) {
        //     const [x, y] = paths[1];
        //     enemy.x = x;
        //     enemy.y = y;
        // }
    }
}
