import * as React from 'react';

import { RendererProps } from './';
import {
    screenWidth,
    tileSize,
    screenHeight,
    spriteTileSize
} from '../constants';
import { Tile } from '../createMap';
import { loadImage } from '../utils';

const { useRef, useEffect } = React;

let dungeonSprite: HTMLImageElement = null;
let entitySprite: HTMLImageElement = null;
let context: CanvasRenderingContext2D = null;

function renderTile(
    dungeonSprite: HTMLImageElement,
    sourceX: number,
    sourceY: number,
    destX: number,
    destY: number
) {
    context.drawImage(
        dungeonSprite,
        sourceX * spriteTileSize,
        sourceY * spriteTileSize,
        spriteTileSize,
        spriteTileSize,
        destX * tileSize,
        destY * tileSize,
        tileSize,
        tileSize
    );
}

function colorRect(
    topLeftX: number,
    topLeftY: number,
    boxWidth: number,
    boxHeight: number,
    fillColor: string
) {
    context.fillStyle = fillColor;
    context.beginPath();
    context.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
    context.fill();
}

function render({ rows }: RendererProps) {
    context.clearRect(0, 0, 9999, 9999);

    rows.forEach((cells, y) => {
        cells.forEach((cellContents, x) => {
            cellContents.forEach(content => {
                if (content.isHidden) {
                    return;
                }

                if (content.original instanceof Tile) {
                    const floor = content.original;

                    const row = Math.floor(floor.tileIndex / 13);
                    const col = floor.tileIndex - row * 13;

                    renderTile(dungeonSprite, col, row, x, y);

                    if (!content.isInFov) {
                        colorRect(
                            x * tileSize,
                            y * tileSize,
                            tileSize,
                            tileSize,
                            'rgba(0, 0, 0, 0.5)'
                        );
                    }
                } else {
                    const entity = content.original;

                    const row = 0;
                    const col = entity.appearance.getSpriteIndex(
                        entity.position.isFacingLeft
                    );

                    renderTile(entitySprite, col, row, x, y);
                }
            });
        });
    });
}

export function RendererCanvas({ rows }: RendererProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isReadyToRenderRef = useRef(false);

    useEffect(() => {
        context = canvasRef.current.getContext('2d');
        context.imageSmoothingEnabled = false;

        Promise.all([
            loadImage('/dungeon.png'),
            loadImage('/entities.png')
        ]).then(([dungeon, entities]) => {
            isReadyToRenderRef.current = true;

            dungeonSprite = dungeon;
            entitySprite = entities;

            render({ rows });
        });
    }, []);

    useEffect(() => {
        if (isReadyToRenderRef.current) {
            render({ rows });
        }
    }, [rows]);

    return (
        <canvas
            ref={canvasRef}
            width={screenWidth * tileSize}
            height={screenHeight * tileSize}
        />
    );
}
