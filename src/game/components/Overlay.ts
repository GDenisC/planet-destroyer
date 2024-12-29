import PlayBtn from '../buttons/PlayBtn';
import GravityUpgrade from '../buttons/upgrade/GravityUpgrade';
import LessIntervalUpgrade from '../buttons/upgrade/LessIntervalUpgrade';
import PowerUpgrade from '../buttons/upgrade/PowerUpgrade';
import SpeedUpgrade from '../buttons/upgrade/SpeedUpgrade';
import Upgrade from '../buttons/upgrade/Upgrade';
import Entity from '../Entity';
import { Order } from '../Order';
import Component from './Component';

export default class Overlay implements Component {
    public entity: Entity = null!;
    public logoImage: HTMLImageElement;

    public readonly upgrades: Upgrade[] = [
        new PowerUpgrade(),
        new LessIntervalUpgrade(),
        new SpeedUpgrade(),
        new GravityUpgrade()
    ];

    public readonly play = new PlayBtn();

    //public readonly upgrades = new Button(-58, 20, 1, 0, 100, 28, () => {});

    public constructor() {
        this.logoImage = new Image();
        this.logoImage.src = 'logo.png';
    }

    public init(entity: Entity): void {
        entity.zOrder = Order.Overlay;
        this.entity = entity;
    }
}