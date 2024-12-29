import Button from '../../Button';
import { UIContext } from '../../components/ui/UI';
import Game from '../../Game';

export default abstract class Upgrade extends Button {
    protected cachedDescription: string[] = [];
    public level = 1;

    public constructor(public readonly name: string, public cost: number, public readonly maxLevel: number) {
        super('BUY', {
            screenY: 1,
            width: 120,
            height: 42,
            fontSize: 28,
            fontColor: '#fff',
            strokeWidth: 4,
            strokeColor: 'hsl(199, 64%, 71%)',
            overStrokeColor: 'hsl(200, 100%, 86%)',
            pressStrokeColor: 'hsl(199, 53%, 76%)',
            rounding: 20
        });
    }

    public render(ctx: CanvasRenderingContext2D, ui: UIContext): void {
        if (this.cachedDescription.length == 0)
            this.cachedDescription = this.getDescription();

        let measure = this.measure(ui),
            width = 180 * ui.winScale,
            description = this.getDescription(),
            descLength = 20 * description.length * ui.winScale,
            textOffset = 60 * ui.winScale,
            height = 90 * ui.winScale;

        ctx.beginPath();
        ctx.roundRect(
            measure.x - width / 2,
            measure.y - height - descLength,
            measure.w + width,
            measure.h + height + descLength * 2,
            [16, 16, 0, 0]
        );
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fill();

        ctx.font = 36 * ui.winScale + 'px Ubuntu';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#eee';
        ctx.fillText(this.name + ' [' + this.level + ']', measure.x + textOffset, measure.y - descLength - 60 * ui.winScale);

        ctx.font = 18 * ui.winScale + 'px Ubuntu';
        ctx.fillStyle = '#ddd';
        ctx.fillText(this.level == this.maxLevel ? 'MAX' : 'Cost: ' + this.cost.toFixed(0), measure.x + textOffset, measure.y - descLength - 28 * ui.winScale);

        ctx.fillStyle = '#ddd';
        ctx.font = 12 * ui.winScale + 'px Ubuntu';
        for (let i = description.length - 1; i >= 0; --i) {
            ctx.fillText(description[i], measure.x + textOffset, measure.y - 25 * ui.winScale - 20 * i * ui.winScale);
        }

        super.render(ctx, ui);
    }

    public onClick(): void {
        const game = Game.instance!;

        if (game.score < this.cost || this.level >= this.maxLevel) return;
        game.score -= this.cost;
        this.onPurchase(Game.instance!);
        this.level += 1;
        this.cachedDescription = this.getDescription();
        if (this.level == this.maxLevel) this.text = 'MAX';
    }

    public abstract onPurchase(game: Game): void;
    public abstract getDescription(): string[];
}