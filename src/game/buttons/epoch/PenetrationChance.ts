import Game from '../../Game';
import EpochUpgrade from './EpochUpgrade';

export default class PenetrationChance extends EpochUpgrade {
    public constructor() {
        super('Penetration', '+1%', 1);
    }

    public onPurchase(game: Game): void {
        // fun fact: you can have more than 100% penetration
        game.epoch.penetrationChance += 0.01;
        this.cost *= 2;
    }

    public getDescription(): string {
        return 'Increase the change of rocket to penetrate the planet by 1%. Current penetration chance is ' + Game.instance!.epoch.penetrationChance * 100 + '%';
    }
}