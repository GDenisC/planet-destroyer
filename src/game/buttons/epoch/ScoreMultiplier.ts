import Game from '../../Game';
import EpochUpgrade from './EpochUpgrade';

export default class ScoreMultiplier extends EpochUpgrade {
    public constructor() {
        super('Score', '+1', 1);
    }

    public onPurchase(game: Game): void {
        game.epoch.multipliers.score += 1;
        this.cost *= 2;
    }

    public getDescription(): string {
        return 'Increase score (income) multiplier by 1. Current score multiplier is ' + Game.instance!.epoch.multipliers.score;
    }
}