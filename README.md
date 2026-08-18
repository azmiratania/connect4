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
  - If valid, **Board.placeDisc()** places the disc and returns the row index
  - **Game** checks for a winner using `Board.checkWin(row, col, color)`
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

  // Returns the row index where the disc was placed, or -1 if placement failed
  placeDisc(column: number, color: DiscColor): number {
    if (!this.canPlace(column)) return -1;
    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.grid[row][column] === null) {
        this.grid[row][column] = color;
        return row;
      }
    }
    return -1;
  }

  canPlace(column: number): boolean {
    return column >= 0 && column < this.cols && this.grid[0][column] === null;
  }

  // Check if placing a disc at (row, col) creates four in a row
  checkWin(row: number, col: number, color: DiscColor): boolean {
    const directions: [number, number][] = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down-right
      [1, -1],  // diagonal down-left
    ];

    for (const [dr, dc] of directions) {
      let count = 1;

      // Count in the positive direction
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.grid[r][c] === color) {
        count++;
        r += dr;
        c += dc;
      }

      // Count in the negative direction
      r = row - dr;
      c = col - dc;
      while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.grid[r][c] === color) {
        count++;
        r -= dr;
        c -= dc;
      }

      if (count >= 4) return true;
    }

    return false;
  }

  isFull(): boolean {
    return this.grid[0].every(cell => cell !== null);
  }

  getCell(row: number, column: number): DiscColor | null {
    return this.grid[row][column];
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
    const placedRow = this.board.placeDisc(column, currentPlayer.getColor());
    if (placedRow === -1) return false;

    // Check for win from the newly placed disc
    if (this.board.checkWin(placedRow, column, currentPlayer.getColor())) {
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

### Win Detection Algorithm: `checkWin(row, col, color)`

Instead of scanning the entire board, this **optimized approach** checks only the four directions from the newly placed disc:

**Algorithm:**
1. Define four direction vectors: `[0, 1]`, `[1, 0]`, `[1, 1]`, `[1, -1]`
2. For each direction:
   - Start with count = 1 (the newly placed disc)
   - Count consecutive discs in the **positive direction** (row + dr, col + dc)
   - Count consecutive discs in the **negative direction** (row - dr, col - dc)
   - Stop when hitting a different color or board boundary
   - If total count ≥ 4, return true (winner found)
3. If no direction has 4+ discs, return false

**Efficiency:**
- **Time**: O(1) per move (constant 4 directions × constant 7 max discs per line)
- **Space**: O(1)

**Why This Works:**
- A winning line must include the disc just placed
- By counting in both directions from that disc, we capture all possible four-in-a-row configurations
- No need to scan the entire board

**Direction Vectors:**
- `[0, 1]` = horizontal right (covers left and right from center)
- `[1, 0]` = vertical down (covers up and down from center)
- `[1, 1]` = diagonal down-right (covers up-left and down-right from center)
- `[1, -1]` = diagonal down-left (covers up-right and down-left from center)

**Example Walk-Through:**

Board after placing RED at (3, 3):
```
  0 1 2 3 4 5 6
0 . . . . . . .
1 . . . . . . .
2 . . . Y . . .
3 . . R R R . .  ← RED at (3,3)
4 . . Y R Y . .
5 . R Y R Y Y R
```

Checking horizontal `[0, 1]`:
- count = 1 (the disc at 3,3)
- Positive (3,4): RED ✓, (3,5): empty ✗ → add 1, total = 2
- Negative (3,2): RED ✓, (3,1): empty ✗ → add 1, total = 3
- Result: 3 < 4, no horizontal win

Checking vertical `[1, 0]`:
- count = 1
- Positive (4,3): RED ✓, (5,3): RED ✓, (6,3): out of bounds ✗ → add 2, total = 3
- Negative (2,3): empty ✗ → add 0, total = 3
- Result: 3 < 4, no vertical win

(Continue for both diagonals... none reach 4)

Final result: **No win**

### Key Methods

**Board.placeDisc(column, color)**
- Validates via `canPlace()` and places disc
- Returns the row index where placed, or -1 if failed

**Board.checkWin(row, col, color)**
- Checks all 4 directions from the newly placed disc
- Returns true if any direction has 4+ consecutive discs of the same color

**Board.canPlace(column)**
- Validates column is in range (0–6)
- Checks that top cell is empty (column not full)

**Game.makeMove(column)**
- Validates game is in progress
- Places disc and gets row position
- Checks for win from the newly placed disc
- Updates game state and switches player on valid move
- Returns false if move was invalid or game is over
