import Entity from '../../Entity';
import Target from '../Target';
import { UI, UIContext } from './UI';

export default class TargetUI implements UI {
    private static readonly PATH = new Path2D('M.2952-.0401V-.2993H.036v.1074H-.0401V-.2993H-.2993v.2592h.1074V.036H-.2993V.2952h.2592V.1878H.036V.2952H.2952V.036H.1878V-.0401H.2952Zm.0713 0H.4958V.036H.3665V.3665H.036V.4958H-.0401V.3665H-.3707V.036H-.5V-.0401h.1293V-.3707h.3306V-.5H.036v.1293H.3665v.3305Z');
    private target: Target = null!;

    public init(entity: Entity<{ base: Target }>): void {
        this.target = entity.getComponent('base');
    }

    public render(ctx: CanvasRenderingContext2D, ui: UIContext) {
        if (this.target.hidden) return;
        let size = 150 * ui.winScale;
        ctx.translate(this.target.x, this.target.y);
        ctx.scale(size, size);
        ctx.globalAlpha = this.target.alpha();
        ctx.fillStyle = '#fff';
        ctx.fill(TargetUI.PATH);
        ctx.globalAlpha = 1;
        ctx.resetTransform();
    }
}