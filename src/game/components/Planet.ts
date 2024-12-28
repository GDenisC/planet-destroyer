import Application from '../../Application';
import Collider from '../Collider';
import Entity from '../Entity';
import Game from '../Game';
import { Order } from '../Order';
import DecorationUI from '../ui/Decoration';
import Component from './Component';
import Decoration, { DecorationType } from './Decoration';
import Rocket from './Rocket';

const planetPalette = [
    { bg: '774', layers: ['ff9', 'fd9', 'fe9', 'ff9', 'ef9', 'df9'] },
    { bg: '446', layers: ['99f', '9af', '9cf', 'a9f', 'c9f'] },
    { bg: '744', layers: ['fa9', 'f9b', 'f9a', 'fa9', 'fb9', 'fc9'] },
    { bg: '132', layers: ['7e8', '7e7', 'ae7', '9e7', '7e7'] }
];

interface PlanetLayer {
    radius: number,
    color: string
}

export default class Planet implements Component {
    public static readonly SIZE = 250;
    public static readonly DEATH_TIME = 1;
    public app: Application = null!;
    public scale = 10;
    public destroyed = false;
    public deathTime = 0;
    public layers: PlanetLayer[] = [];
    public rocketTime = 0;
    public rocketInterval = 1;

    private collider = new Collider();
    private centerCollider = new Collider();

    public init(entity: Entity): void {
        entity.zOrder = Order.Planet;
        this.app = entity.app;

        this.updateColliders();
        this.updatePalette();
        this.spawnDecorations();
    }

    public spawnDecorations() {
        if (this.scale > 25) return;

        const amount = Math.min(59, Math.round(30 * this.scale));

        for (let i = 0; i < amount; ++i) {
            let angle = Math.random() * Math.PI * 2;

            this.app.spawn({ base: new Decoration(
                Math.cos(angle) * Planet.SIZE,
                Math.sin(angle) * Planet.SIZE,
                10 * Math.sqrt(this.scale) + Math.random() * 40,
                angle,
                Math.random() > 0.36 ? DecorationType.Hill : DecorationType.Tree
            ), ui: new DecorationUI() });
        }
    }

    public makeLayers(layersPalette: string[]) {
        this.layers.splice(0, this.layers.length);

        let height = Planet.SIZE * this.scale,
            middleRadius = this.centerAreaRadius(),
            i = 0;

        while (height > middleRadius) {
            this.layers.push({ radius: height / this.scale, color: '#' + layersPalette[i % layersPalette.length] });
            height -= 100 + 200 * Math.random();
            i += 1;
        }
    }

    public updateColliders() {
        this.collider.update({ x: 0, y: 0, radius: Planet.SIZE });
        this.centerCollider.update({ x: 0, y: 0, radius: this.centerAreaRadius() });
    }

    public update(dt: number) {
        let time = this.timeMultiplier();

        this.rotate(dt / 10 * time);

        this.rocketTime += dt * time;

        if (this.rocketTime > this.rocketInterval) {
            Rocket.spawnOnOrbit(10, 80, 1);
            this.rocketTime = 0;
        }

        if (!this.destroyed) return;

        this.deathTime += dt;

        this.app.shakePower = 10 * time;

        if (this.deathTime > Planet.DEATH_TIME) {
            Game.instance!.score += Math.pow(100 * this.scale, 1.1);
            Game.instance!.clearAll();
            this.scale *= 1.25;
            this.updateColliders();
            this.destroyed = false;
            this.deathTime = 0;
            this.app.shakePower = 0;
            this.updatePalette();
            this.spawnDecorations();
        }
    }

    public updatePalette() {
        const palette = planetPalette[Math.floor(Math.random() * planetPalette.length)];
        this.makeLayers(palette.layers);
        this.app.backgroundColor = '#' + palette.bg as `#${string}`;
    }

    public intersects(collider: Collider): boolean {
        if (!this.collider.intersects(collider, true)) return false;

        for (let hit of Game.instance!.hits) {
            if (hit.collider.intersects(collider, true))
                return false;
        }

        return true;
    }

    public tryDestroy(collider: Collider) {
        if (this.centerCollider.intersects(collider, false)) {
            this.destroyed = true;
        }
    }

    public centerAreaRadius(): number {
        return Planet.SIZE * Math.max(1, 3 - this.scale / 2) / 10;
    }

    public timeMultiplier(): number {
        return Math.max(0, Planet.DEATH_TIME - this.deathTime) / Planet.DEATH_TIME;
    }

    public rotate(radians: number) {
        let cos = Math.cos(radians),
            sin = Math.sin(radians);

        for (let hit of Game.instance!.hits) {
            hit.x = hit.x * cos - hit.y * sin;
            hit.y = hit.x * sin + hit.y * cos;
            hit.updateCollider();
        }

        for (let explosion of Game.instance!.explosions) {
            explosion.x = explosion.x * cos - explosion.y * sin;
            explosion.y = explosion.x * sin + explosion.y * cos;
        }

        for (let deco of Game.instance!.decorations) {
            deco.x = deco.x * cos - deco.y * sin;
            deco.y = deco.x * sin + deco.y * cos;
            deco.angle += radians;
        }
    }
}