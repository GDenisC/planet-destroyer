import { CursorStyle } from '../../Canvas';
import Entity from '../Entity';
import Game from '../Game';
import Component from './Component';
import Planet from './Planet';

export default class Target implements Component {
    public static readonly ACTIVE_TIME = 2;
    public x = 0;
    public y = 0;
    public angle = 0;
    public hidden = true;
    public canClick = false;

    private holding = false;
    private lastClickTimer = 0;

    public init(_: Entity) {}

    public update(dt: number) {
        if (!this.canClick) return;

        const game = Game.instance!,
            canvas = game.app.window.canvas,
            mouse = Game.mouse;

        let mx = mouse.x - canvas.cachedWidth / 2,
            my = mouse.y - canvas.cachedHeight / 2;

        if (mx * mx + my * my < Planet.SIZE_SQUARE * 2) {
            game.app.setCursorStyle(CursorStyle.Pointer);
            if (mouse.click && !this.holding) {
                this.x = mouse.x;
                this.y = mouse.y;
                this.angle = Math.atan2(my, mx);
                this.hidden = false;
                this.lastClickTimer = 0;
                this.holding = true;
            } else if (!mouse.click) {
                this.holding = false;
            }
        }

        if (this.hidden) return;

        const planet = game.planet;

        this.lastClickTimer += dt * planet.getTimeMultiplier();

        if (this.lastClickTimer > Target.ACTIVE_TIME) {
            this.lastClickTimer = 0;
            this.hidden = true;
        }
    }

    public alpha() {
        return Math.max(0, 1 - this.lastClickTimer / Target.ACTIVE_TIME);
    }
}