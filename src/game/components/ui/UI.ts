import Component from '../Component';

export interface UIContext {
    x: number;
    y: number;
    width: number;
    height: number;
    winScale: number;
    dt: number;
}

export interface UI extends Component {
    render(ctx: CanvasRenderingContext2D, ui: UIContext): void;
}