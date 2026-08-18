import { Board, DiscColor } from "./Board.js";
import { Player } from "./Player.js";

export enum GameState {
    IN_PROGRESS = "IN_PROGRESS",
    WON = "WON",
    DRAW = "DRAW",
}

export class Game {
    private readonly board: Board;
    private readonly player1: Player;
    private readonly player2: Player;
    private currentPlayer: Player;
    private state: GameState;
    private winner: Player | null;

    constructor(player1: Player, player2: Player) {
        this.board = new Board();
        this.player1 = player1;
        this.player2 = player2;
        this.currentPlayer = player1;
        this.state = GameState.IN_PROGRESS;
        this.winner = null;
    }

    makeMove(player: Player, column: number): boolean {
        if (this.state !== GameState.IN_PROGRESS) {
            return false;
        }
        if (player !== this.currentPlayer) {
            return false;
        }

        const row = this.board.placeDisc(column, player.color);
        if (row === -1) {
            return false;
        }

        if (this.board.checkWin(row, column, player.color)) {
            this.state = GameState.WON;
            this.winner = player;
        } else if (this.board.isFull()) {
            this.state = GameState.DRAW;
        } else {
            this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
        }

        return true;
    }

    getCurrentPlayer(): Player {
        return this.currentPlayer;
    }

    getGameState(): GameState {
        return this.state;
    }

    getWinner(): Player | null {
        return this.winner;
    }

    getBoard(): Board {
        return this.board;
    }
}
