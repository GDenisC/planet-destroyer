import Game from '../../Game';
import Upgrade from './Upgrade';

export default class LessIntervalUpgrade extends Upgrade {
    public constructor() {
        super('Less Interval', 100, 50);
    }

    public onPurchase(game: Game): void {
        game.planet.rocketInterval *= 0.95;
        this.cost += this.cost / 1.5 * game.epoch.multipliers.cost;
    }

    public getDescription(): string[] {
        return [
            'Decreases the rocket interval by x0.95',
            'Current rocket interval: ' + (Game.instance!.planet.rocketInterval * 1000).toFixed(1) + 'ms',
        ];
    }
}