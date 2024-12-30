import Entity from '../../Entity';
import Rocket from '../Rocket';
import { UI, UIContext } from './UI';

export default class PocketUI implements UI {
    public rocket: Rocket = null!;

    init(entity: Entity<{ base: Rocket }>): void {
        this.rocket = entity.getComponent('base');
    }

    public render(ctx: CanvasRenderingContext2D, ui: UIContext): void {
        let size = this.rocket.size * ui.winScale;

        ctx.translate(ui.x + this.rocket.x * ui.winScale, ui.y + this.rocket.y * ui.winScale);
        ctx.rotate(this.rocket.angle);

        ctx.beginPath();
        ctx.lineTo(size * 1.5, 0);
        ctx.lineTo(size * 0.4, size * 0.75);
        if (false) {
            ctx.lineTo(-size * 0.4, 0);
        } else {
            ctx.lineTo(-size * 0.75, size * 0.75);
            ctx.lineTo(-size * 2.25, size * 1.5 * 0.75);
            //ctx.lineTo(-size * 2, size * 0.75);
            ctx.lineTo(-size * 2, 0);
            ctx.lineTo(-size * 2.25, -size * 1.5 * 0.75);
            ctx.lineTo(-size * 0.75, -size * 0.75);
        }
        ctx.lineTo(size * 0.4, -size * 0.75);
        ctx.closePath();
        ctx.fillStyle = '#333';
        ctx.fill();

        ctx.resetTransform();
    }
}