import Application from '../../Application';
import Achievement from '../Achievement';
import Collider from '../Collider';
import DecorationUI from '../components/ui/Decoration';
import Entity from '../Entity';
import Game from '../Game';
import { Order } from '../Order';
import Component from './Component';
import Decoration, { DecorationType } from './Decoration';
import Rocket from './Rocket';

const planetPalette = [
    { bg: '996', layers: ['ff9', 'fd9', 'fe9', 'ff9', 'ef9', 'df9'] },
    { bg: '779', layers: ['99f', '9af', '9cf', 'a9f', 'c9f'] },
    { bg: 'a66', layers: ['fa9', 'f2a291', 'fb9', 'e89', 'f9a', 'fa9', 'fc9'] },
    { bg: '5a7', layers: ['8f9', '80f690', '7e8', '6d7', '7e7'] }
];

interface PlanetLayer {
    radius: number,
    color: string
}

export default class Planet implements Component {
    public static readonly SIZE = 250;
    public static readonly DEATH_TIME = 0.75;
    public app: Application = null!;
    public scale = 1;
    public destroyed = false;
    public deathTime = 0;
    public layers: PlanetLayer[] = [];
    public rocketTime = 1; // instant spawn
    public rocketInterval = 1;
    public rocketPower = 100;
    public rocketSpeed = 1;
    public rocketGravity = 0;
    public shootRockets = false;

    private collider = new Collider();
    private centerCollider = new Collider();

    public init(entity: Entity): void {
        entity.zOrder = Order.Planet;
        this.app = entity.app;

        this.updateColliders();
        this.updatePalette();
        this.spawnDecorations();
    }

    public update(dt: number) {
        const game = Game.instance!;
        let time = this.getTimeMultiplier();

        this.rotate(dt / 10 * time);

        if (this.shootRockets) {
            this.rocketTime += dt * time;

            if (this.rocketTime > this.rocketInterval) {
                let amount = Math.floor(this.rocketTime / this.rocketInterval);
                for (;amount;--amount) {
                    Rocket.spawnOnOrbit(this.rocketPower, this.rocketSpeed * game.epoch.multipliers.speed, this.rocketGravity);
                }
                this.rocketTime = 0;
            }
        }

        if (!this.destroyed) return;

        let timeSpeed = game.getTimeSpeed();

        this.deathTime += dt * timeSpeed;

        this.app.shakePower = 10 * time / timeSpeed;

        if (this.deathTime > Planet.DEATH_TIME * game.epoch.multipliers.reset)
            this.respawn();
    }

    public respawn() {
        let game = Game.instance!;
        game.score += Math.pow(50 * game.level, 1.1) * game.epoch.multipliers.score;
        game.clearAll();
        this.scale *= Math.pow(1.125, 2 / Math.sqrt(this.scale));
        game.level += 1;
        this.updateColliders();
        this.destroyed = false;
        this.deathTime = 0;
        this.app.shakePower = 0;
        this.updatePalette();
        this.spawnDecorations();
        this.rocketTime = this.rocketInterval;

        // lets check it only when planet is destroyed
        if (game.score > 1_000_000) Achievement.unlock('One Million');

        switch (game.level) {
            case 10: Achievement.unlock('Level 10'); break;
            case 1000: Achievement.unlock('Level 1000'); break;
            case 10_000: Achievement.unlock('The End'); break;
        }
    }

    public updatePalette() {
        const palette = planetPalette[Math.floor(Math.random() * planetPalette.length)];
        this.makeLayers(palette.layers);
        this.app.backgroundColor = '#' + palette.bg as `#${string}`;
    }

    public spawnDecorations() {
        if (this.scale > 50) return;

        const amount = Math.min(80, Math.round(30 * this.scale));

        for (let i = 0; i < amount; ++i) {
            let angle = Math.PI * 2 * i / amount + (Math.random() * 30 - 15) * Math.PI / 180;

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
            if (i == 0) height -= 15 * this.scale;
            else height -= 5 * this.scale + 50 * i + 40 * i * Math.random();
            i += 1;
        }
    }

    public updateColliders() {
        this.collider.update({ x: 0, y: 0, radius: Planet.SIZE });
        this.centerCollider.update({ x: 0, y: 0, radius: this.centerAreaRadius() });
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
        return Planet.SIZE * Math.max(0.05, 0.25 - this.scale / 10 * 0.20);
    }

    public getTimeMultiplier(): number {
        const game = Game.instance!,
            time = game.getTimeSpeed();

        if (this.deathTime == 0) return time;

        const reset = game.epoch.multipliers.reset;

        return Math.max(0, Planet.DEATH_TIME - this.deathTime / reset) / 1.5 / Planet.DEATH_TIME * time;
    }

    public rotate(radians: number) {
        let sin = Math.sin(radians);

        // (normal speed)
        // cos = 0.9999...
        // sin = 0.0007...
        // distanceIn = 250.0
        // distanceOut = 249.9
        //
        // so, cos = 1

        for (let hit of Game.instance!.hits) {
            hit.x = hit.x - hit.y * sin;
            hit.y = hit.x * sin + hit.y;
            hit.updateCollider();
        }

        for (let explosion of Game.instance!.explosions) {
            explosion.x = explosion.x - explosion.y * sin;
            explosion.y = explosion.x * sin + explosion.y;
        }

        for (let deco of Game.instance!.decorations) {
            deco.x = deco.x - deco.y * sin;
            deco.y = deco.x * sin + deco.y;
            deco.angle += radians;
        }
    }

    public reset() {
        this.rocketPower = 100;
        this.rocketSpeed = 1;
        this.rocketGravity = 0;
        this.scale = 1;
        this.destroyed = false;
        this.deathTime = 0;
        this.rocketTime = 1;
        this.rocketInterval = 1;
        this.app.shakePower = 0;
        this.updateColliders();
        this.updatePalette();
        this.spawnDecorations();
    }
}