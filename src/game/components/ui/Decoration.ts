import Entity from '../../Entity';
import Game from '../../Game';
import Decoration, { DecorationType } from '../Decoration';
import { UI, UIContext } from './UI';

export default class DecorationUI implements UI {
    private decoration: Decoration = null!;

    public init(entity: Entity<{ base: Decoration }>): void {
        this.decoration = entity.getComponent('base');
    }

    public render(ctx: CanvasRenderingContext2D, ui: UIContext) {
        let planet = Game.instance!.planet,
            scale = ui.winScale / planet.scale,
            size = this.decoration.size * scale;

        ctx.translate(ui.x + this.decoration.x * ui.winScale, ui.y + this.decoration.y * ui.winScale);
        if (this.decoration.type == DecorationType.Tree) ctx.rotate(this.decoration.angle);

        ctx.fillStyle = planet.layers[0].color || '#ddd';

        switch (this.decoration.type) {
            case DecorationType.Hill:
                ctx.beginPath();
                ctx.arc(0, 0, this.decoration.size * scale, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.fill();
                break;
            case DecorationType.Tree:
                ctx.beginPath();
                ctx.lineTo(size * 2, 0);
                ctx.lineTo(-size * 0.1, size * 0.75);
                ctx.lineTo(-size * 0.1, -size * 0.75);
                ctx.closePath();
                ctx.fill();
                break;
        }

        ctx.resetTransform();
    }
}