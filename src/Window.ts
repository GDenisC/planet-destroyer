import Canvas from './Canvas';
import Styles from './Styles';

export default class Window {
    public readonly canvas = new Canvas();
    public readonly styles = new Styles();

    public constructor() {
        this.canvas.setParent(document.body);
        this.styles.setParent(document.head);
    }
}