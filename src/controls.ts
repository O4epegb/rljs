import { Direction } from './constants';

function getKeyToDirection(): Record<string, Direction> {
    const up: Direction = [0, -1];
    const right: Direction = [1, 0];
    const down: Direction = [0, 1];
    const left: Direction = [-1, 0];

    return {
        ArrowUp: up,
        ArrowRight: right,
        ArrowDown: down,
        ArrowLeft: left,
        k: up,
        l: right,
        j: down,
        h: left,
        u: [1, -1],
        n: [1, 1],
        y: [-1, -1],
        b: [-1, 1],
        101: [0, 0]
    };
}

const keyToDir = getKeyToDirection();
const directionKeys = Object.keys(keyToDir);

class ControlsManagerClass {
    pressedKeys = {};
    activeModifiers = {
        shift: false,
        ctrl: false,
        alt: false,
        meta: false
    };
    mouseX = 0;
    mouseY = 0;

    MODIFIERS = Object.keys(this.activeModifiers);
    ALIAS = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        space: 32,
        pageup: 33,
        pagedown: 34,
        tab: 9
    };

    constructor() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        document.addEventListener('mousemove', this.onMouseMove);
    }

    destroy = () => {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('mousemove', this.onMouseMove);
    };

    onKeyDown = (event: KeyboardEvent) => {
        this.onKeyChange(event, true);
    };

    onKeyUp = (event: KeyboardEvent) => {
        this.onKeyChange(event, false);
    };

    onMouseMove = (event: MouseEvent) => {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    };

    onKeyChange = (event: KeyboardEvent, pressed: boolean) => {
        const keyCode = event.key;

        this.pressedKeys[keyCode] = pressed;
        this.activeModifiers.shift = event.shiftKey;
        this.activeModifiers.ctrl = event.ctrlKey;
        this.activeModifiers.alt = event.altKey;
        this.activeModifiers.meta = event.metaKey;
    };

    pressed = (keyDesc: string): boolean => {
        const keys = keyDesc.split('+');

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            let pressed = false;

            if (this.MODIFIERS.indexOf(key) !== -1) {
                pressed = this.activeModifiers[key];
            } else if (Object.keys(this.ALIAS).indexOf(key) !== -1) {
                // TODO ALIAS should be array for multiple keys
                pressed = this.pressedKeys[this.ALIAS[key]];
            } else {
                pressed = this.pressedKeys[key.toUpperCase().charCodeAt(0)];
            }

            if (!pressed) {
                return false;
            }
        }

        return true;
    };

    getDirection = (): Direction | null => {
        const pressedKey = directionKeys.find(key => this.pressedKeys[key]);

        return pressedKey ? keyToDir[pressedKey] : null;
    };
}

export const ControlsManager = new ControlsManagerClass();
