import Button from '../Button';
import { Scene } from '../components/Overlay';
import Game from '../Game';

// almost same as PlayBtn
export default class ChallengesBtn extends Button {
    public constructor() {
        super('CHALLENGES', {
            offsetX: -170,
            offsetY: 40,
            screenX: 1,
            width: 300,
            height: 40,
            fontSize: 26,
            fontColor: '#fff',
            strokeWidth: 4,
            strokeColor: 'hsl(0, 64%, 71%)',
            overStrokeColor: 'hsl(0, 100%, 86%)',
            pressStrokeColor: 'hsl(0, 41.00%, 69.40%)',
            rounding: 20
        });
    }

    public onClick(): void {
        Game.instance!.overlay.scene = Scene.Challenges;
    }
}