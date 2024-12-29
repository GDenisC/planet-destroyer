import Application from '../Application';
import Decoration from './components/Decoration';
import Explosion from './components/Explosion';
import Overlay from './components/Overlay';
import Planet from './components/Planet';
import PlanetHit from './components/PlanetHit';
import Rocket from './components/Rocket';
import Epoch from './Epoch';

export default class Game {
    public static readonly isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    public static readonly mouse = { x: 0, y: 0, click: false };
    public static instance: Game | null = null;
    public readonly rockets: Rocket[] = [];
    public readonly hits: PlanetHit[] = [];
    public readonly explosions: Explosion[] = [];
    public readonly decorations: Decoration[] = [];
    public readonly epoch = new Epoch();
    public level = 100;
    public score = 0;

    public constructor(
        public readonly app: Application,
        public readonly overlay: Overlay,
        public readonly planet: Planet
    ) {
        Game.instance = this;

        if (Game.isMobile) {
            window.addEventListener('touchstart', this.onTouchStart.bind(this));
            window.addEventListener('touchend', this.onTouchEnd.bind(this));
            window.addEventListener('touchcancel', this.onTouchEnd.bind(this));
            window.addEventListener('touchmove', this.onTouchMove.bind(this));
        } else {
            window.addEventListener('mousedown', this.onMouseStart.bind(this));
            window.addEventListener('mouseup', this.onMouseEnd.bind(this));
            window.addEventListener('mousemove', this.onMouseMove.bind(this));
        }
    }

    private setMousePosition(x: number, y: number) {
        Game.mouse.x = x * window.devicePixelRatio;
        Game.mouse.y = y * window.devicePixelRatio;
    }

    private onMouseStart(e: MouseEvent) {
        if (e.button == 0) Game.mouse.click = true;
        this.onMouseMove(e);
    }

    private onMouseMove(e: MouseEvent) {
        this.setMousePosition(e.clientX, e.clientY);
    }

    private onMouseEnd(e: MouseEvent) {
        if (e.button == 0) Game.mouse.click = false;
        this.onMouseMove(e);
    }

    private onTouchStart(_: TouchEvent) {
        Game.mouse.click = true;
        //this.onTouchMove(e);
    }

    private onTouchMove(e: TouchEvent) {
        let touch = e.touches[0];
        this.setMousePosition(touch.clientX, touch.clientY);
    }

    private onTouchEnd(_: TouchEvent) {
        Game.mouse.click = false;
    }

    public clearRockets() {
        for (let rocket of this.rockets) {
            rocket.entity.destroy();
        }
        this.rockets.splice(0, this.rockets.length);
    }

    public clearHits() {
        for (let hit of this.hits) {
            hit.entity.destroy();
        }
        this.hits.splice(0, this.hits.length);
    }

    public clearExplosions() {
        for (let explosion of this.explosions) {
            explosion.entity.destroy();
        }
        this.explosions.splice(0, this.explosions.length);
    }

    public clearTrees() {
        for (let tree of this.decorations) {
            tree.entity.destroy();
        }
        this.decorations.splice(0, this.decorations.length);
    }

    public clearAll() {
        this.clearRockets();
        this.clearHits();
        this.clearExplosions();
        this.clearTrees();
    }

    /** speedhack */
    public getTimeSpeed(): number {
        return this.epoch.multipliers.time;
    }

    public reset() {
        this.score = 0;
        this.level = 1;
        this.clearAll();
        this.planet.reset();
        this.overlay.resetUpgrades();
    }
}