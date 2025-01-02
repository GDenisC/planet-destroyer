"use strict";
(() => {
  // src/Tag.ts
  var Tag = class {
    constructor(name) {
      this.parent = null;
      this.html = document.createElement(name);
    }
    setParent(parent) {
      if (parent) {
        parent.appendChild(this.html);
      } else {
        this.parent?.removeChild(this.html);
      }
      this.parent = parent;
    }
  };

  // src/Canvas.ts
  var Canvas = class extends Tag {
    constructor() {
      super("canvas");
      this.cachedWidth = 0;
      this.cachedHeight = 0;
      this.windowScale = 1;
      this.ctx = this.html.getContext("2d");
      this.html.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    resize(width, height, ratio) {
      width *= ratio;
      height *= ratio;
      this.html.width = this.cachedWidth = width;
      this.html.height = this.cachedHeight = height;
      this.windowScale = Math.max(width / 1920, height / 1080);
    }
    setCursorStyle(style) {
      this.html.style.cursor = style;
    }
  };

  // src/game/Entity.ts
  var Entity = class {
    constructor(app2, components) {
      this.app = app2;
      this.components = {};
      this.zOrder = 3 /* Default */;
      this.destroyed = false;
      let keys = Object.keys(components);
      for (let i = 0, l = keys.length; i < l; ++i) {
        let comp = components[keys[i]];
        comp.init(this);
        this.components[keys[i]] = comp;
      }
    }
    getComponent(name) {
      return this.components[name];
    }
    cleanup() {
      for (let name in this.components) {
        delete this.components[name];
      }
    }
    destroy() {
      this.destroyed = true;
    }
  };

  // src/Styles.ts
  var Styles = class extends Tag {
    constructor() {
      super("style");
      this.addStyle("body", { margin: 0, overflow: "hidden" });
      this.addStyle("canvas", { width: "100vw", height: "100vh" });
      this.addStyle("@font-face", { fontFamily: "Ubuntu", src: "url(./Ubuntu.ttf)" });
    }
    addStyle(name, styles) {
      this.html.innerHTML += name + "{" + Object.keys(styles).map(
        (key) => key + ":" + styles[key].toString()
      ).join(";") + "}";
    }
  };

  // src/Window.ts
  var Window = class {
    constructor() {
      this.canvas = new Canvas();
      this.styles = new Styles();
      this.canvas.setParent(document.body);
      this.styles.setParent(document.head);
    }
  };

  // src/Application.ts
  var _Application = class _Application {
    constructor() {
      this.window = new Window();
      this.entities = /* @__PURE__ */ new Set();
      this.dt = 1e-4;
      // 0 may cause NaN
      this.backgroundColor = "#777";
      this.shakePower = 0;
      this.cachedGameLoop = this.gameLoop.bind(this);
      this.cachedCanvasResize = () => this.window.canvas.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio);
      this.lastTime = 0;
      // checked in gameLoop
      this.entitiesSorted = false;
    }
    gameLoop() {
      let now = _Application.now();
      if (this.lastTime) {
        this.dt = Math.min(1e3 / 30, now - this.lastTime) / 1e3;
      }
      this.lastTime = now;
      if (!this.entitiesSorted) {
        this.entities = new Set(Array.from(this.entities).sort((a, b) => a.zOrder - b.zOrder));
        this.entitiesSorted = false;
      }
      let ctx = this.window.canvas.ctx, canvas = this.window.canvas, ui = {
        x: canvas.cachedWidth / 2,
        y: canvas.cachedHeight / 2,
        width: canvas.cachedWidth,
        height: canvas.cachedHeight,
        winScale: this.window.canvas.windowScale,
        dt: this.dt
      };
      if (this.shakePower) {
        ui.x += Math.random() * this.shakePower - this.shakePower / 2;
        ui.y += Math.random() * this.shakePower - this.shakePower / 2;
      }
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(0, 0, canvas.cachedWidth, canvas.cachedHeight);
      this.setCursorStyle("default" /* Default */);
      for (let entity of Array.from(this.entities)) {
        if (entity.destroyed) continue;
        let entityBase = entity.getComponent("base"), entityUI = entity.getComponent("ui");
        if (entityBase && "update" in entityBase)
          entityBase.update(this.dt);
        if (entityUI) entityUI.render(ctx, ui);
      }
      for (let entity of this.entities) {
        if (!entity.destroyed) continue;
        entity.cleanup();
        this.entities.delete(entity);
      }
      requestAnimationFrame(this.cachedGameLoop);
    }
    run() {
      window.addEventListener("resize", this.cachedCanvasResize);
      window.addEventListener("focus", () => this.lastTime = _Application.now());
      this.cachedCanvasResize();
      this.gameLoop();
    }
    spawn(components) {
      let entity = new Entity(this, components);
      this.entities.add(entity);
      this.entitiesSorted = false;
      return entity;
    }
    setCursorStyle(style) {
      this.window.canvas.setCursorStyle(style);
    }
  };
  _Application.now = "performance" in window && "now" in performance ? performance.now.bind(performance) : Date.now;
  var Application = _Application;

  // src/game/Button.ts
  var _Button = class _Button {
    constructor(text, options) {
      this.text = text;
      this.mouseOver = false;
      this.isPressed = false;
      this.hidden = false;
      this.clicked = false;
      this.options = Object.assign({
        offsetX: 0,
        offsetY: 0,
        screenX: 0,
        screenY: 0,
        width: 150,
        height: 50,
        fontSize: 22,
        fontColor: "#fff",
        strokeWidth: 0,
        strokeColor: "#fff",
        overStrokeColor: "#fff",
        pressStrokeColor: "#fff",
        rounding: 0,
        fillStyle: "rgba(0,0,0,0.5)"
      }, options);
    }
    render(ctx, ui) {
      if (this.hidden) return;
      let opt = this.options, measure = this.measure(ui);
      this.update(ui.width, ui.height, ui.winScale, measure.width / 2);
      ctx.beginPath();
      ctx.roundRect(measure.x, measure.y, measure.w, measure.h, measure.r);
      ctx.closePath();
      if (measure.width) {
        ctx.strokeStyle = this.isPressed ? opt.pressStrokeColor : this.mouseOver ? opt.overStrokeColor : opt.strokeColor;
        ctx.lineWidth = measure.width;
        ctx.stroke();
      }
      ctx.fillStyle = opt.fillStyle;
      ctx.fill();
      if (!this.options.fontSize) return;
      let img = _Button.getTextImageCached(this.text, opt.fontSize * ui.winScale, opt.fontColor);
      ctx.drawImage(img[1], measure.x + measure.w / 2 - img[0].width / 2, measure.y + measure.h / 2 - opt.fontSize * ui.winScale / 2);
    }
    update(width, height, scale, strokeWidth) {
      this.mouseOver = this.isMouseOver(width, height, scale, strokeWidth);
      this.isPressed = this.mouseOver && Game.mouse.click;
      if (this.mouseOver) {
        Game.instance.app.setCursorStyle("pointer" /* Pointer */);
        if (this.isPressed) {
          this.clicked = true;
        } else if (this.clicked) {
          this.onClick();
          this.clicked = false;
        }
      } else {
        this.clicked = false;
      }
    }
    isMouseOver(width, height, scale, strokeWidth) {
      let mouse = Game.mouse, opt = this.options, w = (opt.width / 2 + strokeWidth) * scale, h = (opt.height / 2 + strokeWidth) * scale, x = opt.offsetX * scale + opt.screenX * width, y = opt.offsetY * scale + opt.screenY * height;
      return mouse.x > x - w && mouse.x < x + w && mouse.y > y - h && mouse.y < y + h;
    }
    measure(ui) {
      let opt = this.options, w = opt.width * ui.winScale, h = opt.height * ui.winScale;
      return {
        w,
        h,
        x: opt.offsetX * ui.winScale + opt.screenX * ui.width - w / 2,
        y: opt.offsetY * ui.winScale + opt.screenY * ui.height - h / 2,
        r: opt.rounding * ui.winScale,
        width: opt.strokeWidth * ui.winScale * 2
      };
    }
    static getTextImageCached(text, textSize, textColor) {
      let cache = _Button.textCache.get(text + textSize + textColor);
      if (cache) return cache;
      let canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      let ctx = canvas.getContext("2d");
      ctx.font = `${textSize}px Ubuntu`;
      let metrics = ctx.measureText(text);
      canvas.width = metrics.width;
      canvas.height = textSize;
      ctx.font = `${textSize}px Ubuntu`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = textColor;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      let output = [metrics, canvas];
      _Button.textCache.set(text + textSize + textColor, output);
      return output;
    }
  };
  _Button.textCache = /* @__PURE__ */ new Map();
  var Button = _Button;

  // src/game/buttons/ChallengeBtn.ts
  var ChallengeBtn = class extends Button {
    constructor(challenge) {
      super("START", {
        width: 120,
        height: 40,
        fontSize: 28,
        fontColor: "#fff",
        strokeWidth: 4,
        strokeColor: "rgb(255, 55, 55)",
        overStrokeColor: "rgb(221, 61, 61)",
        pressStrokeColor: "rgb(255, 106, 106)",
        rounding: 20
      });
      this.challenge = challenge;
      this.level = 0;
    }
    render(ctx, ui) {
      let measure = this.measure(ui), width = ui.width / 2, textOffset = 20 * ui.winScale, height = 60 * ui.winScale;
      this.options.offsetX = width / 2 / ui.winScale;
      ctx.beginPath();
      ctx.roundRect(
        measure.x - 20 * ui.winScale,
        measure.y - 20 * ui.winScale,
        measure.w + width + 20 * ui.winScale,
        measure.h + height,
        16
      );
      ctx.closePath();
      ctx.fillStyle = "rgba(42, 5, 5, 0.5)";
      ctx.fill();
      ctx.textBaseline = "middle";
      ctx.font = 36 * ui.winScale + "px Ubuntu";
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff";
      ctx.fillText(this.challenge.name + " Challenge ", measure.x + 140 * ui.winScale, measure.y + textOffset);
      ctx.font = 24 * ui.winScale + "px Ubuntu";
      ctx.textAlign = "right";
      ctx.fillText(
        this.challenge.completed ? "Completed in " + this.challenge.completedTime.toFixed(0) + "s" : "Uncompleted",
        measure.x + width + 80 * ui.winScale,
        measure.y + textOffset * 1.5
      );
      ctx.font = 18 * ui.winScale + "px Ubuntu";
      ctx.textAlign = "left";
      ctx.fillStyle = "#ddd";
      ctx.fillText(this.challenge.description + ". Reward: " + this.challenge.reward, measure.x, measure.y + textOffset + 40 * ui.winScale);
      super.render(ctx, ui);
    }
    onClick() {
      this.challenge.start();
    }
  };

  // src/game/buttons/ChallengesBtn.ts
  var ChallengesBtn = class extends Button {
    constructor() {
      super("CHALLENGES", {
        offsetX: -170,
        offsetY: 40,
        screenX: 1,
        width: 300,
        height: 40,
        fontSize: 26,
        fontColor: "#fff",
        strokeWidth: 4,
        strokeColor: "hsl(0, 64%, 71%)",
        overStrokeColor: "hsl(0, 100%, 86%)",
        pressStrokeColor: "hsl(0, 41.00%, 69.40%)",
        rounding: 20
      });
    }
    onClick() {
      Game.instance.overlay.scene = 3 /* Challenges */;
    }
  };

  // src/game/buttons/EndChallengeBtn.ts
  var EndChallengeBtn = class extends Button {
    constructor() {
      super("END CHALLENGE", {
        offsetX: -170,
        offsetY: 80,
        screenX: 1,
        width: 300,
        height: 40,
        fontSize: 26,
        fontColor: "#fff",
        strokeWidth: 4,
        strokeColor: "rgb(255, 55, 55)",
        overStrokeColor: "rgb(221, 61, 61)",
        pressStrokeColor: "rgb(255, 106, 106)",
        rounding: 12
      });
    }
    onClick() {
      const game2 = Game.instance;
      game2.epoch.currentChallenge?.end(false);
      game2.overlay.scene = 1 /* Game */;
    }
  };

  // src/game/buttons/epoch/EpochUpgrade.ts
  var EpochUpgrade = class extends Button {
    constructor(name, text, cost) {
      super(text, {
        width: 120,
        height: 40,
        fontSize: 28,
        fontColor: "#fff",
        strokeWidth: 4,
        strokeColor: "rgb(218, 255, 55)",
        overStrokeColor: "rgb(191, 221, 61)",
        pressStrokeColor: "rgb(228, 255, 106)",
        rounding: 20
      });
      this.name = name;
      this.cost = cost;
      this.level = 0;
    }
    render(ctx, ui) {
      let measure = this.measure(ui), width = ui.width / 2, textOffset = 20 * ui.winScale, height = 60 * ui.winScale;
      this.options.offsetX = width / 2 / ui.winScale;
      ctx.beginPath();
      ctx.roundRect(
        measure.x - 20 * ui.winScale,
        measure.y - 20 * ui.winScale,
        measure.w + width + 20 * ui.winScale,
        measure.h + height,
        16
      );
      ctx.closePath();
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fill();
      ctx.textBaseline = "middle";
      ctx.font = 36 * ui.winScale + "px Ubuntu";
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff";
      ctx.fillText(this.name + " Upgrade [" + this.level + "]", measure.x + 140 * ui.winScale, measure.y + textOffset);
      ctx.font = 24 * ui.winScale + "px Ubuntu";
      ctx.textAlign = "right";
      ctx.fillText("Cost " + Game.format(this.cost) + " EP", measure.x + width + 80 * ui.winScale, measure.y + textOffset * 1.5);
      ctx.font = 18 * ui.winScale + "px Ubuntu";
      ctx.textAlign = "left";
      ctx.fillStyle = "#ddd";
      ctx.fillText(this.getDescription(), measure.x, measure.y + textOffset + 40 * ui.winScale);
      super.render(ctx, ui);
    }
    onClick() {
      const game2 = Game.instance;
      if (game2.epoch.points < this.cost) return;
      game2.epoch.points -= this.cost;
      this.onPurchase(game2);
      this.level += 1;
    }
    purchaseMany(game2, count) {
      for (let i = 0; i < count; ++i)
        this.onPurchase(game2);
    }
    onSave(save2) {
      save2.writeU8(this.level);
    }
    onLoad(save2) {
      this.level = save2.readU8();
    }
  };

  // src/game/buttons/epoch/CostMultiplier.ts
  var CostMultiplier = class extends EpochUpgrade {
    constructor() {
      super("Cost", "x0.95", 1);
    }
    onPurchase(game2) {
      game2.epoch.multipliers.cost *= 0.95;
      this.cost *= 2;
    }
    getDescription() {
      return "Decrease all rocket's cost by 5% each upgrade. Current cost multiplier is " + Game.instance.epoch.multipliers.cost.toFixed(3);
    }
  };

  // src/game/buttons/epoch/PenetrationChance.ts
  var PenetrationChance = class extends EpochUpgrade {
    constructor() {
      super("Penetration", "+1%", 1);
    }
    onPurchase(game2) {
      game2.epoch.penetrationChance += 0.01;
      this.cost *= 2;
    }
    getDescription() {
      return "Increase the change of rocket to penetrate the planet by 1%. Current penetration chance is " + (Game.instance.epoch.penetrationChance * 100).toFixed(0) + "%";
    }
  };

  // src/game/Collider.ts
  var Collider = class _Collider {
    constructor() {
      this.data = null;
    }
    update(data) {
      this.data = data;
    }
    intersects(other, noRadius) {
      if (!this.data || !other.data) return false;
      return _Collider.circleIntersectCircle(this.data, other.data, noRadius);
    }
    static circleIntersectCircle(c1, c2, noRadius) {
      let dx = c1.x - c2.x, dy = c1.y - c2.y, r = c1.radius + (noRadius ? 0 : c2.radius);
      return dx * dx + dy * dy <= r * r;
    }
  };

  // src/game/components/Decoration.ts
  var Decoration = class {
    constructor(x, y, size, angle, type) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.angle = angle;
      this.type = type;
      this.entity = null;
    }
    init(entity) {
      entity.zOrder = 0 /* Decoration */;
      this.entity = entity;
      Game.instance.decorations.push(this);
    }
  };

  // src/game/components/ui/Decoration.ts
  var DecorationUI = class {
    constructor() {
      this.decoration = null;
    }
    init(entity) {
      this.decoration = entity.getComponent("base");
    }
    render(ctx, ui) {
      let planet2 = Game.instance.planet, scale = ui.winScale / planet2.scale, size = this.decoration.size * scale;
      ctx.translate(ui.x + this.decoration.x * ui.winScale, ui.y + this.decoration.y * ui.winScale);
      if (this.decoration.type == 1 /* Tree */) ctx.rotate(this.decoration.angle);
      ctx.fillStyle = planet2.layers[0].color || "#ddd";
      switch (this.decoration.type) {
        case 0 /* Hill */:
          ctx.beginPath();
          ctx.arc(0, 0, this.decoration.size * scale, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.fill();
          break;
        case 1 /* Tree */:
          ctx.beginPath();
          ctx.lineTo(size * 2, 0);
          ctx.lineTo(-size * 0.1, size * 0.75);
          ctx.lineTo(-size * 0.1, -size * 0.75);
          ctx.closePath();
          ctx.fill();
          break;
      }
      ctx.resetTransform();
    }
  };

  // src/game/components/ui/PlanetHit.ts
  var PlanetHitUI = class {
    constructor() {
      this.app = null;
      this.hit = null;
    }
    init(entity) {
      this.app = entity.app;
      this.hit = entity.getComponent("base");
    }
    render(ctx, ui) {
      let scale = Game.instance.planet.scale;
      ctx.beginPath();
      ctx.arc(ui.x + this.hit.x * ui.winScale, ui.y + this.hit.y * ui.winScale, this.hit.size / scale * ui.winScale, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fillStyle = this.app.backgroundColor;
      ctx.fill();
    }
  };

  // src/game/components/ui/Rocket.ts
  var RocketUI = class _RocketUI {
    constructor() {
      this.rocket = null;
    }
    init(entity) {
      this.rocket = entity.getComponent("base");
    }
    render(ctx, ui) {
      _RocketUI.renderDummy(
        ctx,
        this.rocket.size * ui.winScale,
        ui.x + this.rocket.x * ui.winScale,
        ui.y + this.rocket.y * ui.winScale,
        this.rocket.angle,
        this.rocket.flags
      );
    }
    static renderDummy(ctx, size, x, y, angle, flags) {
      let long = (flags & 1 /* Long */) != 0, sharp = (flags & 2 /* Sharp */) != 0, hammer = (flags & 4 /* Hammer */) != 0, white = (flags & 8 /* White */) != 0, triangle = (flags & 16 /* Triangle */) != 0, longer = (flags & 32 /* Longer */) != 0;
      ctx.translate(x, y);
      ctx.rotate(angle);
      let h = 1;
      if (long) h *= 1.25;
      if (longer) h *= 1.5;
      ctx.beginPath();
      ctx.lineTo(size * 1.5 * h, 0);
      ctx.lineTo(size * 0.4 * h, size * 0.75);
      if (triangle) {
      } else if (sharp) {
        ctx.lineTo(-size * 0.4 * h, 0);
      } else {
        ctx.lineTo(-size * 0.75 * h, size * 0.75);
        ctx.lineTo(-size * 2.25 * h, size * 1.5 * 0.75);
        if (!hammer) ctx.lineTo(-size * 2 * h, 0);
        ctx.lineTo(-size * 2.25 * h, -size * 1.5 * 0.75);
        ctx.lineTo(-size * 0.75 * h, -size * 0.75);
      }
      ctx.lineTo(size * 0.4 * h, -size * 0.75);
      ctx.closePath();
      ctx.fillStyle = white ? "#ddd" : "#333";
      ctx.fill();
      ctx.resetTransform();
    }
  };

  // src/game/components/Explosion.ts
  var Explosion = class {
    constructor(planet2, x, y, size, explosionTime = 0.5) {
      this.planet = planet2;
      this.x = x;
      this.y = y;
      this.size = size;
      this.explosionTime = explosionTime;
      this.entity = null;
      this.timer = 0;
    }
    init(entity) {
      entity.zOrder = 4 /* Explosion */;
      this.entity = entity;
      Game.instance.explosions.push(this);
    }
    update(dt) {
      this.timer += dt * this.planet.getTimeMultiplier();
      if (this.timer > this.explosionTime) {
        this.entity.destroy();
        let explosions = Game.instance.explosions;
        explosions.splice(explosions.indexOf(this), 1);
      }
    }
    alpha() {
      return Math.max(0, (1 - this.timer / this.explosionTime) / Math.max(1, Math.log(1 + this.size * 10 / Planet.SIZE / Game.instance.planet.scale)));
    }
  };

  // src/game/components/ui/Explosion.ts
  var ExplosionUI = class {
    constructor() {
      this.explosion = null;
    }
    init(entity) {
      this.explosion = entity.getComponent("base");
    }
    render(ctx, ui) {
      let scale = Game.instance.planet.scale;
      ctx.beginPath();
      ctx.arc(ui.x + this.explosion.x * ui.winScale, ui.y + this.explosion.y * ui.winScale, this.explosion.size / scale * ui.winScale, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fillStyle = "#fff";
      ctx.globalAlpha = this.explosion.alpha();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  };

  // src/game/components/PlanetHit.ts
  var PlanetHit = class {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.entity = null;
      this.collider = new Collider();
    }
    init(entity) {
      this.entity = entity;
      entity.zOrder = 2 /* PlanetHit */;
      Game.instance.hits.push(this);
      const planet2 = Game.instance.planet;
      entity.app.spawn({ base: new Explosion(planet2, this.x, this.y, this.size), ui: new ExplosionUI() });
      this.updateCollider();
      planet2.tryDestroy(this.collider);
    }
    updateCollider() {
      this.collider.update({ x: this.x, y: this.y, radius: this.size / Game.instance.planet.scale });
    }
  };

  // src/game/components/Rocket.ts
  var TAU = Math.PI * 2;
  function shortAngleDist(a0, a1) {
    var da = (a1 - a0) % TAU;
    return 2 * da % TAU - da;
  }
  function angleLerp(a0, a1, t) {
    return a0 + shortAngleDist(a0, a1) * t;
  }
  function distance(x, y) {
    return Math.sqrt(x * x + y * y);
  }
  var Rocket = class _Rocket {
    constructor(x, y, size, damage, speed, gravity) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.damage = damage;
      this.speed = speed;
      this.gravity = gravity;
      this.entity = null;
      this.app = null;
      this.collider = new Collider();
      this.penetration = 1;
      this.trailTimer = 0;
      this.trailSpawnAtTime = 0;
      this.flags = 0;
      const game2 = Game.instance;
      this.angle = Math.atan2(this.y, this.x) - Math.PI + Math.random() * TAU / game2.planet.scale / game2.epoch.multipliers.reset;
      game2.rockets.push(this);
    }
    init(entity) {
      this.entity = entity;
      this.app = entity.app;
      entity.zOrder = 5 /* Rocket */;
    }
    update(dt) {
      const game2 = Game.instance, planet2 = game2.planet, time = planet2.getTimeMultiplier();
      this.angle = angleLerp(this.angle, Math.atan2(this.y, this.x) - Math.PI, Math.min(1, dt * this.speed * time));
      let speed = dt * 500 * this.speed / planet2.scale * time, dist = distance(this.x, this.y);
      if (dist < speed) {
        this.x = 0;
        this.y = 0;
        speed = Planet.SIZE * planet2.scale;
      } else {
        this.x += Math.cos(this.angle) * speed;
        this.y += Math.sin(this.angle) * speed;
      }
      this.updateCollider();
      if (planet2.intersects(this.collider))
        this.collideWithPlanet(game2, planet2, speed);
      this.trailTimer += dt * time;
      if (this.trailTimer > this.trailSpawnAtTime) {
        let cos = Math.cos(this.angle), sin = Math.sin(this.angle), width = this.size * 2;
        this.app.spawn({ base: new Explosion(planet2, this.x - cos * width, this.y - sin * width, this.size * (6 + Math.random()) / 10 * planet2.scale, 0.33), ui: new ExplosionUI() });
        this.trailSpawnAtTime = Math.random() / 30;
        this.trailTimer = 0;
      }
    }
    collideWithPlanet(game2, planet2, speed) {
      let limit = 1e3, multipliers = game2.epoch.multipliers, cos = Math.cos(this.angle), sin = Math.sin(this.angle);
      do {
        this.x -= cos * speed / 2 / planet2.scale;
        this.y -= sin * speed / 2 / planet2.scale;
        this.updateCollider();
      } while (planet2.intersects(this.collider) && limit-- > 0);
      while (!planet2.intersects(this.collider) && limit-- > 0) {
        this.x += cos * this.damage / 10 / planet2.scale;
        this.y += sin * this.damage / 10 / planet2.scale;
        this.updateCollider();
      }
      if (this.x > 1e9 || this.y > 1e9) {
        this.x = 0;
        this.y = 0;
      }
      let dist = Math.sqrt(this.x * this.x + this.y * this.y) + 1, gravityPower = 1 + (Math.pow(2, this.gravity) - 1) / dist;
      game2.score += this.damage * gravityPower / 10 * multipliers.score;
      this.app.spawn({
        base: new PlanetHit(this.x, this.y, this.damage * gravityPower * multipliers.power),
        ui: new PlanetHitUI()
      });
      if (game2.epoch.penetrationChance > Math.random()) this.penetration += 1;
      if (--this.penetration <= 0) {
        this.entity.destroy();
        game2.rockets.splice(game2.rockets.indexOf(this), 1);
      }
    }
    updateCollider() {
      let scale = Game.instance.planet.scale;
      this.collider.update({ x: this.x, y: this.y, radius: this.size / scale });
    }
    /** Spawn rocket's clone on orbit */
    spawnCloneOnOrbit(useTarget) {
      const rocket = _Rocket.spawnOnOrbit(this.damage, this.speed, this.gravity, useTarget);
      rocket.size = this.size;
      rocket.penetration = this.penetration;
      rocket.flags = this.flags;
      return rocket;
    }
    /** Spawn many rocket's clones */
    spawnClones(amount, useTarget) {
      for (let i = amount + 1; --i; ) {
        this.spawnCloneOnOrbit(useTarget);
      }
    }
    /** Spawn rocket on orbit and return */
    static spawnOnOrbit(damage, speed, gravity, useTarget) {
      const game2 = Game.instance, angle = game2.target.hidden || !useTarget ? Math.random() * TAU : game2.target.angle + Math.random() * TAU / 12 - TAU / 12 / 2;
      const rocket = new _Rocket(
        Math.cos(angle) * 1200,
        Math.sin(angle) * 1200,
        8,
        damage,
        speed,
        gravity
      );
      game2.app.spawn({ base: rocket, ui: new RocketUI() });
      return rocket;
    }
  };

  // src/game/components/Planet.ts
  var planetPalette = [
    { bg: "996", layers: ["ff9", "fd9", "fe9", "ff9", "ef9", "df9"] },
    { bg: "779", layers: ["99f", "9af", "9cf", "a9f", "c9f"] },
    { bg: "a66", layers: ["fa9", "f2a291", "fb9", "e89", "f9a", "fa9", "fc9"] },
    { bg: "5a7", layers: ["8f9", "80f690", "7e8", "6d7", "7e7"] }
  ];
  var _Planet = class _Planet {
    constructor() {
      this.app = null;
      this.scale = 1;
      this.destroyed = false;
      this.deathTime = 0;
      this.layers = [];
      this.rocketTime = 1;
      // instant spawn
      this.rocketInterval = 1;
      this.rocketPower = 100;
      this.rocketSpeed = 1;
      this.rocketGravity = 0;
      this.shootRockets = false;
      this.collider = new Collider();
      this.centerCollider = new Collider();
    }
    init(entity) {
      entity.zOrder = 1 /* Planet */;
      this.app = entity.app;
      this.updateColliders();
      this.updatePalette();
      this.spawnDecorations();
    }
    update(dt) {
      const game2 = Game.instance;
      let time = this.getTimeMultiplier();
      this.rotate(dt / 10 * time);
      if (this.shootRockets) {
        this.rocketTime += dt * time;
        let rocketInterval = this.getRocketInterval();
        if (this.rocketTime > rocketInterval) {
          Rocket.spawnOnOrbit(this.rocketPower, this.rocketSpeed * game2.epoch.multipliers.speed, this.rocketGravity, true);
          this.rocketTime = 0;
        }
      }
      if (!this.destroyed) return;
      let timeSpeed = game2.getTimeSpeed();
      this.deathTime += dt * timeSpeed;
      this.app.shakePower = 10 * time / timeSpeed;
      if (this.deathTime > _Planet.DEATH_TIME * game2.epoch.multipliers.reset)
        this.respawn();
    }
    respawn(fullRespawn = true, giveScore = true) {
      let game2 = Game.instance;
      this.scale *= Math.pow(1.125, 2 / Math.sqrt(this.scale));
      if (giveScore) game2.score += Math.pow(50 * game2.level, 1.1) * game2.epoch.multipliers.score;
      game2.level += Math.round(game2.epoch.multipliers.level);
      if (!fullRespawn) return;
      game2.clearAll();
      this.updateColliders();
      this.destroyed = false;
      this.deathTime = 0;
      this.app.shakePower = 0;
      this.updatePalette();
      this.spawnDecorations();
      this.rocketTime = this.rocketInterval;
      if (giveScore && game2.score > 1e6) Achievement.unlock("One Million");
      switch (game2.level) {
        // achievements
        case 10:
          Achievement.unlock("Level 10");
          break;
        case 1e3:
          Achievement.unlock("Level 1000");
          break;
        case 1e4:
          Achievement.unlock("The End");
          break;
        // achievements with rockets
        case 3:
          Achievement.unlock("Rocket 2");
          break;
        case 7:
          Achievement.unlock("Rocket 3");
          break;
        case 15:
          Achievement.unlock("Rocket 4");
          break;
        case 25:
          Achievement.unlock("Rocket 5");
          break;
        case 40:
          Achievement.unlock("Rocket 6");
          break;
        case 60:
          Achievement.unlock("Rocket 7");
          break;
        case 80:
          Achievement.unlock("Rocket 8");
          break;
      }
    }
    updatePalette() {
      const palette = planetPalette[Math.floor(Math.random() * planetPalette.length)];
      this.makeLayers(palette.layers);
      this.app.backgroundColor = "#" + palette.bg;
    }
    spawnDecorations() {
      if (this.scale > 50) return;
      const amount = Math.min(80, Math.round(30 * this.scale));
      for (let i = 0; i < amount; ++i) {
        let angle = Math.PI * 2 * i / amount + (Math.random() * 30 - 15) * Math.PI / 180;
        this.app.spawn({ base: new Decoration(
          Math.cos(angle) * _Planet.SIZE,
          Math.sin(angle) * _Planet.SIZE,
          10 * Math.sqrt(this.scale) + Math.random() * 40,
          angle,
          Math.random() > 0.36 ? 0 /* Hill */ : 1 /* Tree */
        ), ui: new DecorationUI() });
      }
    }
    makeLayers(layersPalette) {
      this.layers.splice(0, this.layers.length);
      let height = _Planet.SIZE * this.scale, middleRadius = this.centerAreaRadius(), i = 0;
      while (height > middleRadius) {
        this.layers.push({ radius: height / this.scale, color: "#" + layersPalette[i % layersPalette.length] });
        if (i == 0) height -= 15 * this.scale;
        else height -= 5 * this.scale + 50 * i + 40 * i * Math.random() + 5 * this.scale * Math.random();
        i += 1;
      }
    }
    updateColliders() {
      this.collider.update({ x: 0, y: 0, radius: _Planet.SIZE });
      this.centerCollider.update({ x: 0, y: 0, radius: this.centerAreaRadius() });
    }
    intersects(collider) {
      if (!this.collider.intersects(collider, true)) return false;
      for (let hit of Game.instance.hits) {
        if (hit.collider.intersects(collider, true))
          return false;
      }
      return true;
    }
    tryDestroy(collider) {
      if (this.centerCollider.intersects(collider, false)) {
        this.destroyed = true;
      }
    }
    centerAreaRadius() {
      return _Planet.SIZE * Math.max(0.05, 0.25 - this.scale / 10 * 0.2);
    }
    getTimeMultiplier() {
      const game2 = Game.instance, time = game2.getTimeSpeed();
      if (this.deathTime == 0) return time;
      const reset = game2.epoch.multipliers.reset;
      return Math.max(0, _Planet.DEATH_TIME - this.deathTime / reset) / 1.5 / _Planet.DEATH_TIME * time;
    }
    rotate(radians) {
      let sin = Math.sin(radians);
      for (let hit of Game.instance.hits) {
        hit.x = hit.x - hit.y * sin;
        hit.y = hit.x * sin + hit.y;
        hit.updateCollider();
      }
      for (let explosion of Game.instance.explosions) {
        explosion.x = explosion.x - explosion.y * sin;
        explosion.y = explosion.x * sin + explosion.y;
      }
      for (let deco of Game.instance.decorations) {
        deco.x = deco.x - deco.y * sin;
        deco.y = deco.x * sin + deco.y;
        deco.angle += radians;
      }
    }
    reset() {
      this.rocketPower = 100;
      this.rocketSpeed = 1;
      this.rocketGravity = 0;
      this.scale = 1;
      this.destroyed = false;
      this.deathTime = 0;
      this.rocketTime = 1;
      this.rocketInterval = 1;
      this.app.shakePower = 0;
      this.updateColliders();
      this.updatePalette();
      this.spawnDecorations();
    }
    getRocketInterval() {
      return this.rocketInterval * Game.instance.epoch.multipliers.interval;
    }
    postLoad(level) {
      for (let i = 0; i < level - 1; ++i) {
        this.respawn(false, false);
      }
      this.respawn(true, false);
    }
  };
  _Planet.SIZE = 250;
  _Planet.SIZE_SQUARE = _Planet.SIZE * _Planet.SIZE;
  _Planet.DEATH_TIME = 0.75;
  var Planet = _Planet;

  // src/game/buttons/epoch/PlanetResetUpgrade.ts
  var PlanetResetUpgrade = class extends EpochUpgrade {
    constructor() {
      super("Faster Reset", "x0.8", 1);
    }
    onPurchase(game2) {
      game2.epoch.multipliers.reset *= 0.8;
      game2.epoch.multipliers.speed *= 1.1;
      this.cost *= 2;
    }
    getDescription() {
      return "Decrease planet's reset by 20% each upgrade. Current reset time is " + (Planet.DEATH_TIME * Game.instance.epoch.multipliers.reset * 1e3).toFixed(0) + "ms. Also buffs rockets speed by x1.1";
    }
  };

  // src/game/buttons/epoch/PowerMultiplier.ts
  var PowerMultiplier = class extends EpochUpgrade {
    constructor() {
      super("Power", "+1", 1);
    }
    onPurchase(game2) {
      game2.epoch.multipliers.power += 1;
      this.cost *= 2;
    }
    getDescription() {
      return "Increase the power multiplier by 1. Current power multiplier is " + Game.instance.epoch.multipliers.power;
    }
  };

  // src/game/buttons/epoch/ScoreMultiplier.ts
  var ScoreMultiplier = class extends EpochUpgrade {
    constructor() {
      super("Score", "+1", 1);
    }
    onPurchase(game2) {
      game2.epoch.multipliers.score += 1;
      this.cost *= 2;
    }
    getDescription() {
      return "Increase score (income) multiplier by 1. Current score multiplier is " + Game.instance.epoch.multipliers.score;
    }
  };

  // src/game/buttons/epoch/TimeMultiplier.ts
  var TimeMultiplier = class extends EpochUpgrade {
    constructor() {
      super("Time", "+0.1", 1);
    }
    onPurchase(game2) {
      game2.epoch.multipliers.time += 0.1;
      this.cost *= 2;
    }
    getDescription() {
      return "Speed up the time. Current time multiplier is " + Game.instance.epoch.multipliers.time.toFixed(1);
    }
  };

  // src/game/buttons/EpochBtn.ts
  var EpochBtn = class extends Button {
    constructor() {
      super("UPGRADES", {
        offsetX: -170,
        offsetY: 40,
        screenX: 1,
        width: 300,
        height: 40,
        fontSize: 26,
        fontColor: "#fff",
        strokeWidth: 4,
        strokeColor: "rgb(218, 255, 55)",
        overStrokeColor: "rgb(191, 221, 61)",
        pressStrokeColor: "rgb(228, 255, 106)",
        rounding: 20
      });
    }
    onClick() {
      Game.instance.overlay.scene = 2 /* Epoch */;
    }
  };

  // src/game/buttons/NewEpochBtn.ts
  var NewEpochBtn = class extends Button {
    constructor() {
      super("NEW EPOCH", {
        offsetY: 108,
        screenX: 0.5,
        screenY: 0,
        width: 300,
        height: 24,
        fontSize: 20,
        fontColor: "#fff",
        strokeWidth: 4,
        strokeColor: "rgb(218, 255, 55)",
        overStrokeColor: "rgb(191, 221, 61)",
        pressStrokeColor: "rgb(228, 255, 106)",
        rounding: 12
      });
    }
    onClick() {
      Game.instance.epoch.endEpoch();
    }
  };

  // src/game/buttons/PlayBtn.ts
  var PlayBtn = class extends Button {
    constructor() {
      super("PLAY", {
        offsetY: 100,
        screenX: 0.5,
        screenY: 0.5,
        width: 300,
        height: 40,
        fontSize: 26,
        fontColor: "#fff",
        strokeWidth: 4,
        strokeColor: "hsl(199, 64%, 71%)",
        overStrokeColor: "hsl(200, 100%, 86%)",
        pressStrokeColor: "hsl(199, 53%, 76%)",
        rounding: 20
      });
    }
    onClick() {
      const game2 = Game.instance;
      game2.planet.shootRockets = true;
      game2.overlay.scene = 1 /* Game */;
      game2.target.canClick = true;
    }
  };

  // src/game/buttons/rockets/RocketBtn.ts
  var RocketBtn = class extends Button {
    constructor(config, reloadTime = 1, unlocked = false) {
      super("", {
        screenX: 0.5,
        screenY: 1,
        width: 80,
        height: 80
      });
      this.config = config;
      this.reloadTime = reloadTime;
      this.unlocked = unlocked;
      this.rotation = 0;
      this.reload = 0;
    }
    render(ctx, ui) {
      if (this.hidden) return;
      let measure = this.measure(ui), cos = Math.cos(this.rotation), sin = Math.sin(this.rotation);
      super.update(ui.width, ui.height, ui.winScale, measure.width / 2);
      ctx.beginPath();
      ctx.arc(measure.x + measure.w / 2, measure.y + measure.h / 2, measure.w / 2, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(measure.x + measure.w / 2, measure.y + measure.h / 2);
      ctx.arc(measure.x + measure.w / 2, measure.y + measure.h / 2, measure.w / 2, 0, 2 * Math.PI * this.reload / this.reloadTime);
      ctx.closePath();
      ctx.fillStyle = "#fff";
      ctx.fill();
      if (!this.unlocked) {
        ctx.font = 52 * ui.winScale + "px Ubuntu";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#333";
        ctx.fillText("?", measure.x + measure.w / 2, measure.y + measure.h / 2);
        return;
      }
      const scale = 1.5;
      RocketUI.renderDummy(
        ctx,
        this.config.dummySize * ui.winScale * scale,
        measure.x + measure.w / 2 + this.config.offset * ui.winScale * cos * scale,
        measure.y + measure.h / 2 + this.config.offset * ui.winScale * sin * scale,
        this.rotation,
        this.config.flags
      );
      this.rotation += ui.dt;
      this.reload = Math.min(this.reloadTime, this.reload + ui.dt);
    }
    onClick() {
      if (this.reload != this.reloadTime) return;
      const game2 = Game.instance, planet2 = game2.planet, rocket = Rocket.spawnOnOrbit(
        planet2.rocketPower * this.config.damage,
        planet2.rocketSpeed * (this.config.speed || 1) * game2.epoch.multipliers.speed,
        planet2.rocketGravity * (this.config.gravity || 1),
        true
      );
      rocket.size = this.config.size;
      rocket.flags = this.config.flags;
      this.config.onSpawn?.(rocket);
      this.reload = 0;
    }
  };

  // src/game/buttons/rockets/RocketLayers.ts
  var RocketLayers_default = [
    // First layer
    [
      new RocketBtn({
        offset: 5,
        dummySize: 10,
        size: 12.5,
        damage: 1.25,
        flags: 0 /* None */
      }, 1, true),
      new RocketBtn({
        offset: 5,
        dummySize: 9,
        size: 12.5,
        speed: 2,
        damage: 0.6,
        gravity: 0.5,
        onSpawn: (r) => r.penetration = 4,
        flags: 1 /* Long */
      }, 4),
      new RocketBtn({
        offset: 5,
        dummySize: 11.5,
        size: 20,
        speed: 0.6,
        damage: 3,
        flags: 4 /* Hammer */
      }, 8),
      new RocketBtn({
        offset: -3,
        dummySize: 8,
        size: 8,
        speed: 1.5,
        damage: 0.5,
        flags: 2 /* Sharp */
      }, 0.125),
      new RocketBtn({
        offset: 6,
        dummySize: 13,
        size: 60,
        speed: 0.2,
        damage: 90,
        gravity: 0.1,
        flags: 8 /* White */
      }, 90)
    ],
    // Second layer (elites)
    [
      new RocketBtn({
        offset: 5,
        dummySize: 8,
        size: 15,
        speed: 3,
        damage: 0.4,
        gravity: 0,
        onSpawn: (r) => r.penetration = 8,
        flags: 32 /* Longer */
      }, 12),
      new RocketBtn({
        offset: -4,
        dummySize: 7,
        size: 7,
        speed: 2,
        damage: 0.5,
        onSpawn: (r) => r.spawnClones(24, false),
        flags: 16 /* Triangle */
      }, 5),
      new RocketBtn({
        offset: 5,
        dummySize: 7,
        size: 10,
        speed: 4,
        damage: 0.3,
        gravity: 0,
        onSpawn: (r) => r.penetration = 16,
        flags: 1 /* Long */ | 32 /* Longer */
      }, 15)
    ]
    /* Third layer (removed elites)
    [
        new RocketBtn({
            offset: 5, dummySize: 7,
            size: 10, speed: 4, damage: 0.3, gravity: 0,
            onSpawn: r => { r.penetration = 16; r.spawnClones(2, true); },
            flags: RocketFlags.Long | RocketFlags.Longer | RocketFlags.White
        }, 1)
    ]
    */
  ];

  // src/game/buttons/StartEpochBtn.ts
  var NewEpochBtn2 = class extends Button {
    constructor() {
      super("START", {
        offsetY: -60,
        screenX: 0.5,
        screenY: 1,
        width: 300,
        height: 40,
        fontSize: 26,
        fontColor: "#fff",
        strokeWidth: 4,
        strokeColor: "rgb(218, 255, 55)",
        overStrokeColor: "rgb(191, 221, 61)",
        pressStrokeColor: "rgb(228, 255, 106)",
        rounding: 12
      });
    }
    onClick() {
      const game2 = Game.instance;
      game2.planet.shootRockets = true;
      game2.overlay.scene = 1 /* Game */;
      game2.target.canClick = true;
    }
  };

  // src/game/buttons/upgrade/Upgrade.ts
  var Upgrade = class extends Button {
    constructor(name, cost, maxLevel) {
      super("BUY", {
        screenY: 1,
        width: 120,
        height: 42,
        fontSize: 28,
        fontColor: "#fff",
        strokeWidth: 4,
        strokeColor: "hsl(199, 64%, 71%)",
        overStrokeColor: "hsl(200, 100%, 86%)",
        pressStrokeColor: "hsl(199, 53%, 76%)",
        rounding: 20
      });
      this.name = name;
      this.cost = cost;
      this.maxLevel = maxLevel;
      this.cachedDescription = [];
      this.level = 0;
      this.initialCost = cost;
    }
    render(ctx, ui) {
      if (this.cachedDescription.length == 0)
        this.cachedDescription = this.getDescription();
      let measure = this.measure(ui), width = 180 * ui.winScale, description = this.getDescription(), descLength = 20 * description.length * ui.winScale, textOffset = 60 * ui.winScale, height = 90 * ui.winScale;
      ctx.beginPath();
      ctx.roundRect(
        measure.x - width / 2,
        measure.y - height - descLength,
        measure.w + width,
        measure.h + height + descLength * 2,
        [16, 16, 0, 0]
      );
      ctx.closePath();
      ctx.fillStyle = this.cost < Game.instance.score ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.6)";
      ctx.fill();
      ctx.font = 36 * ui.winScale + "px Ubuntu";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#eee";
      ctx.fillText(this.name + " [" + this.level + "]", measure.x + textOffset, measure.y - descLength - 60 * ui.winScale);
      ctx.font = 18 * ui.winScale + "px Ubuntu";
      ctx.fillStyle = "#ddd";
      ctx.fillText(this.level == this.maxLevel ? "MAX" : "Cost: " + Game.format(this.cost), measure.x + textOffset, measure.y - descLength - 28 * ui.winScale);
      ctx.fillStyle = "#ddd";
      ctx.font = 12 * ui.winScale + "px Ubuntu";
      for (let i = description.length - 1; i >= 0; --i) {
        ctx.fillText(description[i], measure.x + textOffset, measure.y - 25 * ui.winScale - 20 * i * ui.winScale);
      }
      super.render(ctx, ui);
    }
    onClick() {
      const game2 = Game.instance;
      if (game2.score < this.cost || this.level >= this.maxLevel) return;
      game2.score -= this.cost;
      this.onPurchase(game2);
      this.level += 1;
      this.cachedDescription = this.getDescription();
      if (this.level == this.maxLevel) this.text = "MAX";
    }
    reset() {
      this.level = 1;
      this.cost = this.initialCost;
      this.cachedDescription = this.getDescription();
      this.text = "BUY";
    }
    purchaseMany(game2, count) {
      for (let i = 0; i < count; ++i)
        this.onPurchase(game2);
    }
    onSave(save2) {
      save2.writeU8(this.level);
    }
    onLoad(save2) {
      this.level = save2.readU8();
    }
  };

  // src/game/buttons/upgrade/GravityUpgrade.ts
  var GravityUpgrade = class extends Upgrade {
    constructor() {
      super("Gravity", 100, 50);
    }
    onPurchase(game2) {
      game2.planet.rocketGravity += 0.2;
      this.cost += this.cost / 3 * game2.epoch.multipliers.cost;
    }
    getDescription() {
      return [
        "+0.2 rocket gravity per upgrade",
        "to the planet. Grows geometrically!",
        "Rockets will damage more if they are closer",
        "Current rocket gravity: " + Game.instance.planet.rocketGravity.toFixed(1)
      ];
    }
  };

  // src/game/buttons/upgrade/LessIntervalUpgrade.ts
  var LessIntervalUpgrade = class extends Upgrade {
    constructor() {
      super("Less Interval", 100, 60);
    }
    onPurchase(game2) {
      game2.planet.rocketInterval *= 0.95;
      this.cost += this.cost / 3.5 * game2.epoch.multipliers.cost;
    }
    getDescription() {
      return [
        "Decreases the rocket interval by x0.95",
        "Current rocket interval: " + (Game.instance.planet.rocketInterval * 1e3).toFixed(1) + "ms"
      ];
    }
  };

  // src/game/buttons/upgrade/PowerUpgrade.ts
  var PowerUpgrade = class extends Upgrade {
    constructor() {
      super("Power", 100, 100);
    }
    onPurchase(game2) {
      game2.planet.rocketPower *= 1.1;
      this.cost += this.cost / 6 * game2.epoch.multipliers.cost;
    }
    getDescription() {
      return [
        "x1.1 rocket power",
        "Current rocket power: " + Game.format(Game.instance.planet.rocketPower)
      ];
    }
  };

  // src/game/buttons/upgrade/SpeedUpgrade.ts
  var SpeedUpgrade = class extends Upgrade {
    constructor() {
      super("Speed", 100, 100);
    }
    onPurchase(game2) {
      if (this.level % 10 == 9) this.cost += this.cost * game2.epoch.multipliers.cost;
      game2.planet.rocketSpeed = Math.pow(game2.planet.rocketSpeed * 1.45, 1.01);
      this.cost += this.cost / 1.1 * game2.epoch.multipliers.cost;
    }
    getDescription() {
      return [
        "x1.45 rocket speed (^1.01)",
        "Current rocket speed: " + Game.format(Game.instance.planet.rocketSpeed, 1)
      ];
    }
  };

  // src/game/components/Overlay.ts
  var _Overlay = class _Overlay {
    constructor() {
      this.achievementsStack = [];
      this.achievementTimer = 0;
      this.nextAchievementAt = 0;
      this.entity = null;
      this.scene = 0 /* Menu */;
      this.upgrades = [
        new PowerUpgrade(),
        new LessIntervalUpgrade(),
        new SpeedUpgrade(),
        new GravityUpgrade()
      ];
      this.epochUpgrades = [
        new PowerMultiplier(),
        new ScoreMultiplier(),
        new CostMultiplier(),
        new TimeMultiplier(),
        new PenetrationChance(),
        new PlanetResetUpgrade()
      ];
      this.challengeButtons = null;
      this.rocketButtons = RocketLayers_default;
      this.rocketButtonsEnabled = true;
      this.play = new PlayBtn();
      this.newEpoch = new NewEpochBtn();
      this.startEpoch = new NewEpochBtn2();
      this.challenges = new ChallengesBtn();
      this.epoch = new EpochBtn();
      this.endChallenge = new EndChallengeBtn();
      this.logoImage = new Image();
      this.logoImage.src = "logo.png";
    }
    init(entity) {
      entity.zOrder = 6 /* Overlay */;
      this.challengeButtons = Game.instance.epoch.challenges.map((challenge) => new ChallengeBtn(challenge));
      this.entity = entity;
    }
    update(dt) {
      if (!this.nextAchievementAt) return;
      this.achievementTimer += dt;
      if (this.achievementTimer > this.nextAchievementAt) {
        this.achievementsStack.shift();
        this.achievementTimer = 0;
        if (!this.achievementsStack[0])
          this.nextAchievementAt = 0;
      }
    }
    pushAchievement(achievement) {
      this.achievementsStack.push(achievement);
      this.nextAchievementAt = _Overlay.ACHIEVEMENT_TIME;
      this.achievementTimer = 0;
    }
    getAchievement() {
      return this.achievementsStack[0];
    }
    /** https://www.desmos.com/Calculator/9th1u5gtpl */
    achievementAlpha() {
      if (!this.nextAchievementAt) return 0;
      return Math.min(1, this.achievementTimer / 0.1 / this.nextAchievementAt) - Math.max(0, (this.achievementTimer - this.nextAchievementAt * 0.9) / 0.1 / this.nextAchievementAt);
    }
    resetUpgrades() {
      for (let upgrade of this.upgrades) {
        upgrade.reset();
      }
    }
    unlockRocket(layer, index) {
      let rocketLayer = this.rocketButtons[layer];
      if (!rocketLayer) return;
      let rocket = rocketLayer[index];
      if (!rocket) return;
      rocket.unlocked = true;
    }
    onSave(save2) {
      save2.writeArray(this.upgrades);
      save2.writeArray(this.epochUpgrades);
    }
    onLoad(save2) {
      save2.loadArray(this.upgrades);
      save2.loadArray(this.epochUpgrades);
    }
    postLoad() {
      for (let upgrade of this.upgrades) {
        upgrade.purchaseMany(Game.instance, upgrade.level);
      }
      for (let upgrade of this.epochUpgrades) {
        upgrade.purchaseMany(Game.instance, upgrade.level);
      }
    }
  };
  _Overlay.ACHIEVEMENT_TIME = 5;
  var Overlay = _Overlay;

  // src/game/challenges/Challenge.ts
  var Challenge = class {
    constructor(name, description, reward) {
      this.name = name;
      this.description = description;
      this.reward = reward;
      this.startTime = null;
      this.completedTime = null;
      this.completed = false;
    }
    start() {
      const game2 = Game.instance;
      game2.epoch.currentChallenge = this;
      this.startTime = Application.now();
      game2.planet.shootRockets = true;
      game2.target.canClick = true;
      this.onStart(game2);
      game2.overlay.scene = 1 /* Game */;
    }
    end(completed) {
      if (!this.startTime) return;
      const game2 = Game.instance;
      this.onEnd(game2);
      game2.epoch.currentChallenge = null;
      if (!completed) {
        this.startTime = null;
        return;
      }
      this.completedTime = Application.now() - this.startTime;
      if (!this.completed) this.onReward(game2);
      this.completed = true;
    }
    isInChallenge() {
      return this.startTime != null;
    }
    onSave(save2) {
      save2.writeU8((this.name.length + this.description.length + this.reward.length) % 255);
      save2.writeBoolean(this.completed);
      if (this.completed) save2.writeF64(this.completedTime);
      save2.writeBoolean(this.isInChallenge());
      if (this.isInChallenge()) save2.writeF64(this.startTime);
    }
    onLoad(save2) {
      const sum = (this.name.length + this.description.length + this.reward.length) % 255;
      if (sum != save2.readU8()) {
        let a = save2.readBoolean();
        if (a) save2.readF64();
        let b = save2.readBoolean();
        if (b) save2.readF64();
        return;
      }
      this.completed = save2.readBoolean();
      if (this.completed) this.completedTime = save2.readF64();
      if (save2.readBoolean()) {
        this.startTime = save2.readF64();
        this.onStart(Game.instance);
      }
    }
  };

  // src/game/challenges/ActiveChallenge.ts
  var ActiveChallenge = class extends Challenge {
    constructor() {
      super("Active", "Auto rockets are disabled", "2x rocket reload");
    }
    onStart(game2) {
      game2.planet.shootRockets = false;
    }
    onReward(game2) {
      game2.epoch.multipliers.interval /= 2;
    }
    onEnd(game2) {
      game2.planet.shootRockets = true;
    }
  };

  // src/game/challenges/EpochChallenge.ts
  var EpochChallenge = class extends Challenge {
    constructor() {
      super("Epoch", "Epoch gain x0.1 (starts from level 500) and rockets are 10x slower", "+2 level per level");
    }
    onStart(game2) {
      game2.epoch.multipliers.epoch *= 0.1;
      game2.epoch.multipliers.speed /= 10;
    }
    onReward(game2) {
      game2.epoch.multipliers.level += 1;
    }
    onEnd(game2) {
      game2.epoch.multipliers.epoch /= 0.1;
      game2.epoch.multipliers.speed *= 10;
    }
  };

  // src/game/challenges/OfflineChallenge.ts
  var OfflineChallenge = class extends Challenge {
    constructor() {
      super("Offline", "Target and buttons are disabled", "2x button reload");
    }
    onStart(game2) {
      game2.target.canClick = false;
      game2.overlay.rocketButtonsEnabled = false;
    }
    onReward(game2) {
      for (let layer of game2.overlay.rocketButtons) {
        for (let rocket of layer) {
          rocket.reloadTime /= 2;
        }
      }
    }
    onEnd(game2) {
      game2.target.canClick = true;
      game2.overlay.rocketButtonsEnabled = true;
    }
  };

  // src/game/Epoch.ts
  var _Epoch = class _Epoch {
    constructor() {
      this.challenges = [
        new OfflineChallenge(),
        new ActiveChallenge(),
        new EpochChallenge()
      ];
      this.currentChallenge = null;
      this.multipliers = {
        power: 1,
        cost: 1,
        score: 1,
        time: 1,
        reset: 1,
        speed: 1,
        epoch: 1,
        level: 1,
        interval: 1
      };
      this.penetrationChance = 0;
      this.points = 0;
      this.count = 0;
    }
    endEpoch() {
      const game2 = Game.instance;
      if (this.count == 0) Achievement.unlock("First Epoch");
      this.count += 1;
      this.points += this.calculatePoints(game2.level);
      game2.reset();
      game2.overlay.scene = 2 /* Epoch */;
      game2.planet.shootRockets = false;
      game2.target.canClick = false;
      if (this.points > 1e6) Achievement.unlock("Evolution");
      this.currentChallenge?.end(true);
    }
    calculatePoints(level) {
      return Math.round(Math.pow(level / _Epoch.EPOCH_LEVEL, 2 + level / 1e3) * this.multipliers.epoch);
    }
    isInChallenge() {
      return this.currentChallenge != null;
    }
    calculateProgress(level) {
      return Math.min(1, level / _Epoch.EPOCH_LEVEL * this.multipliers.epoch);
    }
    onSave(save2) {
      save2.writeU32(this.count);
      save2.writeF64(this.points);
      save2.writeArray(this.challenges);
      save2.writeU8(this.currentChallenge ? this.challenges.indexOf(this.currentChallenge) + 1 : 0);
    }
    onLoad(save2) {
      this.count = save2.readU32();
      this.points = save2.readF64();
      save2.loadArray(this.challenges);
      let challengeIndex = save2.readU8() - 1;
      if (challengeIndex > -1)
        this.currentChallenge = this.challenges[challengeIndex];
    }
  };
  _Epoch.EPOCH_LEVEL = 100;
  var Epoch = _Epoch;

  // src/game/saves/Save.ts
  var _Save = class _Save {
    constructor(u8 = new Uint8Array(_Save.INITIAL_SIZE), length = _Save.INITIAL_SIZE) {
      this.u8 = u8;
      this.length = length;
      this.offset = 0;
      this.dataview = new DataView(this.u8.buffer);
    }
    static fromU8(u8) {
      return new _Save(u8, u8.length);
    }
    static fromLocalStorage() {
      const storage = localStorage.getItem("save");
      if (!storage) return void 0;
      return _Save.fromU8(
        new Uint8Array(
          atob(storage).split("").map((char) => char.charCodeAt(0))
        )
      );
    }
    toLocalStorage() {
      localStorage.setItem("save", btoa(
        Array.from(this.u8.slice(0, this.offset)).map((byte) => String.fromCharCode(byte)).join("")
      ));
    }
    grow() {
      let newU8 = new Uint8Array(this.length += _Save.INITIAL_SIZE);
      newU8.set(this.u8, 0);
      this.u8 = newU8;
      this.dataview = new DataView(this.u8.buffer);
    }
    shouldGrow(length) {
      if (this.offset + length > this.length) {
        this.grow();
      }
    }
    writeU8(value) {
      this.shouldGrow(1);
      this.u8[this.offset] = value;
      this.offset += 1;
    }
    writeU16(value) {
      this.shouldGrow(2);
      this.dataview.setUint16(this.offset, value, _Save.LITTLE_ENDIAN);
      this.offset += 2;
    }
    writeU32(value) {
      this.shouldGrow(4);
      this.dataview.setUint32(this.offset, value, _Save.LITTLE_ENDIAN);
      this.offset += 4;
    }
    writeF64(value) {
      this.shouldGrow(8);
      this.dataview.setFloat64(this.offset, value, _Save.LITTLE_ENDIAN);
      this.offset += 8;
    }
    writeBoolean(value) {
      this.writeU8(value ? 1 : 0);
    }
    writeString(value) {
      this.shouldGrow(value.length + 1);
      for (let i = 0; i < value.length; i++) {
        this.u8[this.offset] = value.charCodeAt(i);
        this.offset += 1;
      }
      this.u8[this.offset] = 0;
      this.offset += 1;
    }
    write(data) {
      data.onSave(this);
    }
    writeArray(arr) {
      this.writeU8(arr.length);
      for (let i = 0; i < arr.length; i++) {
        this.write(arr[i]);
      }
    }
    isCorrupted() {
      return this.offset > this.length;
    }
    checkCorruption() {
      if (this.isCorrupted())
        throw new Error("Save is corrupted");
    }
    readU8() {
      let value = this.u8[this.offset];
      this.offset += 1;
      this.checkCorruption();
      return value;
    }
    readU16() {
      let value = this.dataview.getUint16(this.offset, _Save.LITTLE_ENDIAN);
      this.offset += 2;
      this.checkCorruption();
      return value;
    }
    readU32() {
      let value = this.dataview.getUint32(this.offset, _Save.LITTLE_ENDIAN);
      this.offset += 4;
      this.checkCorruption();
      return value;
    }
    readF64() {
      let value = this.dataview.getFloat64(this.offset, _Save.LITTLE_ENDIAN);
      this.offset += 8;
      this.checkCorruption();
      return value;
    }
    readBoolean() {
      return this.readU8() == 1;
    }
    readString() {
      let value = "";
      while (this.u8[this.offset] != 0) {
        value += String.fromCharCode(this.readU8());
      }
      this.offset += 1;
      this.checkCorruption();
      return value;
    }
    load(data) {
      data.onLoad(this);
    }
    loadArray(arr) {
      let length = this.readU8();
      for (let i = 0; i < length; ++i) {
        this.load(arr[i]);
      }
    }
  };
  _Save.VERSION = 1;
  _Save.INITIAL_SIZE = 65535;
  _Save.LITTLE_ENDIAN = true;
  var Save = _Save;

  // src/game/Game.ts
  var _Game = class _Game {
    constructor(app2, overlay2, planet2, target2) {
      this.app = app2;
      this.overlay = overlay2;
      this.planet = planet2;
      this.target = target2;
      /** Used in `dev` variable */
      this.Achievement = Achievement;
      /** Rockets spawned in the game in the current moment */
      this.rockets = [];
      /** Hits spawned in the game in the current moment */
      this.hits = [];
      /** Effects spawned in the game in the current moment */
      this.explosions = [];
      /** Decorations of the planet in the current moment */
      this.decorations = [];
      /** Game epoch */
      this.epoch = new Epoch();
      /** Current game score */
      this.score = 0;
      _Game.instance = this;
      this.level = Math.round(this.epoch.multipliers.level);
      if (_Game.isMobile) {
        window.addEventListener("touchstart", this.onTouchStart.bind(this));
        window.addEventListener("touchend", this.onTouchEnd.bind(this));
        window.addEventListener("touchcancel", this.onTouchEnd.bind(this));
        window.addEventListener("touchmove", this.onTouchMove.bind(this));
      } else {
        window.addEventListener("mousedown", this.onMouseStart.bind(this));
        window.addEventListener("mouseup", this.onMouseEnd.bind(this));
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
      }
      window.addEventListener("beforeunload", () => {
        const save2 = new Save();
        save2.write(this);
        save2.toLocalStorage();
      });
    }
    onSave(save2) {
      save2.writeU8(Save.VERSION);
      save2.writeU32(this.level);
      save2.writeF64(this.score);
      save2.write(this.overlay);
      save2.write(this.epoch);
      save2.writeArray(Achievement.all);
    }
    onLoad(save2) {
      if (save2.readU8() != Save.VERSION) {
        if (prompt("This save is from an older version of the game. Do you want to delete it (yes/no)?") != "yes")
          return;
      }
      let level = save2.readU32();
      this.score = save2.readF64();
      save2.load(this.overlay);
      save2.load(this.epoch);
      this.planet.postLoad(level);
      this.level -= 1;
      this.overlay.postLoad();
      save2.loadArray(Achievement.all);
    }
    setMousePosition(x, y) {
      _Game.mouse.x = x * window.devicePixelRatio;
      _Game.mouse.y = y * window.devicePixelRatio;
    }
    onMouseStart(e) {
      if (e.button == 0) _Game.mouse.click = true;
      this.onMouseMove(e);
    }
    onMouseMove(e) {
      this.setMousePosition(e.clientX, e.clientY);
    }
    onMouseEnd(e) {
      if (e.button == 0) _Game.mouse.click = false;
      this.onMouseMove(e);
    }
    onTouchStart(e) {
      _Game.mouse.click = true;
      this.onTouchMove(e);
    }
    onTouchMove(e) {
      let touch = e.touches[0];
      this.setMousePosition(touch.clientX, touch.clientY);
    }
    onTouchEnd(_) {
      _Game.mouse.click = false;
    }
    clearRockets() {
      for (let rocket of this.rockets) {
        rocket.entity.destroy();
      }
      this.rockets.splice(0, this.rockets.length);
    }
    clearHits() {
      for (let hit of this.hits) {
        hit.entity.destroy();
      }
      this.hits.splice(0, this.hits.length);
    }
    clearExplosions() {
      for (let explosion of this.explosions) {
        explosion.entity.destroy();
      }
      this.explosions.splice(0, this.explosions.length);
    }
    clearTrees() {
      for (let tree of this.decorations) {
        tree.entity.destroy();
      }
      this.decorations.splice(0, this.decorations.length);
    }
    clearAll() {
      this.clearRockets();
      this.clearHits();
      this.clearExplosions();
      this.clearTrees();
    }
    /** speedhack */
    getTimeSpeed() {
      return this.epoch.multipliers.time;
    }
    reset() {
      this.score = 0;
      this.level = Math.round(this.epoch.multipliers.level);
      this.clearAll();
      this.planet.reset();
      this.overlay.resetUpgrades();
    }
    static format(n, digits = 0) {
      if (n > 1e6)
        return n.toExponential(2);
      return n.toFixed(digits);
    }
  };
  /** Detects if the user is using a mobile device */
  _Game.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  /** Mouse object */
  _Game.mouse = { x: 0, y: 0, click: false };
  /** Game instance */
  _Game.instance = null;
  var Game = _Game;

  // src/game/Achievement.ts
  var _Achievement = class _Achievement {
    constructor(name, description, reward, onUnlock) {
      this.name = name;
      this.description = description;
      this.reward = reward;
      this.onUnlock = onUnlock;
      this.id = _Achievement.ID++;
      this.isUnlocked = false;
      _Achievement.all.push(this);
    }
    unlock(showIt = true) {
      if (this.isUnlocked) return;
      if (showIt) Game.instance.overlay.pushAchievement(this);
      if (this.onUnlock) this.onUnlock(Game.instance);
      this.isUnlocked = true;
    }
    static unlock(name, showIt = true) {
      for (let i = 0, l = _Achievement.all.length; i < l; ++i) {
        if (_Achievement.all[i].name == name) {
          _Achievement.all[i].unlock(showIt);
          break;
        }
      }
    }
    onSave(save2) {
      save2.writeU8(this.id);
      save2.writeBoolean(this.isUnlocked);
    }
    onLoad(save2) {
      if (this.id != save2.readU8()) {
        save2.readBoolean();
        return;
      }
      this.isUnlocked = save2.readBoolean();
      if (this.isUnlocked && this.onUnlock)
        this.onUnlock(Game.instance);
    }
  };
  _Achievement.ID = 0;
  _Achievement.all = [];
  var Achievement = _Achievement;

  // src/game/components/Target.ts
  var _Target = class _Target {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.angle = 0;
      this.hidden = true;
      this.canClick = false;
      this.holding = false;
      this.lastClickTimer = 0;
    }
    init(_) {
    }
    update(dt) {
      if (!this.canClick) return;
      const game2 = Game.instance, canvas = game2.app.window.canvas, mouse = Game.mouse;
      let mx = mouse.x - canvas.cachedWidth / 2, my = mouse.y - canvas.cachedHeight / 2;
      if (mx * mx + my * my < Planet.SIZE_SQUARE * canvas.windowScale * canvas.windowScale) {
        game2.app.setCursorStyle("pointer" /* Pointer */);
        if (mouse.click && !this.holding) {
          this.x = mouse.x;
          this.y = mouse.y;
          this.angle = Math.atan2(my, mx);
          this.hidden = false;
          this.lastClickTimer = 0;
          this.holding = true;
        } else if (!mouse.click) {
          this.holding = false;
        }
      }
      if (this.hidden) return;
      const planet2 = game2.planet;
      this.lastClickTimer += dt * planet2.getTimeMultiplier();
      if (this.lastClickTimer > _Target.ACTIVE_TIME) {
        this.lastClickTimer = 0;
        this.hidden = true;
      }
    }
    alpha() {
      return Math.max(0, 1 - this.lastClickTimer / _Target.ACTIVE_TIME);
    }
  };
  _Target.ACTIVE_TIME = 2;
  var Target = _Target;

  // src/game/components/ui/Overlay.ts
  var OverlayUI = class {
    constructor() {
      this.overlay = null;
    }
    init(entity) {
      this.overlay = entity.getComponent("base");
    }
    render(ctx, ui) {
      switch (this.overlay.scene) {
        case 0 /* Menu */:
          this.renderMenu(ctx, ui);
          break;
        case 1 /* Game */:
          this.renderGame(ctx, ui);
          break;
        case 2 /* Epoch */:
          this.renderEpoch(ctx, ui);
          break;
        case 3 /* Challenges */:
          this.renderChallenges(ctx, ui);
          break;
      }
      this.renderAchievement(ctx, ui);
    }
    renderMenu(ctx, ui) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, ui.width, ui.height);
      let logo = this.overlay.logoImage, logoSize = 400 * ui.winScale;
      if (logo.complete) ctx.drawImage(
        logo,
        ui.x - logoSize / 2,
        ui.y - logoSize / 2 - 150 * ui.winScale,
        logoSize,
        logoSize
      );
      this.overlay.play.render(ctx, ui);
    }
    renderGame(ctx, ui) {
      const game2 = Game.instance;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, ui.width, 40 * ui.winScale);
      ctx.fillStyle = "#fff";
      ctx.font = 26 * ui.winScale + "px Ubuntu";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("PLANET DESTROYER", 7 * ui.winScale, 20 * ui.winScale);
      ctx.textAlign = "center";
      ctx.fillText(Game.format(game2.score) + " score", ui.width / 2, 20 * ui.winScale);
      ctx.font = 36 * ui.winScale + "px Ubuntu";
      ctx.fillText("Level " + game2.level, ui.width / 2, 72 * ui.winScale);
      let upgrades = this.overlay.upgrades;
      upgrades[0].options.offsetX = 180;
      upgrades[0].options.offsetY = -40;
      upgrades[0].render(ctx, ui);
      upgrades[1].options.offsetX = 180 + 340;
      upgrades[1].options.offsetY = -40;
      upgrades[1].render(ctx, ui);
      upgrades[2].options.screenX = 1;
      upgrades[2].options.offsetX = -180 - 340;
      upgrades[2].options.offsetY = -40;
      upgrades[2].render(ctx, ui);
      upgrades[3].options.screenX = 1;
      upgrades[3].options.offsetX = -180;
      upgrades[3].options.offsetY = -40;
      upgrades[3].render(ctx, ui);
      this.renderEpochGain(ctx, ui, game2.epoch.calculateProgress(game2.level), game2);
      this.renderRocketButtons(ctx, ui);
      if (game2.epoch.isInChallenge()) this.overlay.endChallenge.render(ctx, ui);
    }
    renderRocketButtons(ctx, ui) {
      if (!this.overlay.rocketButtonsEnabled) return;
      const buttons = this.overlay.rocketButtons;
      let w = 80 + 4, h = 80 + 4, l = buttons.length;
      for (let i = 0; i < l; ++i) {
        let k = buttons[i].length, fw = w * k;
        for (let j = 0; j < k; ++j) {
          let button = buttons[i][j];
          button.options.offsetX = (j + 0.5) * w - fw / 2;
          button.options.offsetY = -(i + 0.75) * h;
          button.render(ctx, ui);
        }
      }
    }
    renderEpochGain(ctx, ui, progress, game2) {
      if (progress < 0.5) return;
      if (progress < 1) {
        const progressBarSize = 300 * ui.winScale;
        ctx.beginPath();
        ctx.roundRect(ui.width / 2 - progressBarSize / 2, 94 * ui.winScale, progressBarSize, 24 * ui.winScale, 12 * ui.winScale);
        ctx.closePath();
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(ui.width / 2 - progressBarSize / 2, 94 * ui.winScale, progressBarSize * progress, 24 * ui.winScale, 12 * ui.winScale);
        ctx.closePath();
        ctx.fillStyle = "rgb(218,255,55)";
        ctx.fill();
        return;
      }
      this.overlay.newEpoch.text = Game.format(game2.epoch.calculatePoints(game2.level)) + " EP GAIN";
      this.overlay.newEpoch.render(ctx, ui);
    }
    renderEpoch(ctx, ui) {
      const game2 = Game.instance;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, ui.width, ui.height);
      ctx.font = 36 * ui.winScale + "px Ubuntu";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgb(218,255,55)";
      ctx.fillText(Game.format(game2.epoch.points) + " Epoch Points", ui.width / 2, 36 * ui.winScale);
      ctx.font = 24 * ui.winScale + "px Ubuntu";
      ctx.fillStyle = "rgb(127, 148, 33)";
      ctx.fillText(game2.epoch.count + " Epoch", ui.width / 2, (36 + 24 + 4) * ui.winScale);
      for (let i = 0, l = this.overlay.epochUpgrades.length; i < l; ++i) {
        let upgrade = this.overlay.epochUpgrades[i];
        upgrade.options.offsetY = 130 * (i + 1);
        upgrade.render(ctx, ui);
      }
      this.overlay.startEpoch.render(ctx, ui);
      this.overlay.challenges.render(ctx, ui);
    }
    renderChallenges(ctx, ui) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, ui.width, ui.height);
      ctx.font = 36 * ui.winScale + "px Ubuntu";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgb(255, 55, 55)";
      ctx.fillText("Challenges", ui.width / 2, 36 * ui.winScale);
      ctx.font = 24 * ui.winScale + "px Ubuntu";
      ctx.fillStyle = "rgb(194, 43, 43)";
      ctx.fillText("To complete the challenge you need to start new epoch", ui.width / 2, (36 + 24 + 4) * ui.winScale);
      for (let i = 0, l = this.overlay.challengeButtons.length; i < l; ++i) {
        let btn = this.overlay.challengeButtons[i];
        btn.options.offsetY = 130 * (i + 1);
        btn.render(ctx, ui);
      }
      this.overlay.epoch.render(ctx, ui);
    }
    renderAchievement(ctx, ui) {
      const achievement = this.overlay.getAchievement();
      if (!achievement) return;
      let p = ui.winScale, w = 500 * p, h = 108 * p - (achievement.reward ? 0 : (16 + 5) * p), x = 20 * p, y = 20 * p;
      ctx.globalAlpha = this.overlay.achievementAlpha();
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 16);
      ctx.closePath();
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fill();
      ctx.font = 24 * p + "px Ubuntu";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#fff";
      ctx.fillText(achievement.name, x + 16 * p, y + 16 * p);
      ctx.fillStyle = "#ccc";
      ctx.font = 16 * p + "px Ubuntu";
      ctx.fillText(achievement.description[0], x + 16 * p, y + (24 + 16 + 2) * p);
      ctx.fillText(achievement.description[1], x + 16 * p, y + (24 + 16 + 2 + 16 + 2) * p);
      if (achievement.reward) {
        ctx.fillStyle = "#fff";
        ctx.fillText("Reward: " + achievement.reward, x + 16 * p, y + (24 + 16 + 2 + 16 + 2 + 16 + 5) * p);
      }
      ctx.globalAlpha = 1;
    }
  };

  // src/game/components/ui/Planet.ts
  var PlanetUI = class {
    constructor() {
      this.planet = null;
    }
    init(entity) {
      this.planet = entity.getComponent("base");
    }
    render(ctx, ui) {
      for (let i = 0, l = this.planet.layers.length; i < l; ++i) {
        let layer = this.planet.layers[i];
        ctx.beginPath();
        ctx.arc(ui.x, ui.y, layer.radius * ui.winScale, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = layer.color;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(ui.x, ui.y, this.planet.centerAreaRadius() * ui.winScale, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fillStyle = "#e66";
      ctx.fill();
    }
  };

  // src/game/components/ui/Target.ts
  var _TargetUI = class _TargetUI {
    constructor() {
      this.target = null;
    }
    init(entity) {
      this.target = entity.getComponent("base");
    }
    render(ctx, ui) {
      if (this.target.hidden) return;
      let size = 150 * ui.winScale;
      ctx.translate(this.target.x, this.target.y);
      ctx.scale(size, size);
      ctx.globalAlpha = this.target.alpha();
      ctx.fillStyle = "#fff";
      ctx.fill(_TargetUI.PATH);
      ctx.globalAlpha = 1;
      ctx.resetTransform();
    }
  };
  _TargetUI.PATH = new Path2D("M.2952-.0401V-.2993H.036v.1074H-.0401V-.2993H-.2993v.2592h.1074V.036H-.2993V.2952h.2592V.1878H.036V.2952H.2952V.036H.1878V-.0401H.2952Zm.0713 0H.4958V.036H.3665V.3665H.036V.4958H-.0401V.3665H-.3707V.036H-.5V-.0401h.1293V-.3707h.3306V-.5H.036v.1293H.3665v.3305Z");
  var TargetUI = _TargetUI;

  // src/index.ts
  new Achievement("Level 10", ["Reach level 10", "Easy start"], "+10% rockets speed", (g) => g.epoch.multipliers.speed *= 1.1);
  new Achievement("One Million", ["Reach 1.000.000 score", ""], "+10% score", (g) => g.epoch.multipliers.score += 0.1);
  new Achievement("First Epoch", ["Get your first epoch", "Prestige at level 100+"], "4x reset speed", (g) => g.epoch.multipliers.reset /= 4);
  new Achievement("Level 1000", ["Reach level 1000", ""], "+50% rockets power", (g) => g.epoch.multipliers.power += 0.5);
  new Achievement("Evolution", ["Reach 1.000.000 EP", ""], "2x EP gain", (g) => g.epoch.multipliers.epoch *= 2);
  new Achievement("The End", ["Reach level 10000", "At the end of the game"], "`dev` variable unlocked in console", (g) => window["dev"] = g);
  new Achievement("Rocket 2", ["Reach level 3", ""], "Unlock new rocket", (g) => g.overlay.unlockRocket(0, 1));
  new Achievement("Rocket 3", ["Reach level 7", ""], "Unlock new rocket", (g) => g.overlay.unlockRocket(0, 2));
  new Achievement("Rocket 4", ["Reach level 15", ""], "Unlock new rocket", (g) => g.overlay.unlockRocket(0, 3));
  new Achievement("Rocket 5", ["Reach level 25", ""], "Unlock new rocket", (g) => g.overlay.unlockRocket(0, 4));
  new Achievement("Rocket 6", ["Reach level 40", ""], "Unlock new rocket", (g) => g.overlay.unlockRocket(1, 0));
  new Achievement("Rocket 7", ["Reach level 60", ""], "Unlock new rocket", (g) => g.overlay.unlockRocket(1, 1));
  new Achievement("Rocket 8", ["Reach level 80", ""], "Unlock new rocket", (g) => g.overlay.unlockRocket(1, 2));
  var app = new Application();
  var overlay = new Overlay();
  var planet = new Planet();
  var target = new Target();
  var game = new Game(app, overlay, planet, target);
  app.spawn({ base: overlay, ui: new OverlayUI() });
  app.spawn({ base: planet, ui: new PlanetUI() });
  app.spawn({ base: target, ui: new TargetUI() });
  var save = Save.fromLocalStorage();
  if (save) {
    try {
      save.load(game);
    } catch (e) {
      if (e.message.includes("Invalid"))
        alert(e.message);
      else
        console.error(e);
    }
  }
  app.run();
})();
