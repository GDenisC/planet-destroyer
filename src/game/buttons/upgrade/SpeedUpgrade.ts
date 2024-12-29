import Game from '../../Game';
import Upgrade from './Upgrade';

export default class SpeedUpgrade extends Upgrade {
    public constructor() {
        super('Speed', 100, 10);
    }

    public onPurchase(game: Game): void {
        game.planet.rocketSpeed *= 2;
        this.cost *= 2;
    }

    public getDescription(): string[] {
        return [
            '2x rocket speed',
            'Current rocket speed: ' + Game.instance!.planet.rocketSpeed
        ];
    }
}