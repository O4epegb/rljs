export class Map<T = any> {
    items: Array<Array<T>>;

    constructor(numCols: number, numRows: number, initial: T = null) {
        const arr = [];

        for (let i = 0; i < numRows; i++) {
            const columns = [];
            arr[i] = columns;

            if (initial) {
                for (let j = 0; j < numCols; j++) {
                    columns[j] = initial;
                }
            }
        }

        this.items = arr;
    }

    get = (x: number, y: number) => {
        if (this.items[y] === undefined) {
            return null;
        }

        return this.items[y][x];
    };

    set = (x: number, y: number, item: T) => {
        if (this.items[y] === undefined) {
            return null;
        }

        this.items[y][x] = item;
    };

    map = <P>(cb: (item: Array<T>, index: number) => P) => {
        return this.items.map(cb);
    };

    *[Symbol.iterator]() {
        for (const item of this.items) {
            yield item;
        }
    }
}
