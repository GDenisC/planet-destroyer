import Game from './Game';
import { ISave, Save } from './saves';

export default class Achievement implements ISave {
    private static ID = 0;
    public static readonly all: Achievement[] = [];
    public readonly id = Achievement.ID++;
    public isUnlocked = false;

    public constructor(public readonly name: string, public readonly description: [string, string], public readonly reward: string | null, public readonly onUnlock: ((g: Game) => void) | null) {
        Achievement.all.push(this);
    }

    public unlock(showIt = true) {
        if (this.isUnlocked) return;
        if (showIt) Game.instance!.overlay.pushAchievement(this);
        if (this.onUnlock) this.onUnlock(Game.instance!);
        this.isUnlocked = true;
    }

    public static unlock(name: string, showIt = true) {
        for (let i = 0, l = Achievement.all.length; i < l; ++i) {
            if (Achievement.all[i].name == name) {
                Achievement.all[i].unlock(showIt);
                break;
            }
        }
    }

    public onSave(save: Save): void {
        save.writeU8(this.id);
        save.writeBoolean(this.isUnlocked);
    }

    public onLoad(save: Save): void {
        if (this.id != save.readU8()) {
            save.readBoolean();
            return;
        }
        this.isUnlocked = save.readBoolean();
        if (this.isUnlocked && this.onUnlock)
            this.onUnlock(Game.instance!);
    }
}