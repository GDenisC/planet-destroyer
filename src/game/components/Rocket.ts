import Component from './Component';
import Entity from '../Entity';
import { Order } from '../Order';
import Planet from './Planet';
import Collider from './Collider';
import Application from '../../Application';
import PlanetHit from './PlanetHit';
import PlanetHitUI from '../ui/PlanetHit';
import Game from '../Game';

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
    public collider: Collider = null!;
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

    public init(entity: Entity<{ collider: Collider }>): void {
        this.entity = entity;
        this.app = entity.app;
        this.collider = entity.getComponent('collider');
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
                collider: new Collider(),
                base: new PlanetHit(this.x, this.y, this.damage),
                ui: new PlanetHitUI()
            });
            if (--this.fuel <= 0) this.entity.destroy();
        }
    }

    private updateCollider() {
        this.collider.update({ x: this.x, y: this.y, radius: this.size / Game.instance!.planet.scale });
    }
}