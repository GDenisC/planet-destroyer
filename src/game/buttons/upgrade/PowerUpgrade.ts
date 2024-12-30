import Game from '../../Game';
import Upgrade from './Upgrade';

export default class PowerUpgrade extends Upgrade {
    public constructor() {
        super('Power', 100, 100);
    }

    public onPurchase(game: Game): void {
        game.planet.rocketPower *= 1.1;
        this.cost += this.cost / 5 * game.epoch.multipliers.cost;
    }

    public getDescription(): string[] {
        return [
            'x1.1 rocket power',
            'Current rocket power: ' + Game.format(Game.instance!.planet.rocketPower)
        ];
    }
}