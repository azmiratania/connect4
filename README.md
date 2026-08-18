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
- **Game** tracks the **currentPlayer** (alternates after each valid move) and the **GameState** (in progress, won, or draw)
- **Board** is a 6×7 2D grid; each cell holds a **DiscColor** (Red, Yellow, or null/empty)
- **Player** has a name and an assigned **DiscColor** (Red or Yellow)
- When a player calls `makeMove(column)`:
  - **Game** validates the game state (must be IN_PROGRESS)
  - Validates column is in range [0, 6] and not full
  - Places the disc and gets the row index
  - Checks for a winner using `checkWin(row, col, color)`
  - **GameState** updates to WON (if winner found) or DRAW (if board full) or remains IN_PROGRESS
  - **currentPlayer** switches to the other player
- **Game.getWinner()** returns the winning **Player** or null if no winner yet

## Class Design

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const ROWS = 6;
const COLS = 7;

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
// GAME CLASS
// ═══════════════════════════════════════════════════════════════════════════

class Game {
  private grid: (DiscColor | null)[][];
  private players: [Player, Player];
  private currentPlayer: Player;
  private state: GameState;
  private winner: Player | null;

  constructor(player1: Player, player2: Player) {
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    this.players = [player1, player2];
    this.currentPlayer = player1;
    this.state = GameState.IN_PROGRESS;
    this.winner = null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN API
  // ═══════════════════════════════════════════════════════════════════════

  makeMove(column: number): void {
    // Validate game is still in progress
    if (this.state !== GameState.IN_PROGRESS) {
      throw new Error("Game is already over");
    }

    // Validate column bounds
    if (column < 0 || column >= COLS) {
      throw new Error(`Invalid column: ${column}. Must be between 0 and ${COLS - 1}`);
    }

    // Validate column is not full
    if (this.grid[0][column] !== null) {
      throw new Error(`Column ${column} is full`);
    }

    // Drop disc into the lowest available row
    const landingRow = this.placeDisc(column);

    // Check for win
    if (this.checkWin(landingRow, column, this.currentPlayer.color)) {
      this.state = GameState.WON;
      this.winner = this.currentPlayer;
      return;
    }

    // Check for draw (board completely full)
    if (this.isBoardFull()) {
      this.state = GameState.DRAW;
      return;
    }

    // Switch turn to the other player
    this.currentPlayer =
      this.currentPlayer === this.players[0] ? this.players[1] : this.players[0];
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════

  // Returns the row where the disc lands
  private placeDisc(column: number): number {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (this.grid[row][column] === null) {
        this.grid[row][column] = this.currentPlayer.color;
        return row;
      }
    }
    throw new Error(`Column ${column} is full`); // Should not reach here after validation
  }

  // Check if placing a disc at (row, col) creates four in a row
  private checkWin(row: number, col: number, color: DiscColor): boolean {
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
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && this.grid[r][c] === color) {
        count++;
        r += dr;
        c += dc;
      }

      // Count in the negative direction
      r = row - dr;
      c = col - dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && this.grid[r][c] === color) {
        count++;
        r -= dr;
        c -= dc;
      }

      if (count >= 4) return true;
    }

    return false;
  }

  // Check if board is completely full
  private isBoardFull(): boolean {
    return this.grid[0].every((cell) => cell !== null);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // QUERY METHODS
  // ═══════════════════════════════════════════════════════════════════════

  getCurrentPlayer(): Player { return this.currentPlayer; }
  getGameState(): GameState { return this.state; }
  getWinner(): Player | null { return this.winner; }
  getGrid(): (DiscColor | null)[][] { return this.grid; }
}
```

## Implementation Notes

### `makeMove(column)` - Full Sequence with Exception Handling

The `makeMove` method throws exceptions for invalid moves and orchestrates the entire turn: validation, disc placement, win/draw detection, and state updates.

**Return Value:**
- `void` — returns nothing on success
- Throws `Error` on any invalid move or game state violation

**Three Validation Checks (Throw Exceptions):**

| Check | Throws | Message |
|-------|--------|---------|
| Game already won/drawn | `Error` | "Game is already over" |
| Column out of range [0, 6] | `Error` | `"Invalid column: X. Must be between 0 and 6"` |
| Column is full | `Error` | `"Column X is full"` |

**Seven-Step Sequence:**

```
1. Validate game state → throw if not IN_PROGRESS
2. Validate column range [0, 6] → throw if invalid
3. Validate column not full → throw if grid[0][column] is not null
4. Place disc → get landing row
5. Check for winner (4-in-a-row)
   → if found: state = WON, winner = currentPlayer, return
6. Check for draw (board full)
   → if found: state = DRAW, return
7. Switch to other player → currentPlayer = other, return
```

**Why Exceptions Over Boolean?**

This implementation uses exceptions because:
- **Clearer intent** — An invalid move is an exceptional condition, not a normal game flow
- **Fail-fast** — No need to check a boolean return value; invalid moves stop execution immediately
- **Better stack traces** — Exceptions provide context about where and why validation failed
- **No ambiguity** — You can't accidentally ignore a failed move

**Valid Move Sequence (No Exceptions):**

```typescript
// Normal gameplay
game.makeMove(3);  // Alice: RED disc at column 3 → lands at some row
game.makeMove(4);  // Bob: YELLOW disc at column 4 → lands at some row
game.makeMove(3);  // Alice: RED disc at column 3 → lands higher (gravity)
// ... game continues ...

// Eventually a winning move (no exception; state changes)
game.makeMove(5);  // Alice wins with 4-in-a-row
// game.getGameState() === GameState.WON
// game.getWinner() === Alice

// After game is won, any move throws
game.makeMove(2);  // Throws: "Game is already over"
```

**Invalid Move Scenarios (All Throw Exceptions):**

```typescript
// Column out of range
game.makeMove(-1);    // Throws: "Invalid column: -1. Must be between 0 and 6"
game.makeMove(7);     // Throws: "Invalid column: 7. Must be between 0 and 6"

// Column is full
game.makeMove(0);     // ... fills column 0 over many turns ...
game.makeMove(0);     // Throws: "Column 0 is full"

// Game already over
game.makeMove(5);     // Returns normally (winning move, state = WON)
game.makeMove(2);     // Throws: "Game is already over"
```

### State Transition Diagram

```
IN_PROGRESS (initial state)
    ↓
[Player calls makeMove(column)]
    ↓
[Validate: state, column range, column not full]
    ├─→ Invalid ──→ Throw Error (no state change)
    │
    └─→ Valid ──→ [Place disc at landing row]
                  ↓
              [Check for 4-in-a-row]
                  ├─→ Winner found ──→ State = WON, winner set, return
                  │
                  └─→ No winner ──→ [Check if board full]
                                    ├─→ Board full ──→ State = DRAW, return
                                    │
                                    └─→ Board not full ──→ Switch player, return
                                                          (State stays IN_PROGRESS)
```

### Example Usage

```typescript
const player1 = new Player("Alice", DiscColor.RED);
const player2 = new Player("Bob", DiscColor.YELLOW);
const game = new Game(player1, player2);

try {
  // Valid moves (game progresses)
  game.makeMove(3);   // Alice places RED at column 3
  game.makeMove(3);   // Bob places YELLOW at column 3 (higher row)
  game.makeMove(4);   // Alice places RED at column 4

  // Invalid: column out of range
  game.makeMove(-1);  // ❌ Throws: "Invalid column: -1. Must be between 0 and 6"

} catch (error) {
  console.error(error.message);
}

try {
  // Fill a column
  game.makeMove(0);   // ... after several turns, column 0 is full
  game.makeMove(0);   // ❌ Throws: "Column 0 is full"

} catch (error) {
  console.error(error.message);
}

try {
  // Eventually, a winning move
  // ... after many moves ...
  game.makeMove(5);   // Alice wins with 4-in-a-row
  console.log(game.getGameState());  // GameState.WON
  console.log(game.getWinner());     // Alice

  // Game over: no more moves allowed
  game.makeMove(2);   // ❌ Throws: "Game is already over"

} catch (error) {
  console.error(error.message);
}
```

### Key Methods

**placeDisc(column): number**
- Finds the lowest empty row in the given column
- Places current player's disc at that position
- Returns the row index where disc was placed
- Throws error if column is somehow full (defensive; should be caught by prior validation)

**checkWin(row, col, color): boolean**
- Checks all 4 directions from the newly placed disc
- Returns true if any direction has 4+ consecutive discs of the same color
- Directions: horizontal, vertical, and both diagonals
- Uses direction vectors for clean, extensible code

**isBoardFull(): boolean**
- Checks if the top row (row 0) is completely filled
- If top row is full, entire board must be full (gravity ensures discs stack)
- Returns true only when no more moves are possible

**makeMove(column): void**
- Orchestrates the complete turn with 3-level validation and 4-step state update
- Throws exceptions on invalid input or game state violations
- Board remains unchanged if any validation fails (exception thrown before mutation)
- On success, returns normally and updates game state

### Error Handling Philosophy

**Exceptions as Control Flow:**
- Invalid moves are treated as exceptions, not normal control flow
- Callers must wrap moves in try/catch to handle potential errors
- Forces the caller to explicitly consider error cases

**Defensive Programming:**
- Validate column range before checking if full
- Check if full before attempting placement
- Placement method throws if column is somehow full (extra safety)

**No Silent Failures:**
- Every invalid move produces an exception with a descriptive message
- Impossible to accidentally ignore an invalid move
- Easier to debug: exception stack trace shows exactly where the error occurred
