import Application from './Application';
import Achievement from './game/Achievement';
import Overlay from './game/components/Overlay';
import Planet from './game/components/Planet';
import OverlayUI from './game/components/ui/Overlay';
import PlanetUI from './game/components/ui/Planet';
import Game from './game/Game';

new Achievement('Level 10', ['Reach level 10', 'Easy start'], '+10% rockets speed', g => g.epoch.multipliers.speed *= 1.1);
new Achievement('One Million', ['Reach 1.000.000 score', ''], '+10% score', g => g.epoch.multipliers.score += 0.1);
new Achievement('First Epoch', ['Get your first epoch', 'Prestige at level 100+'], '4x reset speed', g => g.epoch.multipliers.reset /= 4);
new Achievement('Level 1000', ['Reach level 1000', ''], '+50% rockets power', g => g.epoch.multipliers.power += 0.5);
new Achievement('Evolution', ['Reach 1.000.000 EP', ''], '2x EP gain', g => g.epoch.multipliers.epoch *= 2);
new Achievement('The End', ['Reach level 10000', 'At the end of the game'], '`dev` variable unlocked in console', g => window['dev'] = g);

const app = new Application();

const overlay = new Overlay();
const planet = new Planet();

new Game(app, overlay, planet);

app.spawn({ base: overlay, ui: new OverlayUI() });
app.spawn({ base: planet, ui: new PlanetUI() });

app.run();