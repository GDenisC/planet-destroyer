import Collider from '../Collider';
import Entity from '../Entity';
import Game from '../Game';
import { Order } from '../Order';
import ExplosionUI from '../ui/Explosion';
import Component from './Component';
import Explosion from './Explosion';

export default class PlanetHit implements Component {
    public entity: Entity = null!;
    public collider = new Collider();

    public constructor(
        public x: number,
        public y: number,
        public size: number
    ) {}

    public init(entity: Entity): void {
        this.entity = entity;
        entity.zOrder = Order.PlanetHit;
        Game.instance!.hits.push(this);

        const planet = Game.instance!.planet
        entity.app.spawn({ base: new Explosion(planet, this.x, this.y, this.size), ui: new ExplosionUI() })
        this.updateCollider();
        planet.tryDestroy(this.collider);
    }

    public updateCollider() {
        this.collider.update({ x: this.x, y: this.y, radius: this.size / Game.instance!.planet.scale });
    }
}