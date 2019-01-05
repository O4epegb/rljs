export class Map<T = any> {
    numCols: number;
    numRows: number;
    items: Array<Array<T>>;

    constructor(numCols: number, numRows: number, initial: T = null) {
        this.numCols = numCols;
        this.numRows = numRows;
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

    forEach = <P>(cb: (item: T, x: number, y: number) => void) => {
        for (let x = 0; x < this.numCols; x++) {
            for (let y = 0; y < this.numRows; y++) {
                const item = this.items[y][x];
                cb(item, x, y);
            }
        }
    };

    *[Symbol.iterator]() {
        for (const item of this.items) {
            yield item;
        }
    }
}
