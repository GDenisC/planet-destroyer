import Achievement from './Achievement';
import { Scene } from './components/Overlay';
import Game from './Game';

export default class Epoch {
    public static readonly EPOCH_LEVEL = 100;
    public multipliers = {
        power: 1, cost: 1, score: 1,
        time: 1, reset: 1, speed: 1,
        epoch: 1
    };
    public penetrationChance = 0;
    public points = 0;
    public count = 0;

    public endEpoch() {
        const game = Game.instance!;

        if (this.count == 0) Achievement.unlock('First Epoch');

        this.count += 1;
        this.points += this.calculatePoints(game.level);
        game.reset();
        game.overlay.scene = Scene.Epoch;
        game.planet.shootRockets = false;
        game.target.canClick = false;

        if (this.points > 1_000_000) Achievement.unlock('Evolution');
    }

    public calculatePoints(level: number): number {
        return Math.round(Math.pow(level / Epoch.EPOCH_LEVEL, 2 + level / 1000) * this.multipliers.epoch);
    }

    public static calculateProgress(level: number): number {
        return Math.min(1, level / Epoch.EPOCH_LEVEL);
    }
}