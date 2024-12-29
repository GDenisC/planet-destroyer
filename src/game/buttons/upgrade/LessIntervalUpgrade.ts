import Game from '../../Game';
import Upgrade from './Upgrade';

export default class LessIntervalUpgrade extends Upgrade {
    public constructor() {
        super('Less Interval', 100, 5);
    }

    public onPurchase(game: Game): void {
        game.planet.rocketInterval /= Math.pow(2, 1 + this.level / 10);
        this.cost *= 2;
    }

    public getDescription(): string[] {
        return [
            'Decreases the rocket interval by ' + (Math.pow(2, 1 + this.level / 10) * 100).toFixed(1) + '%',
            'Current rocket interval: ' + (Game.instance!.planet.rocketInterval * 1000).toFixed(1) + 'ms',
        ];
    }
}