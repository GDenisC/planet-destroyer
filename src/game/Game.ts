import Application from '../Application';
import Achievement from './Achievement';
import Decoration from './components/Decoration';
import Explosion from './components/Explosion';
import Overlay from './components/Overlay';
import Planet from './components/Planet';
import PlanetHit from './components/PlanetHit';
import Rocket from './components/Rocket';
import Target from './components/Target';
import Epoch from './Epoch';
import { ISave, Save } from './saves';

export default class Game implements ISave {
    /** Detects if the user is using a mobile device */
    public static readonly isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    /** Mouse object */
    public static readonly mouse = { x: 0, y: 0, click: false };
    /** Game instance */
    public static instance: Game | null = null;
    /** Used in `dev` variable */
    public readonly Achievement = Achievement;
    /** Rockets spawned in the game in the current moment */
    public readonly rockets: Rocket[] = [];
    /** Hits spawned in the game in the current moment */
    public readonly hits: PlanetHit[] = [];
    /** Effects spawned in the game in the current moment */
    public readonly explosions: Explosion[] = [];
    /** Decorations of the planet in the current moment */
    public readonly decorations: Decoration[] = [];
    /** Game epoch */
    public readonly epoch = new Epoch();
    /** Current game level */
    public level;
    /** Current game score */
    public score = 0;

    public constructor(
        public readonly app: Application,
        public readonly overlay: Overlay,
        public readonly planet: Planet,
        public readonly target: Target
    ) {
        Game.instance = this;

        this.level = Math.round(this.epoch.multipliers.level);

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

        window.addEventListener('beforeunload', () => {
            const save = new Save();
            save.write(this);
            save.toLocalStorage();
        });
    }

    public onSave(save: Save): void {
        save.writeU8(Save.VERSION);
        save.writeU32(this.level);
        save.writeF64(this.score);
        // dont save the planet
        save.write(this.overlay);
        save.write(this.epoch);
        save.writeArray(Achievement.all);
    }

    public onLoad(save: Save): void {
        if (save.readU8() != Save.VERSION) {
            if (prompt('This save is from an older version of the game. Do you want to delete it (yes/no)?') != 'yes')
                return;
        }
        let level = save.readU32();
        this.score = save.readF64();
        save.load(this.overlay);
        save.load(this.epoch);
        // epoch challenge gives 1 more level per restart
        this.planet.postLoad(level);
        this.level -= 1;
        // epoch cost multiplier exists
        this.overlay.postLoad();
        save.loadArray(Achievement.all);
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

    private onTouchStart(e: TouchEvent) {
        if (!document.fullscreenElement) return;

        document.documentElement.requestFullscreen({
            navigationUI: "hide" // handle notch on mobile
        });

        Game.mouse.click = true;
        this.onTouchMove(e);
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
        this.level = Math.round(this.epoch.multipliers.level);
        this.clearAll();
        this.planet.reset();
        this.overlay.resetUpgrades();
    }

    public static format(n: number, digits = 0): string {
        if (n > 1e6)
            return n.toExponential(2);
        return n.toFixed(digits);
    }
}
