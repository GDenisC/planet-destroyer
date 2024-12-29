import Game from '../../Game';
import EpochUpgrade from './EpochUpgrade';

export default class PlanetResetUpgrade extends EpochUpgrade {
    public constructor() {
        super('Faster Reset', 'x0.9', 1);
    }

    public onPurchase(game: Game): void {
        game.epoch.multipliers.reset *= 0.9;
        this.cost *= 2;
    }

    public getDescription(): string {
        return 'Decrease planet\'s reset by 10% each upgrade. Current reset multiplier is ' + Game.instance!.epoch.multipliers.reset.toFixed(3)
    }
}