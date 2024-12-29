import CostMultiplier from '../buttons/epoch/CostMultiplier';
import EpochUpgrade from '../buttons/epoch/EpochUpgrade';
import PenetrationChance from '../buttons/epoch/PenetrationChance';
import PlanetResetUpgrade from '../buttons/epoch/PlanetResetUpgrade';
import PowerMultiplier from '../buttons/epoch/PowerMultiplier';
import ScoreMultiplier from '../buttons/epoch/ScoreMultiplier';
import TimeMultiplier from '../buttons/epoch/TimeMultiplier';
import NewEpochBtn from '../buttons/NewEpochBtn';
import PlayBtn from '../buttons/PlayBtn';
import StartEpochBtn from '../buttons/StartEpochBtn';
import GravityUpgrade from '../buttons/upgrade/GravityUpgrade';
import LessIntervalUpgrade from '../buttons/upgrade/LessIntervalUpgrade';
import PowerUpgrade from '../buttons/upgrade/PowerUpgrade';
import SpeedUpgrade from '../buttons/upgrade/SpeedUpgrade';
import Upgrade from '../buttons/upgrade/Upgrade';
import Entity from '../Entity';
import { Order } from '../Order';
import Component from './Component';

export const enum Scene {
    Menu,
    Game,
    Epoch
}

export default class Overlay implements Component {
    public entity: Entity = null!;
    public logoImage: HTMLImageElement;
    public scene = Scene.Menu;

    public readonly upgrades: Upgrade[] = [
        new PowerUpgrade(),
        new LessIntervalUpgrade(),
        new SpeedUpgrade(),
        new GravityUpgrade()
    ];

    public readonly epochUpgrades: EpochUpgrade[] = [
        new PowerMultiplier(),
        new ScoreMultiplier(),
        new CostMultiplier(),
        new TimeMultiplier(),
        new PenetrationChance(),
        new PlanetResetUpgrade()
    ]

    public readonly play = new PlayBtn();
    public readonly newEpoch = new NewEpochBtn();
    public readonly startEpoch = new StartEpochBtn();

    public constructor() {
        this.logoImage = new Image();
        this.logoImage.src = 'logo.png';
    }

    public init(entity: Entity): void {
        entity.zOrder = Order.Overlay;
        this.entity = entity;
    }

    public resetUpgrades() {
        for (let upgrade of this.upgrades) {
            upgrade.reset();
        }
    }
}