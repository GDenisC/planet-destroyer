import Application from '../../Application';
import Collider from '../Collider';
import Entity from '../Entity';
import Game from '../Game';
import { Order } from '../Order';
import PlanetHitUI from '../components/ui/PlanetHit';
import Component from './Component';
import PlanetHit from './PlanetHit';
import RocketUI from '../components/ui/Rocket';

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
    public penetration = 1;

    public constructor(
        public x: number,
        public y: number,
        public size: number,
        public damage: number,
        public speed: number,
        public gravity: number
    ) {
        this.angle = Math.atan2(this.y, this.x) - TAU + Math.random() * TAU / Game.instance!.planet.scale;
        Game.instance!.rockets.push(this);
    }

    public init(entity: Entity): void {
        this.entity = entity;
        this.app = entity.app;
        entity.zOrder = Order.Rocket;
    }

    public update(dt: number) {
        const game = Game.instance!,
            planet = game.planet,
            time = planet.getTimeMultiplier();

        this.angle = angleLerp(this.angle, Math.atan2(this.y, this.x) - Math.PI, Math.min(1, dt * this.speed * time));

        if (Number.isNaN(this.angle)) this.angle = Math.random() * TAU;

        const speed = dt * 500 * this.speed / planet.scale * time;

        this.x += Math.cos(this.angle) * speed;
        this.y += Math.sin(this.angle) * speed;

        this.updateCollider();

        if (planet.intersects(this.collider)) {
            let timeSpeed = game.getTimeSpeed(),
                limit = 10 * timeSpeed,
                multipliers = game.epoch.multipliers;

            do {
                this.x -= Math.cos(this.angle) * speed;
                this.y -= Math.sin(this.angle) * speed;
                this.updateCollider();
                limit -= 1;
            } while (planet.intersects(this.collider) && limit > 0);

            limit = 10 * timeSpeed;
            while (!planet.intersects(this.collider) && limit > 0) {
                this.x += Math.cos(this.angle) * speed / 10 / timeSpeed;
                this.y += Math.sin(this.angle) * speed / 10 / timeSpeed;
                this.updateCollider();
                limit -= 1;
            }

            let dist = Math.sqrt(this.x * this.x + this.y * this.y),
                gravityPower = 1 + (Math.pow(2, this.gravity) - 1) / dist

            game.score += this.damage * gravityPower / 10 * multipliers.score;
            this.app.spawn({
                base: new PlanetHit(this.x, this.y, this.damage * gravityPower * multipliers.power),
                ui: new PlanetHitUI()
            });

            if (game.epoch.penetrationChance > Math.random()) this.penetration += 1;

            if (--this.penetration <= 0) {
                this.entity.destroy();
                game.rockets.splice(game.rockets.indexOf(this), 1);
            }
        }
    }

    private updateCollider() {
        this.collider.update({ x: this.x, y: this.y, radius: this.size / Game.instance!.planet.scale });
    }

    public static spawnOnOrbit(damage: number, speed: number, gravity: number) {
        const angle = Math.random() * TAU;

        const rocket = new Rocket(
            Math.cos(angle) * 1200,
            Math.sin(angle) * 1200,
            damage / 8, damage, speed, gravity
        );

        Game.instance!.app.spawn({ base: rocket, ui: new RocketUI() });

        return rocket;
    }
}