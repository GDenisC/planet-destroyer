import Game from '../Game';
import Challenge from './Challenge';

export default class EpochChallenge extends Challenge {
    public constructor() {
        super('Epoch', 'Epoch gain x0.1 (starts from level 500) and rockets are 10x slower', '+2 level per level');
    }

    public onStart(game: Game): void {
        game.epoch.multipliers.epoch *= 0.1;
        game.epoch.multipliers.speed /= 10;
    }

    public onReward(game: Game): void {
        game.epoch.multipliers.level += 1
    }

    public onEnd(game: Game): void {
        game.epoch.multipliers.epoch /= 0.1;
        game.epoch.multipliers.speed *= 10;
    }
}