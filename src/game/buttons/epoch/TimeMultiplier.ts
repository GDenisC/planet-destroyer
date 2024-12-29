import Game from '../../Game';
import EpochUpgrade from './EpochUpgrade';

export default class TimeMultiplier extends EpochUpgrade {
    public constructor() {
        super('Time', '+0.1', 1);
    }

    public onPurchase(game: Game): void {
        game.epoch.multipliers.time += 0.1;
        this.cost *= 2;
    }

    public getDescription(): string {
        return 'Speed up the time. Current time multiplier is ' + Game.instance!.epoch.multipliers.time.toFixed(1)
    }
}