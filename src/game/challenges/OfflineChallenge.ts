import Game from '../Game';
import Challenge from './Challenge';

export default class OfflineChallenge extends Challenge {
    public constructor() {
        super('Offline', 'Target and buttons are disabled', '2x button reload');
    }

    public onStart(game: Game): void {
        game.target.canClick = false;
        game.overlay.rocketButtonsEnabled = false;
    }

    public onReward(game: Game): void {
        // typescript will compile this into for i loops
        for (let layer of game.overlay.rocketButtons) {
            for (let rocket of layer) {
                rocket.reloadTime /= 2;
            }
        }
    }

    public onEnd(game: Game): void {
        game.target.canClick = true;
        game.overlay.rocketButtonsEnabled = true;
    }
}