import Planet from '../../components/Planet';
import Game from '../../Game';
import EpochUpgrade from './EpochUpgrade';

export default class PlanetResetUpgrade extends EpochUpgrade {
    public constructor() {
        super('Faster Reset', 'x0.8', 1);
    }

    public onPurchase(game: Game): void {
        game.epoch.multipliers.reset *= 0.8;
        game.epoch.multipliers.speed *= 1.1;
        this.cost *= 2;
    }

    public getDescription(): string {
        return 'Decrease planet\'s reset by 20% each upgrade. Current reset time is ' + (Planet.DEATH_TIME * Game.instance!.epoch.multipliers.reset * 1000).toFixed(0) + 'ms. Also buffs rockets speed by x1.1';
    }
}