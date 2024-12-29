import Application from './Application';
import Achievement from './game/Achievement';
import Overlay from './game/components/Overlay';
import Planet from './game/components/Planet';
import OverlayUI from './game/components/ui/Overlay';
import PlanetUI from './game/components/ui/Planet';
import Game from './game/Game';

new Achievement('First Epoch', ['Get your first epoch', ''], '2x reset speed', () => Game.instance!.epoch.multipliers.reset /= 2);

const app = new Application();

const overlay = new Overlay();
const planet = new Planet();

new Game(app, overlay, planet);

app.spawn({ base: overlay, ui: new OverlayUI() });
app.spawn({ base: planet, ui: new PlanetUI() });

app.run();