import Component from './Component';
import Entity from '../Entity';
import { Order } from '../Order';
import Collider from './Collider';
import Game from '../Game';
import Explosion from './Explosion';
import ExplosionUI from '../ui/Explosion';

export default class PlanetHit implements Component {
    public entity: Entity = null!;
    public collider: Collider = null!;

    public constructor(
        public x: number,
        public y: number,
        public size: number
    ) {}

    public init(entity: Entity<{ collider: Collider }>): void {
        this.entity = entity;
        entity.zOrder = Order.PlanetHit;
        Game.instance!.hits.push(this);
        this.collider = entity.getComponent('collider');

        const planet = Game.instance!.planet
        entity.app.spawn({ base: new Explosion(planet, this.x, this.y, this.size), ui: new ExplosionUI() })
        this.updateCollider();
        planet.tryDestroy(this.collider);
    }

    public updateCollider() {
        this.collider.update({ x: this.x, y: this.y, radius: this.size / Game.instance!.planet.scale });
    }
}