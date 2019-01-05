import 'normalize-css/normalize.css';
import './styles';

import * as PIXI from 'pixi.js';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const app = new PIXI.Application(800, 600, {
    backgroundColor: 0x1099bb,
    forceCanvas: true
});
document.body.appendChild(app.view);

app.stage.scale.x = 3;
app.stage.scale.y = 3;

const entities = {
    url: 'entities.png',
    name: 'entities'
};

const dungeon = {
    url: 'dungeon.png',
    name: 'dungeon'
};

PIXI.loader.add([entities, dungeon]).load(() => {
    const frame = new PIXI.Rectangle(0, 0, 16, 16);
    const frame2 = new PIXI.Rectangle(96, 0, 16, 16);

    const texture = new PIXI.Texture(
        PIXI.loader.resources['entities'].texture,
        frame
    );

    const texture2 = new PIXI.Texture(
        PIXI.loader.resources['entities'].texture,
        frame2
    );

    const sprite2 = new PIXI.Sprite(texture2);
    sprite2.x = 16;

    app.stage.addChild(sprite2);
    app.stage.addChild(new PIXI.Sprite(texture));
});
