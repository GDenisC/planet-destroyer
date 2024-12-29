import Game from '../../Game';
import EpochUpgrade from './EpochUpgrade';

export default class CostMultiplier extends EpochUpgrade {
    public constructor() {
        super('Cost', '*0.9', 1);
    }

    public onPurchase(game: Game): void {
        game.epoch.multipliers.cost *= 0.9;
        this.cost *= 2;
    }

    public getDescription(): string {
        return 'Decrease all rocket\'s cost by 10% each upgrade. Current cost multiplier is ' + Game.instance!.epoch.multipliers.cost.toFixed(3);
    }
}