import { CursorStyle } from '../Canvas';
import { UIContext } from './components/ui/UI';
import Game from './Game';

export default class Button {
    public mouseOver = false;
    public isPressed = false;
    private clicked = false;

    public constructor(
        public offsetX: number, public offsetY: number,
        public screenX: number, public screenY: number,
        public width: number, public height: number, public onClick: () => void
    ) {}

    public update() {
        this.mouseOver = this.isMouseOver();
        this.isPressed = this.mouseOver && Game.mouse.click;

        if (this.mouseOver) {
            Game.instance!.app.setCursorStyle(CursorStyle.Pointer);
            if (this.isPressed && !this.clicked) {
                this.onClick();
                this.clicked = true;
            }
        } else {
            this.clicked = false;
        }
    }

    public render(
        ctx: CanvasRenderingContext2D, ui: UIContext,
        fillColor: string, overFillColor: string, pressFillColor: string, separatorAlpha: number,
        strokeWidth: number, strokeColor: string, overStrokeColor: string, pressStrokeColor: string,
        rounding: number
    ) {
        let x = this.offsetX * ui.winScale + this.screenX * ui.width,
            y = this.offsetY * ui.winScale + this.screenY * ui.height,
            w = this.width * ui.winScale,
            h = this.height * ui.winScale,
            r = rounding * ui.winScale,
            width = strokeWidth * ui.winScale * 2;

        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.closePath();

        if (width) {
            ctx.strokeStyle = this.isPressed ? pressStrokeColor : this.mouseOver ? overStrokeColor : strokeColor;
            ctx.lineWidth = width;
            ctx.stroke();
        }

        ctx.fillStyle = this.isPressed ? pressFillColor : this.mouseOver ? overFillColor : fillColor;
        ctx.fill();

        if (!separatorAlpha) return;

        ctx.beginPath();
        ctx.roundRect(x, y + h / 3 * 2, w, h / 3, r);
        ctx.closePath();

        ctx.globalAlpha = separatorAlpha;

        if (width) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = width;
            ctx.stroke();
        }

        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    private isMouseOver(): boolean {
        let mouse = Game.mouse,
            w = this.width / 2,
            h = this.height / 2;

        return (
            mouse.x > this.offsetX - w &&
            mouse.x < this.offsetX + w &&
            mouse.y > this.offsetY - h &&
            mouse.y < this.offsetY + h
        );
    }
}