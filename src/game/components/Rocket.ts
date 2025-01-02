import Application from '../../Application';
import Collider from '../Collider';
import PlanetHitUI from '../components/ui/PlanetHit';
import RocketUI, { RocketFlags } from '../components/ui/Rocket';
import Entity from '../Entity';
import Game from '../Game';
import { Order } from '../Order';
import Component from './Component';
import Explosion from './Explosion';
import Planet from './Planet';
import PlanetHit from './PlanetHit';
import ExplosionUI from './ui/Explosion';

const TAU = Math.PI * 2;

function shortAngleDist(a0: number,a1: number) {
    var da = (a1 - a0) % TAU;
    return 2*da % TAU - da;
}

function angleLerp(a0: number,a1: number,t: number) {
    return a0 + shortAngleDist(a0,a1)*t;
}

function distance(x: number, y: number) {
    return Math.sqrt(x * x + y * y);
}

export default class Rocket implements Component {
    public entity: Entity = null!;
    public app: Application = null!;
    public collider = new Collider();
    public angle: number;
    public penetration = 1;
    public trailTimer = 0;
    public trailSpawnAtTime = 0;
    public flags = 0;

    public constructor(
        public x: number,
        public y: number,
        public size: number,
        public damage: number,
        public speed: number,
        public gravity: number
    ) {
        const game = Game.instance!;
        this.angle = Math.atan2(this.y, this.x) - Math.PI + Math.random() * TAU / game.planet.scale / game.epoch.multipliers.reset;
        game.rockets.push(this);
    }

    public init(entity: Entity): void {
        this.entity = entity;
        this.app = entity.app;
        entity.zOrder = Order.Rocket;
    }

    public update(dt: number) {
        const game = Game.instance!,
            planet = game.planet,
            time = planet.getTimeMultiplier()

        this.angle = angleLerp(this.angle, Math.atan2(this.y, this.x) - Math.PI, Math.min(1, dt * this.speed * time));

        let speed = dt * 500 * this.speed / planet.scale * time,
            dist = distance(this.x, this.y);

        if (dist < speed) {
            // this scope fixes 1e+308 speed
            this.x = 0;
            this.y = 0;
            speed = Planet.SIZE * planet.scale;
        } else {
            this.x += Math.cos(this.angle) * speed;
            this.y += Math.sin(this.angle) * speed;
        }

        this.updateCollider();

        if (planet.intersects(this.collider))
            this.collideWithPlanet(game, planet, speed);

        this.trailTimer += dt * time;

        if (this.trailTimer > this.trailSpawnAtTime) {
            let cos = Math.cos(this.angle),
                sin = Math.sin(this.angle),
                width = this.size * 2;
            this.app.spawn({ base: new Explosion(planet, this.x - cos * width, this.y - sin * width, this.size * (6 + Math.random()) / 10 * planet.scale, 0.33), ui: new ExplosionUI() });
            this.trailSpawnAtTime = Math.random() / 30;
            this.trailTimer = 0;
        }
    }

    private collideWithPlanet(game: Game, planet: Planet, speed: number) {
        let limit = 1_000,
            multipliers = game.epoch.multipliers,
            cos = Math.cos(this.angle),
            sin = Math.sin(this.angle);

        // get normal position

        do {
            this.x -= cos * speed / 2 / planet.scale;
            this.y -= sin * speed / 2 / planet.scale;
            this.updateCollider();
        } while (planet.intersects(this.collider) && limit-- > 0);

        while (!planet.intersects(this.collider) && limit-- > 0) {
            this.x += cos * this.damage / 10 / planet.scale;
            this.y += sin * this.damage / 10 / planet.scale;
            this.updateCollider();
        }

        // wtf happened
        if (this.x > 1e9 || this.y > 1e9) {
            this.x = 0;
            this.y = 0;
        }

        // explosion

        let dist = Math.sqrt(this.x * this.x + this.y * this.y) + 1, // + 1 is NaN Fix
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

    private updateCollider() {
        let scale = Game.instance!.planet.scale;
        this.collider.update({ x: this.x, y: this.y, radius: this.size / scale });
    }

    /** Spawn rocket's clone on orbit */
    public spawnCloneOnOrbit(useTarget: boolean) {
        const rocket = Rocket.spawnOnOrbit(this.damage, this.speed, this.gravity, useTarget);

        rocket.size = this.size;
        rocket.penetration = this.penetration;
        rocket.flags = this.flags;

        return rocket;
    }

    /** Spawn many rocket's clones */
    public spawnClones(amount: number, useTarget: boolean) {
        for (let i = amount + 1; --i;) {
            this.spawnCloneOnOrbit(useTarget);
        }
    }

    /** Spawn rocket on orbit and return */
    public static spawnOnOrbit(damage: number, speed: number, gravity: number, useTarget: boolean) {
        const game = Game.instance!,
            angle = game.target.hidden || !useTarget
                ? Math.random() * TAU
                : game.target.angle + Math.random() * TAU / 12 - TAU / 12 / 2;

        const rocket = new Rocket(
            Math.cos(angle) * 1200,
            Math.sin(angle) * 1200,
            8, damage, speed, gravity
        );

        game.app.spawn({ base: rocket, ui: new RocketUI() });

        return rocket;
    }
}