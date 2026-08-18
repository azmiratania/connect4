enum DiscColor {
    RED = "RED",
    YELLOW = "YELLOW",
}

class Board {
    private readonly rows: number;
    private readonly cols: number;
    private grid: Array<Array<DiscColor | null>>;

    constructor(rows: number = 6, cols: number = 7) {
        this.rows = rows;
        this.cols = cols;
        this.grid = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => null)
        );
    }

    getRows(): number {
        return this.rows;
    }

    getCols(): number {
        return this.cols;
    }

    canPlace(column: number): boolean {
        if (column < 0 || column >= this.cols) {
            return false;
        }
        return this.grid[0][column] === null;
    }

    placeDisc(column: number, color: DiscColor): number {
        if (!this.canPlace(column)) {
            return -1;
        }

        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.grid[row][column] === null) {
                this.grid[row][column] = color;
                return row;
            }
        }

        return -1;
    }

    checkWin(row: number, column: number, color: DiscColor): boolean {
        if (!this.inBounds(row, column) || this.grid[row][column] !== color) {
            return false;
        }

        const directions: Array<[number, number]> = [
            [0, 1],
            [1, 0],
            [1, 1],
            [-1, 1],
        ];

        for (const [dr, dc] of directions) {
            let count = 1;
            count += this.countInDirection(row, column, dr, dc, color);
            count += this.countInDirection(row, column, -dr, -dc, color);
            if (count >= 4) {
                return true;
            }
        }

        return false;
    }

    isFull(): boolean {
        return this.grid[0].every((cell) => cell !== null);
    }

    getCell(row: number, column: number): DiscColor | null {
        if (!this.inBounds(row, column)) {
            return null;
        }
        return this.grid[row][column];
    }

    private countInDirection(
        row: number,
        column: number,
        dr: number,
        dc: number,
        color: DiscColor
    ): number {
        let count = 0;
        let r = row + dr;
        let c = column + dc;

        while (this.inBounds(r, c) && this.grid[r][c] === color) {
            count++;
            r += dr;
            c += dc;
        }

        return count;
    }

    private inBounds(row: number, column: number): boolean {
        return row >= 0 && row < this.rows && column >= 0 && column < this.cols;
    }
}
