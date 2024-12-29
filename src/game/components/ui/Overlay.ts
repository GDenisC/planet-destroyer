import Entity from '../../Entity';
import Epoch from '../../epoch/Epoch';
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

        this.renderEpochGain(ctx, ui, Epoch.calculateProgress(game.level), game);
    }

    private renderEpochGain(ctx: CanvasRenderingContext2D, ui: UIContext, progress: number, game: Game) {
        if (progress < 0.5) return;

        const progressBarSize = 400 * ui.winScale;

        ctx.beginPath();
        ctx.roundRect(ui.width / 2 - progressBarSize / 2, 94 * ui.winScale, progressBarSize, 16 * ui.winScale, 8 * ui.winScale);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(ui.width / 2 - progressBarSize / 2, 94 * ui.winScale, progressBarSize * progress, 16 * ui.winScale, 8 * ui.winScale);
        ctx.closePath();
        ctx.fillStyle = 'rgb(218, 255, 55)';
        ctx.fill();

        if (progress < 1) return;

        ctx.font = 16 * ui.winScale + 'px Ubuntu';
        ctx.fillStyle = '#222';
        ctx.fillText(Epoch.calculatePoints(game.level) + ' EP gain', ui.width / 2, 94 * ui.winScale + 16 * ui.winScale / 2);
    }
}