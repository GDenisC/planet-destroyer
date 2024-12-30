import Game from '../../Game';
import Upgrade from './Upgrade';

export default class GravityUpgrade extends Upgrade {
    public constructor() {
        super('Gravity', 100, 10);
    }

    public onPurchase(game: Game): void {
        game.planet.rocketGravity += 1;
        this.cost *= 2 * game.epoch.multipliers.cost;
    }

    public getDescription(): string[] {
        return [
            '+1 rocket gravity per upgrade',
            'to the planet. Grows geometrically!',
            'Rockets will damage more if they are closer',
            'Current rocket gravity: ' + Game.instance!.planet.rocketGravity.toFixed(0)
        ];
    }
}