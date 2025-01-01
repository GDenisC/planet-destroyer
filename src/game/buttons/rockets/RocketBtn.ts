import Button from '../../Button';
import Rocket from '../../components/Rocket';
import RocketUI from '../../components/ui/Rocket';
import { UIContext } from '../../components/ui/UI';
import Game from '../../Game';

type RocketDummy = {
    offset: number,
    dummySize: number
}

type RocketConfig = {
    size: number,
    speed?: number,
    damage: number,
    gravity?: number,
    onSpawn?: (r: Rocket) => void,
    flags: number
}

// not so button
export default class RocketBtn extends Button {
    private rotation = 0;
    private reload = 0;

    public constructor(
        private readonly config: RocketDummy & RocketConfig,
        private readonly reloadTime = 1,
        public unlocked = false
    ) {
        super('', {
            screenX: 0.5,
            screenY: 1,
            width: 50,
            height: 50
        });
    }

    public render(ctx: CanvasRenderingContext2D, ui: UIContext): void {
        //super.render is implemented here
        if (this.hidden) return;

        let measure = this.measure(ui),
            cos = Math.cos(this.rotation),
            sin = Math.sin(this.rotation);

        super.update(ui.width, ui.height, ui.winScale, measure.width / 2);

        ctx.beginPath();
        ctx.arc(measure.x + measure.w / 2, measure.y + measure.h / 2, measure.w / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(measure.x + measure.w / 2, measure.y + measure.h / 2);
        ctx.arc(measure.x + measure.w / 2, measure.y + measure.h / 2, measure.w / 2, 0, 2 * Math.PI * this.reload / this.reloadTime);
        ctx.closePath();
        ctx.fillStyle = '#fff';
        ctx.fill();

        if (!this.unlocked) {
            ctx.font = 32 * ui.winScale + 'px Ubuntu';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#333';
            ctx.fillText('?', measure.x + measure.w / 2, measure.y + measure.h / 2);
            return;
        }

        RocketUI.renderDummy(
            ctx,
            this.config.dummySize * ui.winScale,
            measure.x + measure.w / 2 + this.config.offset * ui.winScale * cos,
            measure.y + measure.h / 2 + this.config.offset * ui.winScale * sin,
            this.rotation,
            this.config.flags
        );

        this.rotation += ui.dt;
        this.reload = Math.min(this.reloadTime, this.reload + ui.dt);
    }

    public onClick(): void {
        if (this.reload != this.reloadTime) return;

        const game = Game.instance!,
            planet = game.planet,
            rocket = Rocket.spawnOnOrbit(
                planet.rocketPower * this.config.damage,
                planet.rocketSpeed * (this.config.speed || 1),
                planet.rocketGravity * (this.config.gravity || 1),
                true
            );

        rocket.size = this.config.size;
        rocket.flags = this.config.flags;

        this.config.onSpawn?.(rocket);

        this.reload = 0;
    }
}