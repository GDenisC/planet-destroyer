import Game from '../Game';

export default class Epoch {
    public static readonly EPOCH_LEVEL = 100;
    public points = 0;

    public endEpoch() {
        const game = Game.instance!;

        this.points += Epoch.calculatePoints(game.level);
        game.reset();
        game.overlay.scene;
    }

    public static calculatePoints(level: number): number {
        return Math.round(Math.pow(level / this.EPOCH_LEVEL, 2 + level / 1000));
    }

    public static calculateProgress(level: number): number {
        return Math.min(1, level / Epoch.EPOCH_LEVEL);
    }
}