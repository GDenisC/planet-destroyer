import Game from './Game';

export default class Achievement {
    private static ID = 0;
    public static readonly all: Achievement[] = [];
    public readonly id = Achievement.ID++;
    public isUnlocked = false;

    public constructor(public readonly name: string, public readonly description: [string, string], public readonly reward: string | null, public readonly onUnlock: ((g: Game) => void) | null) {
        Achievement.all.push(this);
    }

    public unlock() {
        if (this.isUnlocked) return;
        Game.instance!.overlay.pushAchievement(this);
        if (this.onUnlock) this.onUnlock(Game.instance!);
        this.isUnlocked = true;
    }

    public static unlock(name: string) {
        for (let i = 0, l = Achievement.all.length; i < l; ++i) {
            if (Achievement.all[i].name == name) {
                Achievement.all[i].unlock();
                break;
            }
        }
    }
}