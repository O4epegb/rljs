export function matrix(numrows, numcols, initial = null) {
    const arr = [];
    for (let i = 0; i < numrows; ++i) {
        const columns = [];
        for (let j = 0; j < numcols; ++j) {
            columns[j] = initial;
        }
        arr[i] = columns;
    }
    return arr;
}
