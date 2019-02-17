import * as React from 'react';
import * as ReactDOM from 'react-dom';
const { useState, useEffect } = React;

import { RendererDom } from './dom';
import { RendererCanvas } from './canvas';
import { Entity } from '../entity';
import { Tile } from '../createMap';

export interface CellDataForViewRender {
    char: string;
    isHidden?: boolean;
    isInFov?: boolean;
    original: Tile | Entity;
}

export type RenderViewRows = Array<Array<Array<CellDataForViewRender>>>;

document.body.innerHTML = `
<div class="wrapper">
    <div id="root">
    </div>
</div>
`;

const root = document.querySelector('#root');

export interface RendererProps {
    rows: RenderViewRows;
}

const storageKey = 'dom-renderer';
const App = ({ rows }: RendererProps) => {
    const [isDomRenderer, setKek] = useState(
        Boolean(localStorage.getItem(storageKey))
    );
    const Renderer = isDomRenderer ? RendererDom : RendererCanvas;

    function switchRenderer() {
        setKek(isDomRenderer => {
            if (isDomRenderer) {
                localStorage.removeItem(storageKey);
            } else {
                localStorage.setItem(storageKey, '1');
            }

            return !isDomRenderer;
        });
    }

    useEffect(() => {
        document.addEventListener('keydown', e => {
            if (e.key === 'Tab') {
                e.preventDefault();
                switchRenderer();
            }
        });
    }, []);

    return (
        <div className="render-zone">
            <Renderer rows={rows} />
        </div>
    );
};

export function renderView(rows: RenderViewRows) {
    ReactDOM.render(<App rows={rows} />, root);
}
