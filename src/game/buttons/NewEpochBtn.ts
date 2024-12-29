import Button from '../Button';
import Game from '../Game';

export default class NewEpochBtn extends Button {
    public constructor() {
        super('NEW EPOCH', {
            offsetY: 108,
            screenX: 0.5,
            screenY: 0,
            width: 300,
            height: 24,
            fontSize: 20,
            fontColor: '#fff',
            strokeWidth: 4,
            strokeColor: 'rgb(218, 255, 55)',
            overStrokeColor: 'rgb(191, 221, 61)',
            pressStrokeColor: 'rgb(228, 255, 106)',
            rounding: 12
        });
    }

    public onClick(): void {
        Game.instance!.epoch.endEpoch();
    }
}