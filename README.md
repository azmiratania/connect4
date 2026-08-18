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
