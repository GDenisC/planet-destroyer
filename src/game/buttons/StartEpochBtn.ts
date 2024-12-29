import Button from '../Button';
import { Scene } from '../components/Overlay';
import Game from '../Game';

// almost same as PlayBtn
export default class NewEpochBtn extends Button {
    public constructor() {
        super('START', {
            offsetY: -60,
            screenX: 0.5,
            screenY: 1,
            width: 300,
            height: 40,
            fontSize: 26,
            fontColor: '#fff',
            strokeWidth: 4,
            strokeColor: 'rgb(218, 255, 55)',
            overStrokeColor: 'rgb(191, 221, 61)',
            pressStrokeColor: 'rgb(228, 255, 106)',
            rounding: 12
        });
    }

    public onClick(): void {
        const game = Game.instance!;
        game.planet.shootRockets = true;
        game.overlay.scene = Scene.Game;
    }
}