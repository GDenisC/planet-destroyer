import Application from '../../Application';
import Collider from '../Collider';
import Entity from '../Entity';
import Game from '../Game';
import { Order } from '../Order';
import PlanetHitUI from '../ui/PlanetHit';
import Component from './Component';
import PlanetHit from './PlanetHit';
import RocketUI from '../ui/Rocket';

const TAU = Math.PI * 2;

function shortAngleDist(a0: number,a1: number) {
    var da = (a1 - a0) % TAU;
    return 2*da % TAU - da;
}

function angleLerp(a0: number,a1: number,t: number) {
    return a0 + shortAngleDist(a0,a1)*t;
}

export default class Rocket implements Component {
    public entity: Entity = null!;
    public app: Application = null!;
    public collider = new Collider();
    public angle: number;
    public fuel = 1;

    public constructor(
        public x: number,
        public y: number,
        public size: number,
        public damage: number,
        public speed: number
    ) {
        this.angle = Math.atan2(this.y, this.x) - Math.PI;
        Game.instance!.rockets.push(this);
    }

    public init(entity: Entity): void {
        this.entity = entity;
        this.app = entity.app;
        entity.zOrder = Order.Rocket;
    }

    public update(dt: number) {
        const planet = Game.instance!.planet,
            time = planet.timeMultiplier();

        this.angle += dt / planet.scale * time;

        this.angle = angleLerp(this.angle, Math.atan2(this.y, this.x) - Math.PI, Math.min(1, dt * 4 * time));

        if (Number.isNaN(this.angle)) this.angle = Math.random() * TAU;

        const speed = dt * 500 * this.speed / planet.scale * time;

        this.x += Math.cos(this.angle) * speed;
        this.y += Math.sin(this.angle) * speed;

        this.updateCollider();

        if (planet.intersects(this.collider)) {
            let limit = 10;
            do {
                this.x -= Math.cos(this.angle) * speed;
                this.y -= Math.sin(this.angle) * speed;
                this.updateCollider();
                limit -= 1;
            } while (planet.intersects(this.collider) && limit > 0);

            limit = 10;
            while (!planet.intersects(this.collider) && limit > 0) {
                this.x += Math.cos(this.angle) * speed / 10;
                this.y += Math.sin(this.angle) * speed / 10;
                this.updateCollider();
                limit -= 1;
            }

            Game.instance!.score += this.damage / 10;
            this.app.spawn({
                base: new PlanetHit(this.x, this.y, this.damage),
                ui: new PlanetHitUI()
            });
            if (--this.fuel <= 0) this.entity.destroy();
        }
    }

    private updateCollider() {
        this.collider.update({ x: this.x, y: this.y, radius: this.size / Game.instance!.planet.scale });
    }

    public static spawnOnOrbit(size: number, damage: number, speed: number) {
        const angle = Math.random() * Math.PI * 2;

        const rocket = new Rocket(
            Math.cos(angle) * 1200,
            Math.sin(angle) * 1200,
            size, damage, speed
        );

        Game.instance!.app.spawn({ base: rocket, ui: new RocketUI() });

        return rocket;
    }
}