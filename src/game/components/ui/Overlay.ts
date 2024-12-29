import Entity from '../../Entity';
import Game from '../../Game';
import Overlay, { Scene } from '../Overlay';
import { UI, UIContext } from './UI';

export default class OverlayUI implements UI {
    private overlay: Overlay = null!;

    public init(entity: Entity<{ base: Overlay }>): void {
        this.overlay = entity.getComponent('base');
    }

    public render(ctx: CanvasRenderingContext2D, ui: UIContext) {
        switch (this.overlay.scene) {
            case Scene.Menu:
                this.renderMenu(ctx, ui);
                break;
            case Scene.Game:
                this.renderGame(ctx, ui);
                break;
            case Scene.Epoch:
                break;
        }
    }

    private renderMenu(ctx: CanvasRenderingContext2D, ui: UIContext) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, ui.width, ui.height);

        let logo = this.overlay.logoImage,
            logoSize = 400 * ui.winScale;

        if (logo.complete) ctx.drawImage(
            logo,
            ui.x - logoSize / 2,
            ui.y - logoSize / 2 - 150 * ui.winScale,
            logoSize, logoSize
        );

        this.overlay.play.render(ctx, ui);
    }

    private renderGame(ctx: CanvasRenderingContext2D, ui: UIContext) {
        const game = Game.instance!;

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

        for (let i = 0, l = this.overlay.upgrades.length; i < l; ++i) {
            let upgrade = this.overlay.upgrades[i];
            upgrade.options.offsetY = -40;
            upgrade.options.offsetX = 180 + i * 340;
            upgrade.render(ctx, ui);
        }
    }
}