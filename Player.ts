import { DiscColor } from "./Board.js";

export class Player {
    public readonly name: string;
    public readonly color: DiscColor;

    constructor(name: string, color: DiscColor) {
        this.name = name;
        this.color = color;
    }
}
