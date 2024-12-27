import Entity from '../Entity';
import Component from './Component';

interface Circle {
    x: number;
    y: number;
    radius: number;
}

export default class Collider implements Component {
    private data: Circle | null = null;

    public update(data: Circle): void {
        this.data = data;
    }

    public init(_entity: Entity): void {}

    public intersects(other: Collider, noRadius: boolean): boolean {
        if (!this.data || !other.data) return false;
        return Collider.circleIntersectCircle(this.data, other.data, noRadius);
    }

    private static circleIntersectCircle(c1: Circle, c2: Circle, noRadius: boolean): boolean {
        let dx = c1.x - c2.x,
            dy = c1.y - c2.y,
            r = c1.radius + (noRadius ? 0 : c2.radius);
        return dx * dx + dy * dy <= r * r;
    }
}