import Application from './Application';
import Planet from './game/components/Planet';
import Game from './game/Game';
import PlanetUI from './game/components/ui/Planet';
import Overlay from './game/components/Overlay';
import OverlayUI from './game/components/ui/Overlay';

const app = new Application();

const overlay = new Overlay();
const planet = new Planet();

new Game(app, overlay, planet);

app.spawn({ base: overlay, ui: new OverlayUI() });
app.spawn({ base: planet, ui: new PlanetUI() });

app.run();