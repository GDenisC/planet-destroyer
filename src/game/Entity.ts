import Application from '../Application';
import Component from './components/Component';
import { Order } from './Order';

export default class Entity<T extends Record<string, Component> = {}> {
    private readonly components = {} as T;
    public zOrder = Order.Default;
    public destroyed = false;

    public constructor(public readonly app: Application, components: Record<string, Component>) {
        let keys = Object.keys(components);
        for (let i = 0, l = keys.length; i < l; ++i) {
            let comp = components[keys[i]];
            comp.init(this);
            (this as any).components[keys[i]] = comp;
        }
    }

    public getComponent<S extends keyof T>(name: S): T[S] {
        return this.components[name] as T[S];
    }

    public cleanup() {
        for (let name in this.components) {
            delete this.components[name];
        }
    }

    public destroy() {
        this.destroyed = true;
    }
}