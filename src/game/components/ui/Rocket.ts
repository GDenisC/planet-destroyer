import Entity from '../../Entity';
import Rocket from '../Rocket';
import { UI, UIContext } from './UI';

export const enum RocketFlags {
    None = 0,
    Long = 1 << 0,
    Sharp = 1 << 1,
    Hammer = 1 << 2,
    White = 1 << 3,
    Triangle = 1 << 4,
    Longer = 1 << 5
}

export default class RocketUI implements UI {
    public rocket: Rocket = null!;

    init(entity: Entity<{ base: Rocket }>): void {
        this.rocket = entity.getComponent('base');
    }

    public render(ctx: CanvasRenderingContext2D, ui: UIContext): void {
        RocketUI.renderDummy(
            ctx,
            this.rocket.size * ui.winScale,
            ui.x + this.rocket.x * ui.winScale,
            ui.y + this.rocket.y * ui.winScale,
            this.rocket.angle,
            this.rocket.flags
        );
    }

    public static renderDummy(ctx: CanvasRenderingContext2D, size: number, x: number, y: number, angle: number, flags: number) {
        let long = (flags & RocketFlags.Long) != 0,
            sharp = (flags & RocketFlags.Sharp) != 0,
            hammer = (flags & RocketFlags.Hammer) != 0,
            white = (flags & RocketFlags.White) != 0,
            triangle = (flags & RocketFlags.Triangle) != 0,
            longer = (flags & RocketFlags.Longer) != 0;

        ctx.translate(x, y);
        ctx.rotate(angle);

        let h = 1;

        if (long) h *= 1.25;
        if (longer) h *= 1.5;

        ctx.beginPath();
        ctx.lineTo(size * 1.5 * h, 0);
        ctx.lineTo(size * 0.4 * h, size * 0.75);
        if (triangle) {}
        else if (sharp) {
            ctx.lineTo(-size * 0.4 * h, 0);
        } else {
            ctx.lineTo(-size * 0.75 * h, size * 0.75);
            ctx.lineTo(-size * 2.25 * h, size * 1.5 * 0.75);
            if (!hammer) ctx.lineTo(-size * 2 * h, 0);
            ctx.lineTo(-size * 2.25 * h, -size * 1.5 * 0.75);
            ctx.lineTo(-size * 0.75 * h, -size * 0.75);
        }
        ctx.lineTo(size * 0.4 * h, -size * 0.75);
        ctx.closePath();
        ctx.fillStyle = white ? '#ddd' : '#333';
        ctx.fill();

        ctx.resetTransform();
    }
}