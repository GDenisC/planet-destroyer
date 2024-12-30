import Game from '../../Game';
import Upgrade from './Upgrade';

export default class SpeedUpgrade extends Upgrade {
    public constructor() {
        super('Speed', 100, 100);
    }

    public onPurchase(game: Game): void {
        if (this.level % 10 == 9) this.cost *= 10;
        game.planet.rocketSpeed *= 2;
        this.cost *= 2;
        this.cost *= game.epoch.multipliers.cost;
    }

    public getDescription(): string[] {
        return [
            '2x rocket speed',
            'Current rocket speed: ' + Game.format(Game.instance!.planet.rocketSpeed)
        ];
    }
}