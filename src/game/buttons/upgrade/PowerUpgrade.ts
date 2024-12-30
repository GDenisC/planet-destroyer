import Game from '../../Game';
import Upgrade from './Upgrade';

export default class PowerUpgrade extends Upgrade {
    public constructor() {
        super('Power', 100, 10);
    }

    public onPurchase(game: Game): void {
        game.planet.rocketPower *= 2;
        this.cost *= 2 * game.epoch.multipliers.cost;
    }

    public getDescription(): string[] {
        return [
            '2x rocket power',
            'Current rocket power: ' + Game.format(Game.instance!.planet.rocketPower)
        ];
    }
}