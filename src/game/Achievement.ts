import Game from './Game';

export default class Achievement {
    public static readonly all: Achievement[] = [];

    public constructor(public readonly name: string, public readonly description: [string, string], public readonly reward: string | null, public readonly onUnlock: (() => void) | null) {
        Achievement.all.push(this);
    }

    public unlock() {
        Game.instance!.overlay.pushAchievement(this);
        if (this.onUnlock) this.onUnlock();
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