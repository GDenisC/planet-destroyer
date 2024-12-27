import Component from '../components/Component';

export interface UIContext {
    x: number;
    y: number;
    width: number;
    height: number;
    winScale: number;
}

export interface UI extends Component {
    render(ctx: CanvasRenderingContext2D, ui: UIContext): void;
}