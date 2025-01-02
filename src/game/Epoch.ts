import Achievement from './Achievement';
import ActiveChallenge from './challenges/ActiveChallenge';
import Challenge from './challenges/Challenge';
import EpochChallenge from './challenges/EpochChallenge';
import OfflineChallenge from './challenges/OfflineChallenge';
import { Scene } from './components/Overlay';
import Game from './Game';
import { ISave, Save } from './saves';

export default class Epoch implements ISave {
    public static readonly EPOCH_LEVEL = 100;

    public readonly challenges: Challenge[] = [
        new OfflineChallenge(),
        new ActiveChallenge(),
        new EpochChallenge()
    ];
    public currentChallenge: Challenge | null = null;

    public multipliers = {
        power: 1, cost: 1, score: 1,
        time: 1, reset: 1, speed: 1,
        epoch: 1, level: 1, interval: 1
    };
    public penetrationChance = 0;

    public points = 0;
    public count = 0;

    public endEpoch() {
        const game = Game.instance!;

        if (this.count == 0) Achievement.unlock('First Epoch');

        this.count += 1;
        this.points += this.calculatePoints(game.level);
        game.reset();
        game.overlay.scene = Scene.Epoch;
        game.planet.shootRockets = false;
        game.target.canClick = false;

        if (this.points > 1_000_000) Achievement.unlock('Evolution');

        this.currentChallenge?.end(true);
    }

    public calculatePoints(level: number): number {
        return Math.round(Math.pow(level / Epoch.EPOCH_LEVEL, 2 + level / 1000) * this.multipliers.epoch);
    }

    public isInChallenge(): boolean {
        return this.currentChallenge != null;
    }

    public calculateProgress(level: number): number {
        return Math.min(1, level / Epoch.EPOCH_LEVEL * this.multipliers.epoch);
    }

    public onSave(save: Save): void {
        save.writeU32(this.count);
        save.writeF64(this.points);
        save.writeArray(this.challenges);
        // 0 if no current challenge
        save.writeU8(this.currentChallenge ? this.challenges.indexOf(this.currentChallenge) + 1 : 0);
        // dont save multipliers
    }

    public onLoad(save: Save): void {
        this.count = save.readU32();
        this.points = save.readF64();
        save.loadArray(this.challenges);
        let challengeIndex = save.readU8() - 1;
        if (challengeIndex > -1)
            this.currentChallenge = this.challenges[challengeIndex];
    }
}