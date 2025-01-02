import Achievement from '../Achievement';
import ChallengeBtn from '../buttons/ChallengeBtn';
import ChallengesBtn from '../buttons/ChallengesBtn';
import EndChallengeBtn from '../buttons/EndChallengeBtn';
import CostMultiplier from '../buttons/epoch/CostMultiplier';
import EpochUpgrade from '../buttons/epoch/EpochUpgrade';
import PenetrationChance from '../buttons/epoch/PenetrationChance';
import PlanetResetUpgrade from '../buttons/epoch/PlanetResetUpgrade';
import PowerMultiplier from '../buttons/epoch/PowerMultiplier';
import ScoreMultiplier from '../buttons/epoch/ScoreMultiplier';
import TimeMultiplier from '../buttons/epoch/TimeMultiplier';
import EpochBtn from '../buttons/EpochBtn';
import NewEpochBtn from '../buttons/NewEpochBtn';
import PlayBtn from '../buttons/PlayBtn';
import RocketBtn from '../buttons/rockets/RocketBtn';
import rocketLayers from '../buttons/rockets/RocketLayers';
import StartEpochBtn from '../buttons/StartEpochBtn';
import GravityUpgrade from '../buttons/upgrade/GravityUpgrade';
import LessIntervalUpgrade from '../buttons/upgrade/LessIntervalUpgrade';
import PowerUpgrade from '../buttons/upgrade/PowerUpgrade';
import SpeedUpgrade from '../buttons/upgrade/SpeedUpgrade';
import Upgrade from '../buttons/upgrade/Upgrade';
import Entity from '../Entity';
import Game from '../Game';
import { Order } from '../Order';
import Component from './Component';

export const enum Scene {
    Menu,
    Game,
    Epoch,
    Challenges
}

export default class Overlay implements Component {
    public static readonly ACHIEVEMENT_TIME = 5;
    private readonly achievementsStack: Achievement[] = [];
    private achievementTimer = 0;
    private nextAchievementAt = 0;
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
    ];

    public challengeButtons: ChallengeBtn[] = null!;

    public readonly rocketButtons: RocketBtn[][] = rocketLayers;
    public rocketButtonsEnabled = true;

    public readonly play = new PlayBtn();
    public readonly newEpoch = new NewEpochBtn();
    public readonly startEpoch = new StartEpochBtn();
    public readonly challenges = new ChallengesBtn();
    public readonly epoch = new EpochBtn();
    public readonly endChallenge = new EndChallengeBtn();

    public constructor() {
        this.logoImage = new Image();
        this.logoImage.src = 'logo.png';
    }

    public init(entity: Entity) {
        entity.zOrder = Order.Overlay;
        this.challengeButtons = Game.instance!.epoch.challenges.map(challenge => new ChallengeBtn(challenge));
        this.entity = entity;
    }

    public update(dt: number) {
        if (!this.nextAchievementAt) return;

        this.achievementTimer += dt;

        if (this.achievementTimer > this.nextAchievementAt) {
            this.achievementsStack.shift();
            this.achievementTimer = 0;
            if (!this.achievementsStack[0])
                this.nextAchievementAt = 0;
        }
    }

    public pushAchievement(achievement: Achievement) {
        this.achievementsStack.push(achievement);
        this.nextAchievementAt = Overlay.ACHIEVEMENT_TIME;
        this.achievementTimer = 0;
    }

    public getAchievement(): Achievement | undefined {
        return this.achievementsStack[0];
    }

    /** https://www.desmos.com/Calculator/9th1u5gtpl */
    public achievementAlpha() {
        if (!this.nextAchievementAt) return 0;

        return Math.min(1, this.achievementTimer / 0.1 / this.nextAchievementAt)
            - Math.max(0, (this.achievementTimer - this.nextAchievementAt * 0.9) / 0.1 / this.nextAchievementAt);
    }

    public resetUpgrades() {
        for (let upgrade of this.upgrades) {
            upgrade.reset();
        }
    }

    public unlockRocket(layer: number, index: number) {
        let rocketLayer = this.rocketButtons[layer];
        if (!rocketLayer) return;

        let rocket = rocketLayer[index];
        if (!rocket) return;

        rocket.unlocked = true;
    }
}