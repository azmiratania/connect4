# Connect Four

Design a two-player Connect Four game. Players take turns dropping discs into a 7-column, 6-row board. The first to align four of their own discs vertically, horizontally, or diagonally wins.

## Requirements

### Core Game Logic

- **Board dimensions**: 7 columns × 6 rows (42 total spaces)
- **Players**: Two players alternate turns
- **Disc placement**: A disc dropped into a column falls to the lowest available row
- **Invalid move handling**: Reject invalid moves explicitly (full column, out-of-range column, move after game over) — do not silently ignore
  - Out-of-range columns: 0–6 are valid; anything else is rejected
  - Full column: reject moves into columns with no empty rows
  - Move after game over: reject moves once a winner or draw is declared
- **Win condition**: A player wins by aligning four of their own discs vertically, horizontally, or diagonally
- **Draw condition**: Automatically declared when all 42 spaces are filled with no winner

### Game Flow & State

- **State tracking**: The game must track the current board state, whose turn it is, and the outcome (winner or draw)
- **Accessibility**: Game state should be queryable/accessible to determine current status
- **Game restart**: Optional to implement

### Player Input

- **Submission mechanism**: Players submit moves via a method/function call with a column parameter
- **Column range**: Columns numbered 0–6
- **Invalid column handling**: Reject columns outside the valid range

### Win Detection

- **Timing**: Win detection occurs automatically after every valid move
- **Communication**: The game should be able to communicate who won (but does not need to identify the specific four winning discs)

### API / Interface

- **Backend only**: No UI required
- **Architecture**: Design the structure and method signatures as needed

## Out of Scope

- UI / graphical interface
- AI opponent
- Networking / multiplayer over the internet
- Move undo/replay
- Game history or save/load functionality

## Entity Relationships

### Main Entities

1. **Game** — Orchestrates the game flow; manages turns, validates moves, detects wins/draws
2. **Board** — Represents the 7×6 grid; tracks disc placement and state
3. **Player** — Represents a player (Player 1 or Player 2); tracks whose turn it is
4. **GameState** — Enum representing the current game state (in progress, won, draw)
5. **DiscColor** — Enum representing disc colors (Red, Yellow)

### How They Connect

- **Game** creates and owns a single **Board** and two **Players**
- **Game** tracks the **currentPlayerIndex** (alternates after each valid move) and the **GameState** (in progress, won, or draw)
- **Board** is a 6×7 2D grid; each cell holds a **DiscColor** (Red, Yellow, or null/empty)
- **Player** has a name and an assigned **DiscColor** (Red or Yellow)
- When a player calls `makeMove(column)`:
  - **Game** validates the game state (must be IN_PROGRESS)
  - **Board.canPlace(column)** checks if the column is valid (0–6) and not full
  - If valid, **Board.placeDisc()** places the disc and returns true
  - **Game** checks for a winner using `Board.checkWin()`
  - **GameState** updates to WON (if winner found) or DRAW (if board full) or remains IN_PROGRESS
  - **currentPlayerIndex** switches to the other player
- **Game.getWinner()** returns the winning **Player** or null if no winner yet

## Class Design

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════

enum DiscColor {
  RED = "RED",
  YELLOW = "YELLOW",
}

enum GameState {
  IN_PROGRESS = "IN_PROGRESS",
  WON = "WON",
  DRAW = "DRAW",
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAYER CLASS
// ═══════════════════════════════════════════════════════════════════════════

class Player {
  private name: string;
  private color: DiscColor;

  constructor(name: string, color: DiscColor) {
    this.name = name;
    this.color = color;
  }

  getName(): string { return this.name; }
  getColor(): DiscColor { return this.color; }
}

// ═══════════════════════════════════════════════════════════════════════════
// BOARD CLASS
// ═══════════════════════════════════════════════════════════════════════════

class Board {
  private rows: number = 6;
  private cols: number = 7;
  private grid: (DiscColor | null)[][];

  constructor() {
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
  }

  // Returns true if the disc was placed successfully
  placeDisc(column: number, color: DiscColor): boolean {
    if (!this.canPlace(column)) return false;
    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.grid[row][column] === null) {
        this.grid[row][column] = color;
        return true;
      }
    }
    return false;
  }

  canPlace(column: number): boolean {
    return column >= 0 && column < this.cols && this.grid[0][column] === null;
  }

  checkWin(color: DiscColor): boolean {
    // Horizontal, vertical, and diagonal checks
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (
          this.checkDirection(r, c, 0, 1, color) ||   // horizontal
          this.checkDirection(r, c, 1, 0, color) ||   // vertical
          this.checkDirection(r, c, 1, 1, color) ||   // diagonal down-right
          this.checkDirection(r, c, 1, -1, color)     // diagonal down-left
        ) {
          return true;
        }
      }
    }
    return false;
  }

  isFull(): boolean {
    return this.grid[0].every(cell => cell !== null);
  }

  getCell(row: number, column: number): DiscColor | null {
    return this.grid[row][column];
  }

  private checkDirection(row: number, col: number, dr: number, dc: number, color: DiscColor): boolean {
    for (let i = 0; i < 4; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= this.rows || c < 0 || c >= this.cols || this.grid[r][c] !== color) {
        return false;
      }
    }
    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GAME CLASS
// ═══════════════════════════════════════════════════════════════════════════

class Game {
  private board: Board;
  private players: [Player, Player];
  private currentPlayerIndex: number;
  private state: GameState;
  private winner: Player | null;

  constructor(player1: Player, player2: Player) {
    this.board = new Board();
    this.players = [player1, player2];
    this.currentPlayerIndex = 0;
    this.state = GameState.IN_PROGRESS;
    this.winner = null;
  }

  makeMove(column: number): boolean {
    if (this.state !== GameState.IN_PROGRESS) return false;

    const currentPlayer = this.getCurrentPlayer();
    const placed = this.board.placeDisc(column, currentPlayer.getColor());
    if (!placed) return false;

    if (this.board.checkWin(currentPlayer.getColor())) {
      this.state = GameState.WON;
      this.winner = currentPlayer;
    } else if (this.board.isFull()) {
      this.state = GameState.DRAW;
    } else {
      this.currentPlayerIndex = 1 - this.currentPlayerIndex;
    }

    return true;
  }

  getCurrentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  getGameState(): GameState { return this.state; }
  getWinner(): Player | null { return this.winner; }
  getBoard(): Board { return this.board; }
}
```

## Implementation Notes

### Key Methods

**Board.placeDisc(column, color)**
- Validates via `canPlace()` first
- Iterates from bottom to top (highest row index to 0) to find first empty cell
- Places disc and returns true on success

**Board.checkWin(color)**
- Iterates through all cells on the board
- For each cell, checks all four directions: horizontal, vertical, and two diagonals
- Returns true if any direction contains four consecutive discs of the same color

**Board.checkDirection(row, col, dr, dc, color)**
- Checks if four consecutive discs exist starting from (row, col) in direction (dr, dc)
- dr, dc represent direction deltas: (0, 1) = right, (1, 0) = down, (1, 1) = down-right, (1, -1) = down-left

**Game.makeMove(column)**
- Validates game is still in progress
- Calls `board.placeDisc()` to attempt placement
- If successful, checks for win or draw and updates game state
- Returns false if move was invalid or game is over
