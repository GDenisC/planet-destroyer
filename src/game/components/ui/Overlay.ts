import Entity from '../../Entity';
import Game from '../../Game';
import Overlay from '../Overlay';
import { UI, UIContext } from './UI';

export default class OverlayUI implements UI {
    private overlay: Overlay = null!;

    public init(entity: Entity<{ base: Overlay }>): void {
        this.overlay = entity.getComponent('base');
    }

    public render(ctx: CanvasRenderingContext2D, ui: UIContext) {
        let overlay = this.overlay,
            game = Game.instance!;

        if (!overlay.play.hidden) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, ui.width, ui.height);

            let logo = overlay.logoImage,
                logoSize = 400 * ui.winScale;

            if (logo.complete) ctx.drawImage(
                logo,
                ui.x - logoSize / 2,
                ui.y - logoSize / 2 - 150 * ui.winScale,
                logoSize, logoSize
            );

            overlay.play.render(ctx, ui);
            return;
        }

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, ui.width, 40 * ui.winScale);

        ctx.fillStyle = '#fff';
        ctx.font = 26 * ui.winScale + 'px Ubuntu';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('PLANET DESTROYER', 7 * ui.winScale, 20 * ui.winScale);
        ctx.textAlign = 'center';
        ctx.fillText(game.score.toFixed(0) + ' score', ui.width / 2, 20 * ui.winScale);
        ctx.font = 36 * ui.winScale + 'px Ubuntu';
        ctx.fillText('Level ' + game.level, ui.width / 2, 72 * ui.winScale);

        //overlay.upgrades.render(
        //    ctx, ui, 'Upgrades', 18, '#fff',
        //    4, 'hsl(199, 64%, 71%)', 'hsl(200, 100%, 86%)', 'hsl(199, 53%, 76%)', 22
        //);

        for (let i = 0, l = overlay.upgrades.length; i < l; ++i) {
            let upgrade = overlay.upgrades[i];
            upgrade.options.offsetY = -40;
            upgrade.options.offsetX = 180 + i * 340;
            upgrade.render(ctx, ui);
        }
    }
}