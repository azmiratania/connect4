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
  - **Game** checks for a winner using `Board.checkWinAtPosition(row, col, color)`
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

  // Optimized: Check for win from a specific position (newly placed disc)
  checkWinAtPosition(row: number, col: number, color: DiscColor): boolean {
    return (
      this.countDirection(row, col, 0, 1, color) >= 4 ||   // horizontal
      this.countDirection(row, col, 1, 0, color) >= 4 ||   // vertical
      this.countDirection(row, col, 1, 1, color) >= 4 ||   // diagonal down-right
      this.countDirection(row, col, 1, -1, color) >= 4     // diagonal down-left
    );
  }

  private countDirection(row: number, col: number, dr: number, dc: number, color: DiscColor): number {
    let count = 1; // count the disc at (row, col)
    
    // Count in positive direction
    let r = row + dr, c = col + dc;
    while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.grid[r][c] === color) {
      count++;
      r += dr;
      c += dc;
    }
    
    // Count in negative direction
    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.grid[r][c] === color) {
      count++;
      r -= dr;
      c -= dc;
    }
    
    return count;
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
    
    // Try to place the disc and get the row it was placed in
    const placedRow = this.board.placeDiscAndGetRow(column, currentPlayer.getColor());
    if (placedRow === -1) return false;

    // Check for win from the newly placed disc
    if (this.board.checkWinAtPosition(placedRow, column, currentPlayer.getColor())) {
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

### Win Detection Algorithm: `checkWinAtPosition(row, col, color)`

Instead of scanning the entire board, this **optimized approach** checks only the four directions from the newly placed disc:

**Algorithm:**
1. For each of the 4 directions (horizontal, vertical, and both diagonals):
   - Count consecutive discs of the same color **starting from (row, col)**
   - Count both forward and backward along the direction vector
   - If any direction reaches 4+ discs, return true (winner found)

**Efficiency:**
- **Time**: O(4) = O(1) per move (instead of O(42) scanning entire board)
- **Space**: O(1)

**Helper Method: `countDirection(row, col, dr, dc, color)`**
- Counts consecutive discs from position (row, col) in direction (dr, dc)
- **dr, dc** represent the direction: 
  - (0, 1) = horizontal right
  - (1, 0) = vertical down
  - (1, 1) = diagonal down-right
  - (1, -1) = diagonal down-left
- Expands in **both positive and negative directions** from the center
- Returns total count (including the center disc)

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

Checking horizontal (dr=0, dc=1):
- Start with count = 1 (the disc at 3,3)
- Positive direction (3,4), (3,5): RED, empty → add 1, total = 2
- Negative direction (3,2), (3,1): RED, empty → add 1, total = 3
- Result: 3 < 4, no horizontal win

### Key Methods

**Board.placeDiscAndGetRow(column, color)**
- Validates and places disc, returns the row index where it was placed
- Returns -1 if placement failed

**Board.checkWinAtPosition(row, col, color)**
- Optimized win detection from a specific position
- Checks all 4 directions and returns true if any reaches 4+ consecutive discs

**Board.countDirection(row, col, dr, dc, color)**
- Counts consecutive discs in both directions from center
- Uses direction vectors to check horizontal, vertical, and diagonal lines

**Game.makeMove(column)**
- Validates game is still in progress
- Places disc and gets row position
- Calls `checkWinAtPosition()` from newly placed disc (not entire board)
- Updates game state and switches player on valid move
- Returns false if move was invalid or game is over
