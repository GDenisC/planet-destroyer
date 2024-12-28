import Entity from '../Entity';
import Game from '../Game';
import { Order } from '../Order';
import Component from './Component';

export const enum DecorationType {
    Hill,
    Tree
}

export default class Decoration implements Component {
    public entity: Entity = null!;

    public constructor(
        public x: number,
        public y: number,
        public size: number,
        public angle: number,
        public type: DecorationType
    ) {}

    public init(entity: Entity): void {
        entity.zOrder = Order.Decoration;
        this.entity = entity;
        Game.instance!.decorations.push(this);
    }
}