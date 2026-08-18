import { describe, it, expect, beforeEach } from "vitest";
import { Board, DiscColor } from "./Board.js";
import { Player } from "./Player.js";
import { Game, GameState } from "./Game.js";

// ─── Board tests ─────────────────────────────────────────────────────────────

describe("Board – initialization", () => {
    it("creates a 6-row × 7-column board", () => {
        const board = new Board();
        expect(board.getRows()).toBe(6);
        expect(board.getCols()).toBe(7);
    });

    it("all cells start empty (null)", () => {
        const board = new Board();
        for (let r = 0; r < board.getRows(); r++) {
            for (let c = 0; c < board.getCols(); c++) {
                expect(board.getCell(r, c)).toBeNull();
            }
        }
    });
});

describe("Board – canPlace", () => {
    it("returns false for column below range", () => {
        expect(new Board().canPlace(-1)).toBe(false);
    });

    it("returns false for column above range", () => {
        expect(new Board().canPlace(7)).toBe(false);
    });

    it("returns true for valid empty column", () => {
        expect(new Board().canPlace(0)).toBe(true);
    });

    it("returns false for a full column", () => {
        const board = new Board();
        for (let i = 0; i < 6; i++) board.placeDisc(0, DiscColor.RED);
        expect(board.canPlace(0)).toBe(false);
    });
});

describe("Board – placeDisc", () => {
    it("returns the landing row (bottom of empty column = row 5)", () => {
        const board = new Board();
        expect(board.placeDisc(0, DiscColor.RED)).toBe(5);
    });

    it("stacks discs from bottom upward", () => {
        const board = new Board();
        board.placeDisc(0, DiscColor.RED);    // row 5
        expect(board.placeDisc(0, DiscColor.YELLOW)).toBe(4);
        expect(board.placeDisc(0, DiscColor.RED)).toBe(3);
    });

    it("returns -1 for out-of-range column", () => {
        expect(new Board().placeDisc(-1, DiscColor.RED)).toBe(-1);
        expect(new Board().placeDisc(7, DiscColor.RED)).toBe(-1);
    });

    it("returns -1 when column is full", () => {
        const board = new Board();
        for (let i = 0; i < 6; i++) board.placeDisc(0, DiscColor.RED);
        expect(board.placeDisc(0, DiscColor.YELLOW)).toBe(-1);
    });
});

describe("Board – getCell", () => {
    it("returns the color placed at a position", () => {
        const board = new Board();
        board.placeDisc(3, DiscColor.YELLOW);
        expect(board.getCell(5, 3)).toBe(DiscColor.YELLOW);
    });

    it("returns null for out-of-bounds coordinates", () => {
        const board = new Board();
        expect(board.getCell(-1, 0)).toBeNull();
        expect(board.getCell(0, 7)).toBeNull();
    });
});

describe("Board – isFull", () => {
    it("returns false on a new board", () => {
        expect(new Board().isFull()).toBe(false);
    });

    it("returns true only when every cell is filled", () => {
        const board = new Board();
        for (let c = 0; c < 7; c++) {
            for (let r = 0; r < 6; r++) {
                board.placeDisc(c, DiscColor.RED);
            }
        }
        expect(board.isFull()).toBe(true);
    });
});

// ─── Game initialization tests ────────────────────────────────────────────────

describe("Game – initialization", () => {
    let p1: Player, p2: Player, game: Game;

    beforeEach(() => {
        p1 = new Player("Alice", DiscColor.RED);
        p2 = new Player("Bob", DiscColor.YELLOW);
        game = new Game(p1, p2);
    });

    it("starts IN_PROGRESS", () => {
        expect(game.getGameState()).toBe(GameState.IN_PROGRESS);
    });

    it("current player is player1", () => {
        expect(game.getCurrentPlayer()).toBe(p1);
    });

    it("winner is null initially", () => {
        expect(game.getWinner()).toBeNull();
    });

    it("board is 6 rows × 7 cols", () => {
        const board = game.getBoard();
        expect(board.getRows()).toBe(6);
        expect(board.getCols()).toBe(7);
    });
});

// ─── Game – valid move behaviour ─────────────────────────────────────────────

describe("Game – valid moves", () => {
    let p1: Player, p2: Player, game: Game;

    beforeEach(() => {
        p1 = new Player("Alice", DiscColor.RED);
        p2 = new Player("Bob", DiscColor.YELLOW);
        game = new Game(p1, p2);
    });

    it("makeMove returns true for a valid move", () => {
        expect(game.makeMove(p1, 0)).toBe(true);
    });

    it("switches to player2 after player1's valid move", () => {
        game.makeMove(p1, 0);
        expect(game.getCurrentPlayer()).toBe(p2);
    });

    it("switches back to player1 after player2's valid move", () => {
        game.makeMove(p1, 0);
        game.makeMove(p2, 1);
        expect(game.getCurrentPlayer()).toBe(p1);
    });

    it("places disc in the correct cell", () => {
        game.makeMove(p1, 3);
        expect(game.getBoard().getCell(5, 3)).toBe(DiscColor.RED);
    });
});

// ─── Game – invalid move behaviour ────────────────────────────────────────────

describe("Game – invalid moves", () => {
    let p1: Player, p2: Player, game: Game;

    beforeEach(() => {
        p1 = new Player("Alice", DiscColor.RED);
        p2 = new Player("Bob", DiscColor.YELLOW);
        game = new Game(p1, p2);
    });

    it("returns false when wrong player tries to move", () => {
        expect(game.makeMove(p2, 0)).toBe(false);
    });

    it("does not switch turn after wrong-player move", () => {
        game.makeMove(p2, 0);
        expect(game.getCurrentPlayer()).toBe(p1);
    });

    it("returns false for column below range (-1)", () => {
        expect(game.makeMove(p1, -1)).toBe(false);
    });

    it("returns false for column above range (7)", () => {
        expect(game.makeMove(p1, 7)).toBe(false);
    });

    it("returns false when column is full", () => {
        // Fill column 0 by alternating moves
        game.makeMove(p1, 0); game.makeMove(p2, 0);
        game.makeMove(p1, 0); game.makeMove(p2, 0);
        game.makeMove(p1, 0); game.makeMove(p2, 0);
        expect(game.makeMove(p1, 0)).toBe(false);
    });

    it("does not switch turn after invalid column move", () => {
        game.makeMove(p1, -1);
        expect(game.getCurrentPlayer()).toBe(p1);
    });
});

// ─── Game – win detection ─────────────────────────────────────────────────────

describe("Game – win detection", () => {
    let p1: Player, p2: Player, game: Game;

    beforeEach(() => {
        p1 = new Player("Alice", DiscColor.RED);
        p2 = new Player("Bob", DiscColor.YELLOW);
        game = new Game(p1, p2);
    });

    // Helper: alternate moves keeping p2 occupied in column 6
    function makeVerticalWin() {
        // p1 in col 0 four times; p2 in col 1 between each
        game.makeMove(p1, 0); game.makeMove(p2, 1);
        game.makeMove(p1, 0); game.makeMove(p2, 1);
        game.makeMove(p1, 0); game.makeMove(p2, 1);
        game.makeMove(p1, 0); // 4th in col 0 → win
    }

    it("detects vertical win and sets state to WON", () => {
        makeVerticalWin();
        expect(game.getGameState()).toBe(GameState.WON);
    });

    it("sets winner to the winning player on vertical win", () => {
        makeVerticalWin();
        expect(game.getWinner()).toBe(p1);
    });

    it("rejects moves after a win (returns false)", () => {
        makeVerticalWin();
        expect(game.makeMove(p2, 2)).toBe(false);
    });

    it("detects horizontal win", () => {
        // p1: cols 0,1,2,3; p2: col 6 between
        game.makeMove(p1, 0); game.makeMove(p2, 6);
        game.makeMove(p1, 1); game.makeMove(p2, 6);
        game.makeMove(p1, 2); game.makeMove(p2, 6);
        game.makeMove(p1, 3);
        expect(game.getGameState()).toBe(GameState.WON);
        expect(game.getWinner()).toBe(p1);
    });

    it("detects diagonal down-right win (\\)", () => {
        // Build staircase so p1 lands diagonally
        // col0:row5, col1:row4, col2:row3, col3:row2
        // Need to build up the columns first with filler discs
        game.makeMove(p1, 1); game.makeMove(p2, 1); // filler for col1
        game.makeMove(p1, 2); game.makeMove(p2, 2); game.makeMove(p1, 2); game.makeMove(p2, 2); // filler col2
        game.makeMove(p1, 3); game.makeMove(p2, 3); game.makeMove(p1, 3); game.makeMove(p2, 3);
        game.makeMove(p1, 3); game.makeMove(p2, 3); // filler col3

        // Now actual diagonal: p1 in col0(row5), col1(row4), col2(row3), col3(row2)
        game.makeMove(p1, 0); game.makeMove(p2, 5);
        game.makeMove(p1, 1); game.makeMove(p2, 5);
        game.makeMove(p1, 2); game.makeMove(p2, 5);
        game.makeMove(p1, 3); // wins
        expect(game.getGameState()).toBe(GameState.WON);
        expect(game.getWinner()).toBe(p1);
    });

    it("detects diagonal down-left win (/)", () => {
        // col3:row5, col2:row4, col1:row3, col0:row2
        game.makeMove(p1, 2); game.makeMove(p2, 2); // filler col2
        game.makeMove(p1, 1); game.makeMove(p2, 1); game.makeMove(p1, 1); game.makeMove(p2, 1); // filler col1
        game.makeMove(p1, 0); game.makeMove(p2, 0); game.makeMove(p1, 0); game.makeMove(p2, 0);
        game.makeMove(p1, 0); game.makeMove(p2, 0); // filler col0

        game.makeMove(p1, 3); game.makeMove(p2, 5);
        game.makeMove(p1, 2); game.makeMove(p2, 5);
        game.makeMove(p1, 1); game.makeMove(p2, 5);
        game.makeMove(p1, 0); // wins
        expect(game.getGameState()).toBe(GameState.WON);
        expect(game.getWinner()).toBe(p1);
    });

    it("does not trigger win on three in a row", () => {
        game.makeMove(p1, 0); game.makeMove(p2, 6);
        game.makeMove(p1, 1); game.makeMove(p2, 6);
        game.makeMove(p1, 2); game.makeMove(p2, 6);
        expect(game.getGameState()).toBe(GameState.IN_PROGRESS);
        expect(game.getWinner()).toBeNull();
    });

    it("does not trigger win when sequence is interrupted by opponent disc", () => {
        // p1 in cols 0,1; p2 in col 2; p1 in cols 3,4 — no 4-in-a-row
        game.makeMove(p1, 0); game.makeMove(p2, 2);
        game.makeMove(p1, 1); game.makeMove(p2, 6);
        game.makeMove(p1, 3); game.makeMove(p2, 6);
        game.makeMove(p1, 4);
        expect(game.getGameState()).toBe(GameState.IN_PROGRESS);
        expect(game.getWinner()).toBeNull();
    });
});

// ─── Game – draw detection ────────────────────────────────────────────────────

describe("Game – draw detection", () => {
    // Deterministic 42-move sequence that fills the board without any 4-in-a-row.
    // Verified via exhaustive search: no win is triggered at any point.
    const DRAW_SEQUENCE = [
        0, 0, 0, 0, 0, 0,
        1, 1, 1, 1, 1, 1,
        2, 2, 2, 2, 2, 2,
        4, 3, 3, 3, 3, 3,
        3, 4, 4, 4, 4, 4,
        5, 5, 5, 5, 5, 5,
        6, 6, 6, 6, 6, 6,
    ];

    function buildDrawGame(): { game: Game; p1: Player; p2: Player } {
        const p1 = new Player("Alice", DiscColor.RED);
        const p2 = new Player("Bob", DiscColor.YELLOW);
        const game = new Game(p1, p2);
        const players = [p1, p2];
        DRAW_SEQUENCE.forEach((col, t) => game.makeMove(players[t % 2], col));
        return { game, p1, p2 };
    }

    it("detects draw when board is full with no winner", () => {
        const { game } = buildDrawGame();
        expect(game.getGameState()).toBe(GameState.DRAW);
    });

    it("winner is null after draw", () => {
        const { game } = buildDrawGame();
        expect(game.getWinner()).toBeNull();
    });

    it("rejects moves after draw (returns false)", () => {
        const { game, p1, p2 } = buildDrawGame();
        expect(game.makeMove(p1, 0)).toBe(false);
        expect(game.makeMove(p2, 0)).toBe(false);
    });

    it("board isFull after 42 discs", () => {
        const board = new Board();
        let color = DiscColor.RED;
        for (let c = 0; c < 7; c++) {
            for (let r = 0; r < 6; r++) {
                board.placeDisc(c, color);
                color = color === DiscColor.RED ? DiscColor.YELLOW : DiscColor.RED;
            }
        }
        expect(board.isFull()).toBe(true);
    });
});

// ─── Player ───────────────────────────────────────────────────────────────────

describe("Player", () => {
    it("stores name and color", () => {
        const p = new Player("Alice", DiscColor.RED);
        expect(p.name).toBe("Alice");
        expect(p.color).toBe(DiscColor.RED);
    });
});
