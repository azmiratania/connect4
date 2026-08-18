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
5. **DiscColor** — Enum representing disc colors (e.g., Red, Yellow, or player identifiers)

### Class Diagrams

```
class Game:
    - board: Board
    - currentPlayer: Player
    - state: GameState
    - winner: Player?

    + Game(player1, player2)
    + makeMove(column) -> bool
    + getGameState() -> GameState
    + getWinner() -> Player?
    + getBoard() -> Board

class Board:
    - rows: int = 6
    - cols: int = 7
    - grid: DiscColor?[rows][cols]

    + canPlace(column) -> bool
    + getCell(row, column) -> DiscColor?

class Player:
    - name: string
    - color: DiscColor

    + getName() -> string
    + getColor() -> DiscColor

enum GameState:
    IN_PROGRESS
    WON
    DRAW

enum DiscColor:
    RED
    YELLOW
    EMPTY
```

### How They Connect

- **Game** creates and owns a single **Board** and two **Players**
- **Game** tracks the **currentPlayer** (alternates after each valid move) and the **GameState** (in progress, won, or draw)
- **Board** is a 6×7 2D grid; each cell holds a **DiscColor** (Red, Yellow, or Empty)
- **Player** has a name and an assigned **DiscColor** (Red or Yellow)
- When a player calls `makeMove(column)`:
  - **Game** validates the column (0–6) and calls `Board.canPlace(column)`
  - If valid, **Game** places the disc and checks for a winner
  - **GameState** updates to Won (if winner found) or Draw (if board full) or remains In Progress
  - **currentPlayer** switches to the other player
- **Game.getWinner()** returns the winning **Player** or null if no winner yet

### Game Flow Example

1. Game starts with two Players; Board is empty; GameState = IN_PROGRESS
2. Player 1 calls `makeMove(3)` → Game validates and places Red disc in column 3
3. Game checks for a winner → none found; GameState remains IN_PROGRESS
4. Player 2's turn → calls `makeMove(4)` → Yellow disc placed in column 4
5. Loop continues until GameState becomes WON (4 in a row) or DRAW (board full)
