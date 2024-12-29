import Button from '../../Button';
import { UIContext } from '../../components/ui/UI';
import Game from '../../Game';

export default abstract class EpochUpgrade extends Button {
    public level = 0;

    public constructor(public readonly name: string, text: string, public cost: number) {
        super(text, {
            width: 120,
            height: 40,
            fontSize: 28,
            fontColor: '#fff',
            strokeWidth: 4,
            strokeColor: 'rgb(218, 255, 55)',
            overStrokeColor: 'rgb(191, 221, 61)',
            pressStrokeColor: 'rgb(228, 255, 106)',
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
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fill();

        ctx.font = 36 * ui.winScale + 'px Ubuntu';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';

        ctx.fillText(this.name + ' Upgrade [' + this.level + ']', measure.x + 300 * ui.winScale, measure.y + textOffset);

        ctx.font = 24 * ui.winScale + 'px Ubuntu';
        ctx.textAlign = 'right';
        ctx.fillText('Cost ' + this.cost.toFixed(0) + ' EP', measure.x + width + 80 * ui.winScale, measure.y + textOffset);

        ctx.font = 18 * ui.winScale + 'px Ubuntu';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ddd';
        ctx.fillText(this.getDescription(), measure.x, measure.y + textOffset + 40 * ui.winScale);

        super.render(ctx, ui);
    }

    public onClick(): void {
        const game = Game.instance!;

        if (game.epoch.points < this.cost) return;
        game.epoch.points -= this.cost;
        this.onPurchase(game);
        this.level += 1;
    }

    public abstract onPurchase(game: Game): void;
    public abstract getDescription(): string;
}