import Application from '../Application';
import Decoration from './components/Decoration';
import Explosion from './components/Explosion';
import Planet from './components/Planet';
import PlanetHit from './components/PlanetHit';
import Rocket from './components/Rocket';

export default class Game {
    public static readonly isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    public static readonly mouse = { x: 0, y: 0, click: false };
    public static instance: Game | null = null;
    public readonly rockets: Rocket[] = [];
    public readonly hits: PlanetHit[] = [];
    public readonly explosions: Explosion[] = [];
    public readonly decorations: Decoration[] = [];
    public touch: number | null = null;
    public score = 0;

    public constructor(
        public readonly app: Application,
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

    setMousePosition(x: number, y: number) {
        Game.mouse.x = x * window.devicePixelRatio;
        Game.mouse.y = y * window.devicePixelRatio;
    }

    onMouseStart(e: MouseEvent) {
        Game.mouse.click = true;
        this.onMouseMove(e);
    }

    onMouseMove(e: MouseEvent) {
        this.setMousePosition(e.clientX, e.clientY);
    }

    onMouseEnd(e: MouseEvent) {
        Game.mouse.click = false;
        this.onMouseMove(e);
    }

    onTouchStart(e: TouchEvent) {
        if (this.touch !== null) return;
        this.touch = e.touches[0].identifier;
        Game.mouse.click = true;
        this.onTouchMove(e);
    }

    onTouchMove(e: TouchEvent) {
        for (let touch of e.touches) {
            if (touch.identifier === this.touch) {
                this.setMousePosition(touch.clientX, touch.clientY);
                return;
            }
        }
    }

    onTouchEnd(e: TouchEvent) {
        for (let touch of e.changedTouches) {
            if (touch.identifier === this.touch) {
                this.onTouchMove(e);
                this.touch = null;
                Game.mouse.click = false;
                return;
            }
        }
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
}