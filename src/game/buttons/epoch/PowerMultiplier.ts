import Game from '../../Game';
import EpochUpgrade from './EpochUpgrade';

export default class PowerMultiplier extends EpochUpgrade {
    public constructor() {
        super('Power', '+1', 1);
    }

    public onPurchase(game: Game): void {
        game.epoch.multipliers.power += 1;
        this.cost *= 2;
    }

    public getDescription(): string {
        return 'Increase the power multiplier by 1. Current power multiplier is ' + Game.instance!.epoch.multipliers.power;
    }
}