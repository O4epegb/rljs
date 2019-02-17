import * as React from 'react';
import cx from 'classnames';

import { RendererProps } from './';
import { Tile } from '../createMap';

export function RendererDom({ rows }: RendererProps) {
    return (
        <div className="map">
            {rows.map((cells, rowIndex) => (
                <div key={rowIndex} className="row">
                    {cells.map((cellContents, cellIndex) => (
                        <div key={cellIndex} className="cell">
                            {cellContents.map((content, index) => {
                                const isLast =
                                    cellContents.length > 1 &&
                                    index === cellContents.length - 1;
                                const isInFov =
                                    content.isInFov !== undefined &&
                                    content.isInFov;

                                return (
                                    <div
                                        key={index}
                                        className={cx('cell-content', {
                                            'cell-content_blacked': isLast,
                                            'cell-content_not-in-fov':
                                                content.original instanceof
                                                    Tile && !isInFov
                                        })}
                                    >
                                        {content.char}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
