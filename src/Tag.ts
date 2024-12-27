export default class Tag<T extends HTMLElement> {
    protected html: T;
    protected parent: Node | null = null;

    public constructor(name: keyof HTMLElementTagNameMap) {
        this.html = document.createElement(name) as T;
    }

    public setParent(parent: Node | null) {
        if (parent) {
            parent.appendChild(this.html);
        } else {
            this.parent?.removeChild(this.html);
        }
        this.parent = parent;
    }
}