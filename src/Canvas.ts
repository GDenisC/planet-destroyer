import Tag from './Tag';

export const enum CursorStyle {
    Default = 'default',
    Pointer = 'pointer'
}

export default class Canvas extends Tag<HTMLCanvasElement> {
    public cachedWidth: number = 0;
    public cachedHeight: number = 0;
    public windowScale: number = 1;
    public ctx: CanvasRenderingContext2D;

    public constructor() {
        super('canvas');
        this.ctx = this.html.getContext('2d') as CanvasRenderingContext2D;
        this.html.addEventListener('contextmenu', e => e.preventDefault());
    }

    public resize(width: number, height: number, ratio: number) {
        width *= ratio;
        height *= ratio;

        this.html.width = this.cachedWidth = width;
        this.html.height = this.cachedHeight = height;

        this.windowScale = Math.max(width / 1920, height / 1080);
    }

    public setCursorStyle(style: CursorStyle) {
        this.html.style.cursor = style;
    }
}