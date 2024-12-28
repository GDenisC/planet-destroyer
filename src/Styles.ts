import Tag from './Tag';

export default class Styles extends Tag<HTMLStyleElement> {
    public constructor() {
        super('style');

        this.addStyle('body', { margin: 0, overflow: 'hidden' });
        this.addStyle('canvas', { width: '100vw', height: '100vh' });
    }

    public addStyle(name: string, styles: Record<string, { toString: () => string }>) {
        this.html.innerHTML += name + '{' +
            Object.keys(styles)
                .map(
                    key => key + ':' + styles[key].toString()
                )
                .join(';')
            + '}';
    }
}