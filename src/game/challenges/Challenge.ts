import Application from '../../Application';
import { Scene } from '../components/Overlay';
import Game from '../Game';
import { ISave, Save } from '../saves';

export default abstract class Challenge implements ISave {
    private startTime: number | null = null;
    public completedTime: number | null = null;
    public completed = false;

    public constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly reward: string
    ) {}

    public abstract onStart(game: Game): void;
    public abstract onReward(game: Game): void;
    public abstract onEnd(game: Game): void;

    public start() {
        const game = Game.instance!;

        game.epoch.currentChallenge = this;

        this.startTime = Application.now();

        game.planet.shootRockets = true; // active challenge
        game.target.canClick = true;
        this.onStart(game);
        game.overlay.scene = Scene.Game;
    }

    public end(completed: boolean) {
        if (!this.startTime) return;

        const game = Game.instance!;

        this.onEnd(game);

        game.epoch.currentChallenge = null;

        if (!completed) {
            this.startTime = null;
            return;
        }

        this.completedTime = Application.now() - this.startTime;
        if (!this.completed) this.onReward(game);
        this.completed = true;
    }

    public isInChallenge(): boolean {
        return this.startTime != null;
    }

    public onSave(save: Save): void {
        save.writeU8((this.name.length + this.description.length + this.reward.length) % 0xff);
        save.writeBoolean(this.completed);
        if (this.completed) save.writeF64(this.completedTime!);
        save.writeBoolean(this.isInChallenge());
        if (this.isInChallenge()) save.writeF64(this.startTime!);
    }

    public onLoad(save: Save): void {
        const sum = (this.name.length + this.description.length + this.reward.length) % 0xff;
        if (sum != save.readU8()) {
            let a = save.readBoolean()
            if (a) save.readF64()
            let b = save.readBoolean()
            if (b) save.readF64()
            return;
        }
        this.completed = save.readBoolean();
        if (this.completed) this.completedTime = save.readF64();
        if (save.readBoolean()) {
            // the challenge is active
            this.startTime = save.readF64();
            this.onStart(Game.instance!);
        }
    }
}