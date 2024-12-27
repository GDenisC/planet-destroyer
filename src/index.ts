import Application from './Application';
import Planet from './game/components/Planet';
import Game from './game/Game';
import PlanetUI from './game/ui/Planet';

const app = new Application();

const planet = new Planet();

new Game(app, planet);

app.spawn({ base: planet, ui: new PlanetUI() });

app.run();