const BASE =
  "https://raw.githubusercontent.com/tonybaloney/vscode-pets/main/media/fox/";
const ASSETS = {
  red: {
    idle: BASE + "red_idle_8fps.gif",
    walk: BASE + "red_walk_8fps.gif",
    walkFast: BASE + "red_walk_fast_8fps.gif",
    run: BASE + "red_run_8fps.gif",
    lie: BASE + "red_lie_8fps.gif",
    swipe: BASE + "red_swipe_8fps.gif",
    ball: BASE + "red_with_ball_8fps.gif",
  },
  white: {
    idle: BASE + "white_idle_8fps.gif",
    walk: BASE + "white_walk_8fps.gif",
    walkFast: BASE + "white_walk_fast_8fps.gif",
    run: BASE + "white_run_8fps.gif",
    lie: BASE + "white_lie_8fps.gif",
    swipe: BASE + "white_swipe_8fps.gif",
    ball: BASE + "white_with_ball_8fps.gif",
  },
};

const world = document.getElementById("world");
const status = document.getElementById("status");
const reaction = document.getElementById("reaction");
const nightButton = document.getElementById("nightButton");
let reactionTimer = null,
  isNight = false,
  interactionCooldown = 0;

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createStars() {
  const container = document.getElementById("stars");
  if (!container) return;
  for (let i = 0; i < 65; i++) {
    const star = document.createElement("div");
    star.className =
      "star " +
      (Math.random() > 0.8 ? "big" : Math.random() > 0.5 ? "small" : "");
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 55 + "%";
    star.style.animationDelay = Math.random() * 3 + "s";
    star.style.animationDuration = 1.5 + Math.random() * 2.5 + "s";
    container.appendChild(star);
  }
}
createStars();

class Fox {
  constructor({ name, el, img, shadow, assets, x, direction }) {
    this.name = name;
    this.el = el;
    this.img = img;
    this.shadow = shadow;
    this.assets = assets;
    this.x = x;
    this.direction = direction;
    this.state = "idle";
    this.speed = 0;
    this.targetX = x;
    this.nextAction = performance.now() + 1000 + Math.random() * 2500;
    this.lockedUntil = 0;
    this.setImage("idle");
    this.render();
    this.el.addEventListener("click", () => handleFoxClick(this));
  }

  setImage(animation) {
    const src = this.assets[animation];
    if (!src) return;
    if (this.img.dataset.src !== src) {
      this.img.dataset.src = src;
      this.img.src = src;
    }
  }

  setState(state) {
    this.state = state;
    switch (state) {
      case "idle":
        this.speed = 0;
        this.setImage("idle");
        break;
      case "walk":
        this.speed = 0.3 + Math.random() * 0.3;
        this.setImage("walk");
        break;
      case "fast":
        this.speed = 0.7 + Math.random() * 0.3;
        this.setImage("walkFast");
        break;
      case "run":
        this.speed = 1.5 + Math.random() * 0.7;
        this.setImage("run");
        break;
      case "sleep":
        this.speed = 0;
        this.setImage("lie");
        break;
      case "play":
        this.speed = 0;
        this.setImage("ball");
        break;
      case "swipe":
        this.speed = 0;
        this.setImage("swipe");
        break;
    }
  }

  chooseTarget() {
    const margin = 80;
    this.targetX = margin + Math.random() * (window.innerWidth - margin * 2);
    this.direction = this.targetX > this.x ? 1 : -1;
  }

  think(time) {
    if (time < this.nextAction || time < this.lockedUntil) return;
    const r = Math.random();
    if (r < 0.13) {
      this.setState("sleep");
      this.nextAction = time + 5000 + Math.random() * 9000;
    } else if (r < 0.34) {
      this.setState("idle");
      this.nextAction = time + 1200 + Math.random() * 3000;
    } else if (r < 0.62) {
      this.chooseTarget();
      this.setState("walk");
      this.nextAction = time + 3500 + Math.random() * 4500;
    } else if (r < 0.82) {
      this.chooseTarget();
      this.setState("fast");
      this.nextAction = time + 2500 + Math.random() * 3000;
    } else {
      this.chooseTarget();
      this.setState("run");
      this.nextAction = time + 1500 + Math.random() * 2500;
    }
  }

  move() {
    if (!["walk", "fast", "run"].includes(this.state)) return;
    const distance = this.targetX - this.x;
    if (Math.abs(distance) < 2) {
      this.x = this.targetX;
      this.setState("idle");
      this.nextAction = performance.now() + 800 + Math.random() * 2500;
      return;
    }
    this.direction = distance > 0 ? 1 : -1;
    this.x += this.direction * this.speed;
    const min = 30,
      max = window.innerWidth - 110;
    if (this.x < min) {
      this.x = min;
      this.direction = 1;
    }
    if (this.x > max) {
      this.x = max;
      this.direction = -1;
    }
  }

  render() {
    this.el.style.left = `${this.x}px`;
    const flip = this.direction === 1 ? 1 : -1;
    this.el.style.setProperty("--flip", flip);
    this.el.style.transform = `scaleX(${flip})`;
    this.shadow.style.left = `${this.x + 55}px`;
  }

  update(time) {
    this.think(time);
    this.move();
    this.render();
  }
}

const orange = new Fox({
  name: "Oren",
  el: document.getElementById("orange"),
  img: document.getElementById("orangeImg"),
  shadow: document.getElementById("shadowOrange"),
  assets: ASSETS.red,
  x: window.innerWidth * 0.22,
  direction: 1,
});

const white = new Fox({
  name: "Putih",
  el: document.getElementById("white"),
  img: document.getElementById("whiteImg"),
  shadow: document.getElementById("shadowWhite"),
  assets: ASSETS.white,
  x: window.innerWidth * 0.68,
  direction: -1,
});

function showReaction(fox, text) {
  clearTimeout(reactionTimer);
  reaction.textContent = text;
  const position = () => {
    const rect = fox.el.getBoundingClientRect();
    reaction.style.left = `${rect.left + rect.width / 2}px`;
    reaction.style.top = `${rect.top - 12}px`;
  };
  position();
  reaction.classList.add("show");
  const start = performance.now();
  function follow() {
    if (performance.now() - start > 1200) return;
    position();
    requestAnimationFrame(follow);
  }
  follow();
  reactionTimer = setTimeout(() => reaction.classList.remove("show"), 1300);
}

function handleFoxClick(fox) {
  const other = fox === orange ? white : orange;

  if (fox.state === "sleep") {
    fox.setState("idle");
    fox.nextAction = performance.now() + 1500 + Math.random() * 2500;
    showReaction(
      fox,
      randomItem([
        "Hah...? 😴",
        "Hm...?",
        "Udah pagi?",
        "Jangan ganggu...",
        "Aku masih ngantuk...",
        "Lima menit lagi...",
        "Zzz... eh?",
        "Apa sih...? 😪",
        "Hmmmm...",
        "Oh... kamu.",
      ]),
    );
    return;
  }

  /* 30% kemungkinan langsung kabur */
  if (Math.random() < 0.3) {
    fox.setState("run");
    fox.targetX = Math.random() > 0.5 ? window.innerWidth - 80 : 80;
    fox.direction = fox.targetX > fox.x ? 1 : -1;
    fox.lockedUntil = performance.now() + 1800;

    showReaction(
      fox,
      randomItem([
        "AAAA! 😳",
        "EH?!",
        "JANGAN! 🦊",
        "Waduh!",
        "Kaget gue!",
        "WOI 😭",
        "Lari dulu!",
        "Bye!",
        "Kaburrr!",
        "Jangan sentuh aku! 😭",
        "Hah?!",
        "ASTAGA!",
      ]),
    );

    if (
      Math.abs(fox.x - other.x) < 260 &&
      Math.random() < 0.4 &&
      other.state !== "sleep"
    ) {
      setTimeout(() => {
        other.setState("run");
        other.chooseTarget();
        other.lockedUntil = performance.now() + 1600;
        showReaction(
          other,
          randomItem([
            "LARI! 😭",
            "Kenapa?!",
            "Eh tunggu!",
            "WOI!",
            "Ada apa?!",
            "Kabur juga ah!",
            "😭😭",
            "Aku ikut!",
          ]),
        );
      }, 180);
    }
    return;
  }

  fox.el.classList.remove("clicked");
  void fox.el.offsetWidth;
  fox.el.classList.add("clicked");

  showReaction(
    fox,
    randomItem([
      "Hai! 👋",
      "Halo kamu!",
      "Ada apa?",
      "Hehe 😄",
      "Kenapa tuh?",
      "👀",
      "Yap?",
      "Hmm?",
      "Apa nih?",
      "Oh, kamu lagi.",
      "Jangan ganggu 😤",
      "Mau main?",
      "🐾",
      "Hehe...",
      "Aku lihat kamu.",
      "Hah?",
      "Iya?",
      "Psst...",
      "Kemana aja?",
      "Lucu juga ya.",
      "Santai dulu.",
      "Lagi jalan nih.",
      "Bentar ya.",
      "Hmmmm...",
      "✨",
      "🦊",
      "Apa kabar?",
      "Kamu baik-baik aja?",
      "Aku lagi sibuk.",
      "Jangan dipencet terus 😭",
      "Aku tahu kamu.",
      "Hehehe.",
      "Mau ikut?",
      "Lagi menikmati hari.",
      "Enak banget di sini.",
      "Hari yang bagus.",
      "Panas ya?",
      "Dingin nih.",
      "Aku cuma lewat.",
      "Permisi 🐾",
    ]),
  );

  fox.setState("swipe");
  fox.lockedUntil = performance.now() + 1000;

  setTimeout(() => {
    const distance = Math.abs(fox.x - other.x);
    if (distance < 350 && other.state !== "sleep" && Math.random() < 0.55) {
      other.direction = fox.x > other.x ? 1 : -1;
      other.setState("swipe");
      other.lockedUntil = performance.now() + 1000;
      showReaction(
        other,
        randomItem([
          "👀",
          "Apaan tuh?",
          "Kamu kenal dia?",
          "Kenapa?",
          "Heh?",
          "Aku lihat lho.",
          "Hmmm...",
          "Mau main?",
          "Ikut ah.",
          "Apa yang terjadi?",
          "😂",
          "Loh?",
          "Hei!",
          "Psst!",
          "Aku di sini.",
          "Jangan ribut.",
          "Santai.",
          "🐾",
        ]),
      );
    }
  }, 300);

  setTimeout(() => {
    if (fox.state === "swipe") {
      fox.setState("idle");
      fox.nextAction = performance.now() + 1000 + Math.random() * 3000;
    }
  }, 1100);
}

function interaction(time) {
  if (time < interactionCooldown) return;
  if (orange.state === "sleep" || white.state === "sleep") return;

  const distance = Math.abs(orange.x - white.x);

  if (distance < 180 && Math.random() < 0.003) {
    orange.setState("play");
    white.setState("play");
    orange.lockedUntil = time + 3500;
    white.lockedUntil = time + 3500;
    interactionCooldown = time + 7000;

    setTimeout(() => {
      orange.chooseTarget();
      white.chooseTarget();
      orange.setState("run");
      setTimeout(() => white.setState("walk"), 250);
    }, 3500);
  }
}

function toggleNight() {
  isNight = !isNight;
  if (isNight) {
    world.classList.add("sunset-active");
    setTimeout(() => world.classList.add("night"), 350);
    if (nightButton) nightButton.textContent = "☀️ Siang";
  } else {
    world.classList.remove("night");
    setTimeout(() => world.classList.remove("sunset-active"), 700);
    if (nightButton) nightButton.textContent = "🌙 Malam";
  }
}

if (nightButton) {
  nightButton.addEventListener("click", toggleNight);
}

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "n") toggleNight();
});

window.addEventListener("resize", () => {
  orange.x = Math.min(orange.x, window.innerWidth - 110);
  white.x = Math.min(white.x, window.innerWidth - 110);
});

function loop(time) {
  orange.update(time);
  white.update(time);
  interaction(time);
  requestAnimationFrame(loop);
}

orange.setState("idle");
white.setState("idle");
requestAnimationFrame(loop);
