import Entity from '../Entity';

export default interface Component {
    init(entity: Entity): void;
}