import Game from '../../Game';
import EpochUpgrade from './EpochUpgrade';

export default class PenetrationChance extends EpochUpgrade {
    public constructor() {
        super('Penetration', '+2%', 1);
    }

    public onPurchase(game: Game): void {
        // fun fact: you can have more than 100% penetration
        game.epoch.penetrationChance += 0.02;
        this.cost *= 2;
    }

    public getDescription(): string {
        return 'Increase the change of rocket to penetrate the planet by 2%. Current penetration chance is ' + (Game.instance!.epoch.penetrationChance * 100).toFixed(0) + '%';
    }
}