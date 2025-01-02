import Game from '../../Game';
import Upgrade from './Upgrade';

export default class GravityUpgrade extends Upgrade {
    public constructor() {
        super('Gravity', 100, 50);
    }

    public onPurchase(game: Game): void {
        game.planet.rocketGravity += 0.2;
        this.cost += this.cost / 3 * game.epoch.multipliers.cost;
    }

    public getDescription(): string[] {
        return [
            '+0.2 rocket gravity per upgrade',
            'to the planet. Grows geometrically!',
            'Rockets will damage more if they are closer',
            'Current rocket gravity: ' + Game.instance!.planet.rocketGravity.toFixed(1)
        ];
    }
}