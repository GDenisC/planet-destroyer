import Button from '../Button';
import Game from '../Game';

export default class PlayBtn extends Button {
    public constructor() {
        super('PLAY', {
            offsetY: 100,
            screenX: 0.5,
            screenY: 0.5,
            width: 300,
            height: 40,
            fontSize: 26,
            fontColor: '#fff',
            strokeWidth: 4,
            strokeColor: 'hsl(199, 64%, 71%)',
            overStrokeColor: 'hsl(200, 100%, 86%)',
            pressStrokeColor: 'hsl(199, 53%, 76%)',
            rounding: 20
        });
    }

    public onClick(): void {
        Game.instance!.planet.shootRockets = true;
        this.hidden = true;
    }
}