import Button from '../Button';
import { Scene } from '../components/Overlay';
import Game from '../Game';

// almost same as PlayBtn
export default class EpochBtn extends Button {
    public constructor() {
        super('UPGRADES', {
            offsetX: -170,
            offsetY: 40,
            screenX: 1,
            width: 300,
            height: 40,
            fontSize: 26,
            fontColor: '#fff',
            strokeWidth: 4,
            strokeColor: 'rgb(218, 255, 55)',
            overStrokeColor: 'rgb(191, 221, 61)',
            pressStrokeColor: 'rgb(228, 255, 106)',
            rounding: 20
        });
    }

    public onClick(): void {
        Game.instance!.overlay.scene = Scene.Epoch;
    }
}