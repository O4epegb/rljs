import { directionKeys, keyToDir, Direction } from './constants';

class ControlsManagerClass {
    pressedKeys = {};
    modifiers = {
        shift: false,
        ctrl: false,
        alt: false,
        meta: false
    };
    mouseX = 0;
    mouseY = 0;

    MODIFIERS = ['shift', 'ctrl', 'alt', 'meta'];
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

    onKeyDown = event => {
        this.onKeyChange(event, true);
    };

    onKeyUp = event => {
        this.onKeyChange(event, false);
    };

    destroy = () => {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('mousemove', this.onMouseMove);
    };

    onMouseMove = event => {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    };

    onKeyChange = (event, pressed) => {
        const keyCode = event.keyCode;
        this.pressedKeys[keyCode] = pressed;
        this.modifiers.shift = event.shiftKey;
        this.modifiers.ctrl = event.ctrlKey;
        this.modifiers.alt = event.altKey;
        this.modifiers.meta = event.metaKey;
    };

    pressed = (keyDesc: string): boolean => {
        const keys = keyDesc.split('+');

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            let pressed;

            if (this.MODIFIERS.indexOf(key) !== -1) {
                pressed = this.modifiers[key];
            } else if (Object.keys(this.ALIAS).indexOf(key) !== -1) {
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

        if (pressedKey) {
            return keyToDir[pressedKey];
        } else {
            return null;
        }
    };
}

export const ControlsManager = new ControlsManagerClass();
