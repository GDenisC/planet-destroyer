import Planet from '../Planet';
import Entity from '../../Entity';
import { UI, UIContext } from './UI';

export default class PlanetUI implements UI {
    public planet: Planet = null!;

    init(entity: Entity<{ base: Planet }>): void {
        this.planet = entity.getComponent('base');
    }

    public render(ctx: CanvasRenderingContext2D, ui: UIContext): void {
        for (let i = 0, l = this.planet.layers.length; i < l; ++i) {
            let layer = this.planet.layers[i];
            ctx.beginPath();
            ctx.arc(ui.x, ui.y, layer.radius * ui.winScale, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fillStyle = layer.color;
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(ui.x, ui.y, this.planet.centerAreaRadius() * ui.winScale, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = '#e66';
        ctx.fill();
    }
}