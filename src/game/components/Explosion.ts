import Entity from '../Entity';
import Game from '../Game';
import { Order } from '../Order';
import Component from './Component';
import Planet from './Planet';

export default class Explosion implements Component {
    public entity: Entity = null!;
    public timer = 0;

    public constructor(
        public readonly planet: Planet,
        public x: number,
        public y: number,
        public size: number,
        public explosionTime = 0.5
    ) {}

    public init(entity: Entity): void {
        entity.zOrder = Order.Explosion;
        this.entity = entity;
        Game.instance!.explosions.push(this);
    }

    public update(dt: number) {
        dt *= this.planet.getTimeMultiplier();
        this.timer += dt;
        if (this.timer > this.explosionTime) {
            this.entity.destroy();
            let explosions = Game.instance!.explosions;
            explosions.splice(explosions.indexOf(this), 1);
        }
    }

    public alpha() {
        return Math.max(0, (1 - this.timer / this.explosionTime) / Math.max(1, Math.log(1 + this.size / Planet.SIZE / Game.instance!.planet.scale)));
    }
}