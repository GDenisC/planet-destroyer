import Button from '../Button';
import Challenge from '../challenges/Challenge';
import { UIContext } from '../components/ui/UI';

export default class ChallengeBtn extends Button {
    public level = 0;

    public constructor(public readonly challenge: Challenge) {
        super('START', {
            width: 120,
            height: 40,
            fontSize: 28,
            fontColor: '#fff',
            strokeWidth: 4,
            strokeColor: 'rgb(255, 55, 55)',
            overStrokeColor: 'rgb(221, 61, 61)',
            pressStrokeColor: 'rgb(255, 106, 106)',
            rounding: 20
        });
    }

    public render(ctx: CanvasRenderingContext2D, ui: UIContext): void {
        let measure = this.measure(ui),
            width = ui.width / 2,
            textOffset = 20 * ui.winScale,
            height = 60 * ui.winScale;

        this.options.offsetX = width / 2 / ui.winScale;

        ctx.beginPath();
        ctx.roundRect(
            measure.x - 20 * ui.winScale,
            measure.y - 20 * ui.winScale,
            measure.w + width + 20 * ui.winScale,
            measure.h + height,
            16
        );
        ctx.closePath();
        ctx.fillStyle = 'rgba(42, 5, 5, 0.5)';
        ctx.fill();

        ctx.textBaseline = 'middle';

        ctx.font = 36 * ui.winScale + 'px Ubuntu';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.challenge.name + ' Challenge ', measure.x + 140 * ui.winScale, measure.y + textOffset);

        ctx.font = 24 * ui.winScale + 'px Ubuntu';
        ctx.textAlign = 'right';
        ctx.fillText(
            this.challenge.completed
                ? 'Completed in ' + this.challenge.completedTime!.toFixed(0) + 's'
                : 'Uncompleted',
            measure.x + width + 80 * ui.winScale, measure.y + textOffset * 1.5
        );

        ctx.font = 18 * ui.winScale + 'px Ubuntu';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ddd';
        ctx.fillText(this.challenge.description + '. Reward: ' + this.challenge.reward, measure.x, measure.y + textOffset + 40 * ui.winScale);

        super.render(ctx, ui);
    }

    public onClick(): void {
        this.challenge.start();
    }
}