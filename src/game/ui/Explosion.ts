import Entity from '../Entity';
import Game from '../Game';
import Explosion from '../components/Explosion';
import { UI, UIContext } from './UI';

export default class ExplosionUI implements UI {
    private explosion: Explosion = null!;

    public init(entity: Entity<{ base: Explosion }>): void {
        this.explosion = entity.getComponent('base');
    }

    public render(ctx: CanvasRenderingContext2D, ui: UIContext) {
        let scale = Game.instance!.planet.scale;
        ctx.beginPath();
        ctx.arc(ui.x + this.explosion.x * ui.winScale, ui.y + this.explosion.y * ui.winScale, this.explosion.size / scale * ui.winScale, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = this.explosion.alpha();
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}