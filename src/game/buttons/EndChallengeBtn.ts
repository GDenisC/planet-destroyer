import Button from '../Button';
import { Scene } from '../components/Overlay';
import Game from '../Game';

// almost same as PlayBtn
export default class EndChallengeBtn extends Button {
    public constructor() {
        super('END CHALLENGE', {
            offsetX: -170,
            offsetY: 80,
            screenX: 1,
            width: 300,
            height: 40,
            fontSize: 26,
            fontColor: '#fff',
            strokeWidth: 4,
            strokeColor: 'rgb(255, 55, 55)',
            overStrokeColor: 'rgb(221, 61, 61)',
            pressStrokeColor: 'rgb(255, 106, 106)',
            rounding: 12
        });
    }

    public onClick(): void {
        const game = Game.instance!;
        game.epoch.currentChallenge?.end(false);
        game.overlay.scene = Scene.Game;
    }
}