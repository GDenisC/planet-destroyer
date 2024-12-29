import { Scene } from './components/Overlay';
import Game from './Game';

export default class Epoch {
    public static readonly EPOCH_LEVEL = 100;
    public multipliers = {
        power: 1, cost: 1, score: 1,
        time: 1, reset: 1
    };
    public penetrationChance = 0;
    public points = 0;
    public count = 0;

    public endEpoch() {
        const game = Game.instance!;

        if (this.count == 0) {
            this.multipliers.reset /= 2;
            alert('TODO Achievement unlocked: First Epoch. Reward: 2x reset speed.');
        }

        this.count += 1;
        this.points += Epoch.calculatePoints(game.level);
        game.reset();
        game.overlay.scene = Scene.Epoch;
        game.planet.shootRockets = false;
    }

    public static calculatePoints(level: number): number {
        return Math.round(Math.pow(level / this.EPOCH_LEVEL, 2 + level / 1000));
    }

    public static calculateProgress(level: number): number {
        return Math.min(1, level / Epoch.EPOCH_LEVEL);
    }
}