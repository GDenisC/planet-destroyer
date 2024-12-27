import Application from '../../Application';
import PlanetHit from '../components/PlanetHit';
import Entity from '../Entity';
import Game from '../Game';
import { UI, UIContext } from './UI';

export default class PlanetHitUI implements UI {
    private app: Application = null!;
    private hit: PlanetHit = null!;

    public init(entity: Entity<{ base: PlanetHit }>): void {
        this.app = entity.app;
        this.hit = entity.getComponent('base');
    }

    public render(ctx: CanvasRenderingContext2D, ui: UIContext) {
        let scale = Game.instance!.planet.scale;
        ctx.beginPath();
        ctx.arc(ui.x + this.hit.x * ui.winScale, ui.y + this.hit.y * ui.winScale, this.hit.size / scale * ui.winScale, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = this.app.backgroundColor;
        ctx.fill();
    }
}