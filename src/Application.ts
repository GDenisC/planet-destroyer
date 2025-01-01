import { CursorStyle } from './Canvas';
import Component from './game/components/Component';
import { UI, UIContext } from './game/components/ui/UI';
import Entity from './game/Entity';
import Window from './Window';

export default class Application {
    public static readonly now: () => number = 'performance' in window && 'now' in performance ? performance.now.bind(performance) : Date.now();
    public readonly window = new Window();
    public entities = new Set<Entity<{ base?: Component, ui?: UI }>>();
    public dt = 0.0001; // 0 may cause NaN
    public backgroundColor: `#${string}` = '#777';
    public shakePower = 0;

    private readonly cachedGameLoop: () => void = this.gameLoop.bind(this);
    private readonly cachedCanvasResize = () => this.window.canvas.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio);
    private lastTime = 0; // checked in gameLoop
    private entitiesSorted = false;

    private gameLoop() {
        let now = Application.now();
        if (this.lastTime) {
            this.dt = Math.min(1000 / 30, now - this.lastTime) / 1000;
        }
        this.lastTime = now;

        if (!this.entitiesSorted) {
            this.entities = new Set(Array.from(this.entities).sort((a, b) => a.zOrder - b.zOrder));
            this.entitiesSorted = false;
        }

        let ctx = this.window.canvas.ctx,
            canvas = this.window.canvas,
            ui: UIContext = {
                x: canvas.cachedWidth / 2,
                y: canvas.cachedHeight / 2,
                width: canvas.cachedWidth,
                height: canvas.cachedHeight,
                winScale: this.window.canvas.windowScale,
                dt: this.dt
            };

        if (this.shakePower) {
            ui.x += Math.random() * this.shakePower - this.shakePower / 2;
            ui.y += Math.random() * this.shakePower - this.shakePower / 2;
        }

        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, canvas.cachedWidth, canvas.cachedHeight);

        this.setCursorStyle(CursorStyle.Default);

        for (let entity of Array.from(this.entities)) {
            if (entity.destroyed) continue;
            let entityBase = entity.getComponent('base'),
                entityUI = entity.getComponent('ui');

            // too lazy to make another interface
            if (entityBase && 'update' in entityBase)
                (entityBase as { update: (dt: number) => void }).update(this.dt);

            if (entityUI) entityUI.render(ctx, ui);
        }

        for (let entity of this.entities) {
            if (!entity.destroyed) continue;
            entity.cleanup();
            this.entities.delete(entity);
        }

        requestAnimationFrame(this.cachedGameLoop);
    }

    public run() {
        window.addEventListener('resize', this.cachedCanvasResize);
        window.addEventListener('focus', () => this.lastTime = Application.now());

        this.cachedCanvasResize();
        this.gameLoop();
    }

    public spawn<T extends Record<string, Component>>(components: T): Entity<T> {
        let entity = new Entity<T>(this, components);
        this.entities.add(entity);
        this.entitiesSorted = false;
        return entity;
    }

    public setCursorStyle(style: CursorStyle) {
        this.window.canvas.setCursorStyle(style);
    }
}