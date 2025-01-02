import { CursorStyle } from '../Canvas';
import { UIContext } from './components/ui/UI';
import Game from './Game';

export interface ButtonOptions {
    offsetX: number,
    offsetY: number,
    screenX: number,
    screenY: number,
    width: number,
    height: number,
    fontSize: number,
    fontColor: string,
    strokeWidth: number,
    strokeColor: string,
    overStrokeColor: string,
    pressStrokeColor: string,
    rounding: number,
    fillStyle: string
}

export default abstract class Button {
    public readonly options: ButtonOptions;
    public mouseOver = false;
    public isPressed = false;
    public hidden = false;

    private static readonly textCache = new Map<string, [TextMetrics, HTMLCanvasElement]>();
    private clicked = false;

    public constructor(public text: string, options: Partial<ButtonOptions>) {
        this.options = Object.assign({
            offsetX: 0,
            offsetY: 0,
            screenX: 0,
            screenY: 0,
            width: 150,
            height: 50,
            fontSize: 22,
            fontColor: '#fff',
            strokeWidth: 0,
            strokeColor: '#fff',
            overStrokeColor: '#fff',
            pressStrokeColor: '#fff',
            rounding: 0,
            fillStyle: 'rgba(0,0,0,0.5)'
        }, options);
    }

    public abstract onClick(): void;

    public render(ctx: CanvasRenderingContext2D, ui: UIContext) {
        if (this.hidden) return;

        let opt = this.options,
            measure = this.measure(ui);

        this.update(ui.width, ui.height, ui.winScale, measure.width / 2);

        ctx.beginPath();
        ctx.roundRect(measure.x, measure.y, measure.w, measure.h, measure.r);
        ctx.closePath();

        if (measure.width) {
            ctx.strokeStyle = this.isPressed ? opt.pressStrokeColor : this.mouseOver ? opt.overStrokeColor : opt.strokeColor;
            ctx.lineWidth = measure.width;
            ctx.stroke();
        }

        ctx.fillStyle = opt.fillStyle
        ctx.fill();

        if (!this.options.fontSize) return;

        let img = Button.getTextImageCached(this.text, opt.fontSize * ui.winScale, opt.fontColor);

        ctx.drawImage(img[1], measure.x + measure.w / 2 - img[0].width / 2, measure.y + measure.h / 2 - opt.fontSize * ui.winScale / 2);
    }

    public update(width: number, height: number, scale: number, strokeWidth: number) {
        this.mouseOver = this.isMouseOver(width, height, scale, strokeWidth);
        this.isPressed = this.mouseOver && Game.mouse.click;

        if (this.mouseOver) {
            Game.instance!.app.setCursorStyle(CursorStyle.Pointer);
            if (this.isPressed) {
                this.clicked = true;
            } else if (this.clicked) {
                this.onClick();
                this.clicked = false
            }
        } else {
            this.clicked = false;
        }
    }

    private isMouseOver(width: number, height: number, scale: number, strokeWidth: number): boolean {
        let mouse = Game.mouse,
            opt = this.options,
            w = (opt.width / 2 + strokeWidth) * scale,
            h = (opt.height / 2 + strokeWidth) * scale,
            x = opt.offsetX * scale + opt.screenX * width,
            y = opt.offsetY * scale + opt.screenY * height;

        return (
            mouse.x > x - w &&
            mouse.x < x + w &&
            mouse.y > y - h &&
            mouse.y < y + h
        );
    }

    protected measure(ui: UIContext) {
        let opt = this.options,
            w = opt.width * ui.winScale,
            h = opt.height * ui.winScale;

        return {
            w, h,
            x: opt.offsetX * ui.winScale + opt.screenX * ui.width - w / 2,
            y: opt.offsetY * ui.winScale + opt.screenY * ui.height - h / 2,
            r: opt.rounding * ui.winScale,
            width: opt.strokeWidth * ui.winScale * 2
        };
    }

    public static getTextImageCached(text: string, textSize: number, textColor: string): [TextMetrics, HTMLCanvasElement] {
        let cache = Button.textCache.get(text + textSize + textColor);
        if (cache) return cache;
        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        let ctx = canvas.getContext('2d')!;
        ctx.font = `${textSize}px Ubuntu`;
        let metrics = ctx.measureText(text);
        canvas.width = metrics.width;
        canvas.height = textSize;
        ctx.font = `${textSize}px Ubuntu`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor;
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        let output = [metrics, canvas] as [TextMetrics, HTMLCanvasElement];
        Button.textCache.set(text + textSize + textColor, output);
        return output ;
    }
}