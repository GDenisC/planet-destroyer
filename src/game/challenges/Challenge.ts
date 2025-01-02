import Application from '../../Application';
import { Scene } from '../components/Overlay';
import Game from '../Game';

export default abstract class Challenge {
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
}