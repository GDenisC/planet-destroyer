import Entity from '../../Entity';
import Epoch from '../../Epoch';
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
                this.renderEpoch(ctx, ui);
                break;
            case Scene.Challenges:
                this.renderChallenges(ctx, ui);
                break;
        }
        this.renderAchievement(ctx, ui);
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
        ctx.fillText(Game.format(game.score) + ' score', ui.width / 2, 20 * ui.winScale);
        ctx.font = 36 * ui.winScale + 'px Ubuntu';
        ctx.fillText('Level ' + game.level, ui.width / 2, 72 * ui.winScale);

        let upgrades = this.overlay.upgrades;

        // upgrades are inlined
        upgrades[0].options.offsetX = 180;
        upgrades[0].options.offsetY = -40;
        upgrades[0].render(ctx, ui);

        upgrades[1].options.offsetX = 180 + 340;
        upgrades[1].options.offsetY = -40;
        upgrades[1].render(ctx, ui);

        upgrades[2].options.screenX = 1;
        upgrades[2].options.offsetX = -180 - 340;
        upgrades[2].options.offsetY = -40;
        upgrades[2].render(ctx, ui);

        upgrades[3].options.screenX = 1;
        upgrades[3].options.offsetX = -180;
        upgrades[3].options.offsetY = -40;
        upgrades[3].render(ctx, ui);

        this.renderEpochGain(ctx, ui, game.epoch.calculateProgress(game.level), game);
        this.renderRocketButtons(ctx, ui);

        if (game.epoch.isInChallenge()) this.overlay.endChallenge.render(ctx, ui);
    }

    private renderRocketButtons(ctx: CanvasRenderingContext2D, ui: UIContext) {
        if (!this.overlay.rocketButtonsEnabled) return;

        const buttons = this.overlay.rocketButtons;

        let w = 80+4,
            h = 80+4,
            l = buttons.length;

        for (let i = 0; i < l; ++i) {
            let k = buttons[i].length,
                fw = w * k;

            for (let j = 0; j < k; ++j) {
                let button = buttons[i][j];
                button.options.offsetX = (j+0.5) * w - fw / 2;
                button.options.offsetY = -(i+0.75) * h;
                button.render(ctx, ui);
            }
        }
    }

    private renderEpochGain(ctx: CanvasRenderingContext2D, ui: UIContext, progress: number, game: Game) {
        if (progress < 0.5) return;

        if (progress < 1) {
            const progressBarSize = 300 * ui.winScale;

            ctx.beginPath();
            ctx.roundRect(ui.width / 2 - progressBarSize / 2, 94 * ui.winScale, progressBarSize, 24 * ui.winScale, 12 * ui.winScale);
            ctx.closePath();
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.fill();

            ctx.beginPath();
            ctx.roundRect(ui.width / 2 - progressBarSize / 2, 94 * ui.winScale, progressBarSize * progress, 24 * ui.winScale, 12 * ui.winScale);
            ctx.closePath();
            ctx.fillStyle = 'rgb(218,255,55)';
            ctx.fill();
            return;
        }

        this.overlay.newEpoch.text = Game.format(game.epoch.calculatePoints(game.level)) + ' EP GAIN';
        this.overlay.newEpoch.render(ctx, ui);
    }

    private renderEpoch(ctx: CanvasRenderingContext2D, ui: UIContext) {
        const game = Game.instance!;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, ui.width, ui.height);

        ctx.font = 36 * ui.winScale + 'px Ubuntu';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgb(218,255,55)';
        ctx.fillText(Game.format(game.epoch.points) + ' Epoch Points', ui.width / 2, 36 * ui.winScale);

        ctx.font = 24 * ui.winScale + 'px Ubuntu';
        ctx.fillStyle = 'rgb(127, 148, 33)';
        ctx.fillText(game.epoch.count + ' Epoch', ui.width / 2, (36 + 24 + 4) * ui.winScale );

        for (let i = 0, l = this.overlay.epochUpgrades.length; i < l; ++i) {
            let upgrade = this.overlay.epochUpgrades[i];
            upgrade.options.offsetY = 130 * (i + 1);
            upgrade.render(ctx, ui);
        }

        this.overlay.startEpoch.render(ctx, ui);
        this.overlay.challenges.render(ctx, ui);
    }

    private renderChallenges(ctx: CanvasRenderingContext2D, ui: UIContext) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, ui.width, ui.height);

        ctx.font = 36 * ui.winScale + 'px Ubuntu';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgb(255, 55, 55)';
        ctx.fillText('Challenges', ui.width / 2, 36 * ui.winScale);

        ctx.font = 24 * ui.winScale + 'px Ubuntu';
        ctx.fillStyle = 'rgb(194, 43, 43)';
        ctx.fillText('To complete the challenge you need to start new epoch', ui.width / 2, (36 + 24 + 4) * ui.winScale );

        for (let i = 0, l = this.overlay.challengeButtons.length; i < l; ++i) {
            let btn = this.overlay.challengeButtons[i];
            btn.options.offsetY = 130 * (i + 1);
            btn.render(ctx, ui);
        }

        this.overlay.epoch.render(ctx, ui);
    }

    private renderAchievement(ctx: CanvasRenderingContext2D, ui: UIContext) {
        const achievement = this.overlay.getAchievement();

        if (!achievement) return;

        let p = ui.winScale,
            w = 500 * p,
            h = 108 * p - (achievement.reward ? 0 : (16+5) * p),
            x = 20 * p,
            y = 20 * p;

        ctx.globalAlpha = this.overlay.achievementAlpha();

        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 16);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fill();

        ctx.font = 24 * p + 'px Ubuntu';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#fff';
        ctx.fillText(achievement.name, x + 16 * p, y + 16 * p);
        ctx.fillStyle = '#ccc';
        ctx.font = 16 * p + 'px Ubuntu';
        ctx.fillText(achievement.description[0], x + 16 * p, y + (24+16+2) * p);
        ctx.fillText(achievement.description[1], x + 16 * p, y + (24+16+2+16+2) * p);

        if (achievement.reward) {
            ctx.fillStyle = '#fff';
            ctx.fillText('Reward: ' + achievement.reward, x + 16 * p, y + (24+16+2+16+2+16+5) * p);
        }

        ctx.globalAlpha = 1;
    }
}