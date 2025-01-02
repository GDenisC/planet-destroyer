import Game from '../Game';
import Challenge from './Challenge';

export default class ActiveChallenge extends Challenge {
    public constructor() {
        super('Active', 'Auto rockets are disabled', '2x rocket reload');
    }

    public onStart(game: Game): void {
        game.planet.shootRockets = false;
    }

    public onReward(game: Game): void {
        game.epoch.multipliers.interval /= 2;
    }

    public onEnd(game: Game): void {
        game.planet.shootRockets = true;
    }
}