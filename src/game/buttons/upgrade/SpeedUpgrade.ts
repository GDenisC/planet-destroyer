import Game from '../../Game';
import Upgrade from './Upgrade';

export default class SpeedUpgrade extends Upgrade {
    public constructor() {
        super('Speed', 100, 100);
    }

    public onPurchase(game: Game): void {
        if (this.level % 10 == 9) this.cost += this.cost * game.epoch.multipliers.cost;
        game.planet.rocketSpeed = Math.pow(game.planet.rocketSpeed * 1.45, 1.01);
        this.cost += this.cost * game.epoch.multipliers.cost;
    }

    public getDescription(): string[] {
        return [
            'x1.45 rocket speed (^1.01)',
            'Current rocket speed: ' + Game.format(Game.instance!.planet.rocketSpeed, 1)
        ];
    }
}