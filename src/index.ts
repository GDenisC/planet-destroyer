import Application from './Application';
import Planet from './game/components/Planet';
import PlanetUI from './game/ui/Planet';
import Rocket from './game/components/Rocket';
import RocketUI from './game/ui/Rocket';
import Collider from './game/components/Collider';
import Game from './game/Game';

const app = new Application();

const planet = new Planet();

new Game(app, planet);

app.spawn({ base: planet, ui: new PlanetUI() });

app.run();