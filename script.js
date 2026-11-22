
/* =========================================
   A LITTLE UNIVERSE FOR RAIN
   Main JavaScript engine
========================================= */

"use strict";

/* =========================================
   GENERAL HELPERS
========================================= */

const $ = (selector) => document.querySelector(selector);

const sleep = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));

let toastTimer;

function showToast(message) {
  const toast = $("#toast");

  toast.textContent = message;
  toast.classList.add("visible");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("visible");
  }, 2600);
}


/* =========================================
   CONFIGURATION
========================================= */

const CONFIG = {

  // Change this if you want a different name.
  recipient: "Rain",

  // Name shown in signatures.
  sender: "Kei",

  // Number of background stars.
  backgroundStars: 190,

  // Number of stars in the interactive universe.
  interactiveStars: 150,

  // Number of stars in the constellation.
  constellationStars: 1100,

  // Number of fireflies.
  fireflies: 28

};


/* =========================================
   LITTLE MESSAGES
========================================= */

const starMessages = [

  "I hope something makes you smile today.",

  "If I could send you a little warmth through this screen, I would.",

  "You're someone's favorite notification.",

  "I wish I could give you a hug right now.",

  "Even the quietest moments feel a little better when I think of you.",

  "I hope you remember to be gentle with yourself.",

  "You don't have to do anything extraordinary to be special.",

  "If today was difficult, I hope tomorrow is kinder.",

  "Somewhere in my day, there's always a little thought of you.",

  "I hope you know how much you mean to me.",

  "You make ordinary things feel a little more beautiful.",

  "If I could keep one little thing from today, it would be a moment with you.",

  "Please don't forget to take care of yourself, okay?",

  "I'm really glad I get to know you.",

  "You deserve all the soft and beautiful things life has to offer.",

  "Just a random reminder that I love you.",

  "I hope you laugh at something silly today.",

  "You don't need to be perfect to be loved.",

  "If the universe had a favorite little coincidence, mine would be meeting you.",

  "I wish you could see yourself the way I see you."

];


const randomThoughts = [

  "Sometimes I find myself smiling because something reminded me of you.",

  "I wonder what you're doing right now. I hope you're having a nice moment.",

  "I think one of my favorite things is knowing that somewhere in this world, you exist.",

  "If I could pause time for a little while, I'd probably choose a quiet moment with you.",

  "I don't need a special occasion to remind you that you're loved.",

  "I hope you know that even your little stories matter to me.",

  "Sometimes I wish I could turn a random thought into a little hug for you.",

  "I wonder how many times something beautiful happened today and I wished you were there to see it.",

  "You're a pretty wonderful part of my otherwise ordinary days.",

  "I would happily listen to you talk about the most random things.",

  "I hope life gives you plenty of reasons to smile, even the tiny ones.",

  "I like the idea of growing through ordinary days together.",

  "Even from a distance, I hope you can feel a little bit of my love.",

  "If I had to choose a favorite little notification, I think you already know the answer.",

  "I hope you never feel like you have to earn the love and care you deserve.",

  "I wish I could collect all the good moments of your day and put them somewhere safe."

];


const flowerMessages = [

  "A flower for the way you make ordinary days feel special.",

  "A flower for your smile, especially the unexpected ones.",

  "A flower for all the little things that make you uniquely you.",

  "A flower for the strength you carry, even when things get difficult.",

  "And one more, simply because you deserve beautiful things."

];


/* =========================================
   WORLD 1: BACKGROUND STAR ENGINE
========================================= */

const backgroundCanvas = $("#starCanvas");
const backgroundCtx = backgroundCanvas.getContext("2d");

let backgroundParticles = [];
let backgroundWidth = 0;
let backgroundHeight = 0;

function resizeBackground() {

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  backgroundWidth = window.innerWidth;
  backgroundHeight = window.innerHeight;

  backgroundCanvas.width = backgroundWidth * dpr;
  backgroundCanvas.height = backgroundHeight * dpr;

  backgroundCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  backgroundParticles = [];

  for (let i = 0; i < CONFIG.backgroundStars; i++) {

    backgroundParticles.push({

      x: Math.random() * backgroundWidth,
      y: Math.random() * backgroundHeight,

      size: Math.random() * 1.5 + 0.2,

      opacity: Math.random() * 0.65 + 0.12,

      speed: Math.random() * 0.006 + 0.002,

      phase: Math.random() * Math.PI * 2

    });

  }

}

function drawBackground(time = 0) {

  backgroundCtx.clearRect(
    0,
    0,
    backgroundWidth,
    backgroundHeight
  );

  for (const star of backgroundParticles) {

    const glow =
      star.opacity *
      (0.65 + Math.sin(time * star.speed + star.phase) * 0.35);

    backgroundCtx.beginPath();

    backgroundCtx.arc(
      star.x,
      star.y,
      star.size,
      0,
      Math.PI * 2
    );

    backgroundCtx.fillStyle =
      `rgba(235, 220, 190, ${glow})`;

    backgroundCtx.fill();

  }

  requestAnimationFrame(drawBackground);

}

resizeBackground();
requestAnimationFrame(drawBackground);

window.addEventListener("resize", resizeBackground);


/* =========================================
   PROCEDURAL AMBIENT MUSIC
========================================= */

/*
  No external audio files are required.

  The website creates a soft ambient atmosphere
  using Web Audio API oscillators.

  Music begins only after the entrance button
  has been clicked.
*/

let audioContext = null;
let masterGain = null;
let musicPlaying = false;

let activeOscillators = [];
let ambientInterval = null;

const ambientNotes = [

  [130.81, 164.81, 196.00],
  [146.83, 174.61, 220.00],
  [110.00, 146.83, 174.61],
  [130.81, 155.56, 196.00]

];

function createAmbientMusic() {

  if (audioContext) return;

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    showToast("Ambient audio isn't supported in this browser.");
    return;
  }

  audioContext = new AudioContextClass();

  masterGain = audioContext.createGain();

  masterGain.gain.value = 0;

  masterGain.connect(audioContext.destination);

  const lowpass = audioContext.createBiquadFilter();

  lowpass.type = "lowpass";
  lowpass.frequency.value = 850;
  lowpass.Q.value = 0.5;

  const reverb = audioContext.createConvolver();

  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * 3;

  const impulse = audioContext.createBuffer(
    2,
    length,
    sampleRate
  );

  for (let channel = 0; channel < 2; channel++) {

    const data = impulse.getChannelData(channel);

    for (let i = 0; i < length; i++) {

      const decay = Math.pow(1 - i / length, 3);

      data[i] =
        (Math.random() * 2 - 1) *
        decay *
        0.35;

    }

  }

  reverb.buffer = impulse;

  const dryGain = audioContext.createGain();
  const wetGain = audioContext.createGain();

  dryGain.gain.value = 0.75;
  wetGain.gain.value = 0.3;

  masterGain.connect(lowpass);

  lowpass.connect(dryGain);
  dryGain.connect(audioContext.destination);

  lowpass.connect(reverb);
  reverb.connect(wetGain);
  wetGain.connect(audioContext.destination);

  // Gentle low-frequency atmosphere.

  const drone = audioContext.createOscillator();

  drone.type = "sine";
  drone.frequency.value = 65.41;

  const droneGain = audioContext.createGain();

  droneGain.gain.value = 0.035;

  drone.connect(droneGain);
  droneGain.connect(masterGain);

  drone.start();

  activeOscillators.push(drone);

  // A soft upper harmonic.

  const upperDrone = audioContext.createOscillator();

  upperDrone.type = "sine";
  upperDrone.frequency.value = 130.81;

  const upperGain = audioContext.createGain();

  upperGain.gain.value = 0.009;

  upperDrone.connect(upperGain);
  upperGain.connect(masterGain);

  upperDrone.start();

  activeOscillators.push(upperDrone);

  // Slowly changing musical chords.

  let chordIndex = 0;

  function playChord() {

    if (!musicPlaying || !audioContext) return;

    const frequencies =
      ambientNotes[chordIndex % ambientNotes.length];

    chordIndex++;

    frequencies.forEach((frequency, index) => {

      const oscillator = audioContext.createOscillator();

      oscillator.type = index === 0 ? "sine" : "triangle";

      oscillator.frequency.value = frequency * 2;

      const gain = audioContext.createGain();

      const now = audioContext.currentTime;

      gain.gain.setValueAtTime(0, now);

      gain.gain.linearRampToValueAtTime(
        0.012,
        now + 2
      );

      gain.gain.setTargetAtTime(
        0,
        now + 9,
        3
      );

      oscillator.connect(gain);
      gain.connect(masterGain);

      oscillator.start(now);
      oscillator.stop(now + 15);

      activeOscillators.push(oscillator);

      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };

    });

  }

  playChord();

  ambientInterval = setInterval(playChord, 11000);

}

async function startMusic() {

  createAmbientMusic();

  if (!audioContext) return;

  try {

    await audioContext.resume();

    musicPlaying = true;

    masterGain.gain.cancelScheduledValues(
      audioContext.currentTime
    );

    masterGain.gain.setTargetAtTime(
      0.8,
      audioContext.currentTime,
      2.5
    );

    $("#musicIcon").textContent = "♫";

    $("#musicButton").style.opacity = "1";

  } catch (error) {

    console.warn("Audio could not start:", error);

  }

}

function stopMusic() {

  if (!audioContext || !masterGain) return;

  musicPlaying = false;

  masterGain.gain.cancelScheduledValues(
    audioContext.currentTime
  );

  masterGain.gain.setTargetAtTime(
    0,
    audioContext.currentTime,
    0.5
  );

  clearInterval(ambientInterval);

  $("#musicIcon").textContent = "♪";

}

$("#musicButton").addEventListener("click", async () => {

  if (!audioContext || !musicPlaying) {

    if (!audioContext) {
      createAmbientMusic();
    }

    if (audioContext) {

      if (ambientInterval === null) {
        // Restart the chord progression if necessary.
        ambientInterval = setInterval(() => {

          if (!musicPlaying) return;

          const frequency =
            ambientNotes[
              Math.floor(Math.random() * ambientNotes.length)
            ];

          frequency.forEach((note, index) => {

            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.type = index === 0 ? "sine" : "triangle";
            osc.frequency.value = note * 2;

            gain.gain.value = 0.012;

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start();
            osc.stop(audioContext.currentTime + 9);

            osc.onended = () => {
              osc.disconnect();
              gain.disconnect();
            };

          });

        }, 11000);
      }

      await startMusic();

    }

  } else {

    stopMusic();

  }

});


/* =========================================
   ENTER THE UNIVERSE
========================================= */

const intro = $("#intro");
const universe = $("#universe");

$("#enterButton").addEventListener("click", async () => {

  intro.classList.add("hidden");

  universe.classList.remove("hidden");

  await startMusic();

  initializeInteractiveStars();
  initializeFireflies();
  initializeConstellation();

  showToast("Welcome to your little universe, Rain.");

});


/* =========================================
   NAVIGATION
========================================= */

const nav = $("#navigation");

const navLinks = document.querySelectorAll(".nav-link");

let currentWorld = "home";

function navigateTo(worldName) {

  const target = document.getElementById(
    `world-${worldName}`
  );

  if (!target) return;

  document.querySelectorAll(".world").forEach(world => {
    world.classList.remove("active-world");
  });

  target.classList.add("active-world");

  navLinks.forEach(link => {

    link.classList.toggle(
      "active",
      link.dataset.world === worldName
    );

  });

  currentWorld = worldName;

  nav.classList.add("hidden");

  $("#menuIcon").textContent = "☰";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}

navLinks.forEach(link => {

  link.addEventListener("click", () => {
    navigateTo(link.dataset.world);
  });

});

$("#menuButton").addEventListener("click", () => {

  nav.classList.toggle("hidden");

  $("#menuIcon").textContent =
    nav.classList.contains("hidden") ? "☰" : "×";

});

$("#closeMenu").addEventListener("click", () => {

  nav.classList.add("hidden");

  $("#menuIcon").textContent = "☰";

});

$("#homeButton").addEventListener("click", event => {

  event.preventDefault();

  navigateTo("home");

});


/* =========================================
   WORLD 1: INTERACTIVE STARFIELD
========================================= */

const messageCanvas = $("#messageCanvas");
const messageCtx = messageCanvas.getContext("2d");

let interactiveStars = [];

let messageWidth = 0;
let messageHeight = 0;

let selectedStar = null;

let previousMessageIndex = -1;

function resizeMessageCanvas() {

  const rect = messageCanvas.getBoundingClientRect();

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  messageWidth = rect.width;
  messageHeight = rect.height;

  messageCanvas.width = messageWidth * dpr;
  messageCanvas.height = messageHeight * dpr;

  messageCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  interactiveStars = [];

  for (let i = 0; i < CONFIG.interactiveStars; i++) {

    interactiveStars.push({

      x: Math.random() * messageWidth,
      y: Math.random() * messageHeight,

      radius: Math.random() * 1.7 + 0.7,

      opacity: Math.random() * 0.7 + 0.2,

      speed: Math.random() * 0.004 + 0.001,

      phase: Math.random() * Math.PI * 2,

      message: starMessages[
        Math.floor(Math.random() * starMessages.length)
      ]

    });

  }

}

function initializeInteractiveStars() {

  resizeMessageCanvas();

  requestAnimationFrame(drawInteractiveStars);

}

function drawInteractiveStars(time = 0) {

  messageCtx.clearRect(
    0,
    0,
    messageWidth,
    messageHeight
  );

  interactiveStars.forEach(star => {

    const twinkle =
      0.55 +
      Math.sin(time * star.speed + star.phase) * 0.45;

    const opacity = star.opacity * twinkle;

    messageCtx.beginPath();

    messageCtx.arc(
      star.x,
      star.y,
      star.radius,
      0,
      Math.PI * 2
    );

    messageCtx.fillStyle =
      `rgba(238, 222, 192, ${opacity})`;

    messageCtx.fill();

    if (star.radius > 1.8) {

      messageCtx.beginPath();

      messageCtx.arc(
        star.x,
        star.y,
        star.radius * 4,
        0,
        Math.PI * 2
      );

      messageCtx.fillStyle =
        `rgba(215, 183, 131, ${opacity * 0.09})`;

      messageCtx.fill();

    }

  });

  requestAnimationFrame(drawInteractiveStars);

}

messageCanvas.addEventListener("click", event => {

  const rect = messageCanvas.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  let closest = null;
  let shortestDistance = 27;

  interactiveStars.forEach(star => {

    const dx = star.x - x;
    const dy = star.y - y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < shortestDistance) {

      shortestDistance = distance;
      closest = star;

    }

  });

  if (closest) {

    selectedStar = closest;

    $("#starMessageText").textContent =
      closest.message;

    $("#starMessage").classList.remove("hidden");

  }

});

$("#closeStarMessage").addEventListener("click", () => {

  $("#starMessage").classList.add("hidden");

});

window.addEventListener("resize", () => {

  if (!universe.classList.contains("hidden")) {

    resizeMessageCanvas();

  }

});


/* =========================================
   WORLD 2: LITTLE THINGS
========================================= */

function randomThought() {

  let index;

  do {

    index = Math.floor(
      Math.random() * randomThoughts.length
    );

  } while (
    index === previousMessageIndex &&
    randomThoughts.length > 1
  );

  previousMessageIndex = index;

  const thought = $("#thoughtText");

  thought.style.opacity = "0";

  setTimeout(() => {

    thought.textContent = randomThoughts[index];

    thought.style.opacity = "1";

  }, 300);

}

$("#randomThoughtButton").addEventListener(
  "click",
  randomThought
);


/* =========================================
   WORLD 3: THE LITTLE GARDEN
========================================= */

let flowerMessagesOpened = new Set();

function initializeFireflies() {

  const layer = $("#fireflyLayer");

  if (layer.children.length > 0) return;

  for (let i = 0; i < CONFIG.fireflies; i++) {

    const firefly = document.createElement("div");

    firefly.className = "firefly";

    firefly.style.left =
      Math.random() * 100 + "%";

    firefly.style.top =
      Math.random() * 85 + "%";

    firefly.style.setProperty(
      "--duration",
      (3 + Math.random() * 6) + "s"
    );

    firefly.style.setProperty(
      "--move-x",
      (Math.random() * 50 - 25) + "px"
    );

    firefly.style.setProperty(
      "--move-y",
      (Math.random() * 50 - 25) + "px"
    );

    firefly.style.animationDelay =
      (-Math.random() * 7) + "s";

    layer.appendChild(firefly);

  }

}

document.querySelectorAll(".flower").forEach(flower => {

  flower.addEventListener("click", () => {

    const index = Number(flower.dataset.flower);

    const message =
      flowerMessages[index];

    $("#flowerMessageText").textContent = message;

    $("#flowerMessage").classList.remove("hidden");

    flowerMessagesOpened.add(index);

  });

});

$("#closeFlowerMessage").addEventListener("click", () => {

  $("#flowerMessage").classList.add("hidden");

});


/* =========================================
   WORLD 4: CONSTELLATION ENGINE
========================================= */

const constellationCanvas = $("#constellationCanvas");
const constellationCtx =
  constellationCanvas.getContext("2d");

let constellationWidth = 0;
let constellationHeight = 0;

let constellationParticles = [];

let constellationTargets = [];

let constellationStarted = false;

let constellationAnimationFrame = null;

let constellationStartTime = 0;

function resizeConstellationCanvas() {

  const rect = constellationCanvas.getBoundingClientRect();

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  constellationWidth = rect.width;
  constellationHeight = rect.height;

  constellationCanvas.width =
    constellationWidth * dpr;

  constellationCanvas.height =
    constellationHeight * dpr;

  constellationCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

}

function generateConstellationTargets() {

  constellationTargets = [];

  const offscreen = document.createElement("canvas");

  const offCtx = offscreen.getContext("2d");

  offscreen.width = constellationWidth;
  offscreen.height = constellationHeight;

  const fontSize = Math.min(
    constellationWidth * 0.28,
    constellationHeight * 0.43,
    190
  );

  offCtx.font =
    `500 ${fontSize}px Georgia`;

  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";

  offCtx.fillStyle = "#ffffff";

  offCtx.fillText(
    CONFIG.recipient.toUpperCase(),
    constellationWidth / 2,
    constellationHeight * 0.43
  );

  const pixels = offCtx.getImageData(
    0,
    0,
    constellationWidth,
    constellationHeight
  ).data;

  const step = Math.max(
    3,
    Math.round(fontSize / 35)
  );

  for (
    let y = 0;
    y < constellationHeight;
    y += step
  ) {

    for (
      let x = 0;
      x < constellationWidth;
      x += step
    ) {

      const pixelIndex =
        (y * constellationWidth + x) * 4;

      if (pixels[pixelIndex + 3] > 120) {

        constellationTargets.push({

          x: x + (Math.random() - 0.5) * 2,
          y: y + (Math.random() - 0.5) * 2

        });

      }

    }

  }

}

function initializeConstellation() {

  resizeConstellationCanvas();

  constellationParticles = [];

  for (
    let i = 0;
    i < CONFIG.constellationStars;
    i++
  ) {

    constellationParticles.push({

      x: Math.random() * constellationWidth,
      y: Math.random() * constellationHeight,

      originX: Math.random() * constellationWidth,
      originY: Math.random() * constellationHeight,

      targetX: null,
      targetY: null,

      radius: Math.random() * 1.4 + 0.3,

      opacity: Math.random() * 0.7 + 0.2,

      speed: Math.random() * 0.01 + 0.002,

      phase: Math.random() * Math.PI * 2,

      assigned: false

    });

  }

  generateConstellationTargets();

  drawConstellation();

}

function drawConstellation(time = 0) {

  constellationCtx.clearRect(
    0,
    0,
    constellationWidth,
    constellationHeight
  );

  constellationParticles.forEach((star, index) => {

    let targetOpacity = star.opacity;

    if (constellationStarted && star.assigned) {

      const elapsed = performance.now() - constellationStartTime;

      const delay = index * 1.1;

      const progress = Math.max(
        0,
        Math.min(1, (elapsed - delay) / 4200)
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      star.x += (star.targetX - star.x) * 0.025 * eased;
      star.y += (star.targetY - star.y) * 0.025 * eased;

      targetOpacity = 0.65 + Math.sin(time * 0.001 + star.phase) * 0.3;

    } else {

      star.x += Math.sin(time * star.speed + star.phase) * 0.035;
      star.y += Math.cos(time * star.speed + star.phase) * 0.025;

    }

    constellationCtx.beginPath();

    constellationCtx.arc(
      star.x,
      star.y,
      star.radius,
      0,
      Math.PI * 2
    );

    constellationCtx.fillStyle =
      `rgba(239, 221, 183, ${targetOpacity})`;

    constellationCtx.fill();

  });

  // Connect the stars that form the name.

  if (constellationStarted) {

    const assigned = constellationParticles.filter(
      star => star.assigned
    );

    constellationCtx.lineWidth = 0.7;

    for (let i = 0; i < assigned.length - 1; i++) {

      const current = assigned[i];
      const next = assigned[i + 1];

      const dx = current.x - next.x;
      const dy = current.y - next.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 13) {

        constellationCtx.beginPath();

        constellationCtx.moveTo(
          current.x,
          current.y
        );

        constellationCtx.lineTo(
          next.x,
          next.y
        );

        constellationCtx.strokeStyle =
          "rgba(238, 213, 162, 0.35)";

        constellationCtx.stroke();

      }

    }

  }

  constellationAnimationFrame =
    requestAnimationFrame(drawConstellation);

}


/* =========================================
   REVEAL RAIN
========================================= */

$("#revealConstellation").addEventListener("click", async () => {

  if (constellationStarted) return;

  constellationStarted = true;

  $("#revealConstellation").disabled = true;

  $("#revealConstellation").style.opacity = "0.4";

  $("#constellationLabel").textContent =
    "WATCH THE LITTLE STARS COME TOGETHER";

  $("#constellationHint").textContent =
    "Every little light is finding its place...";

  // Shuffle the target points.

  const shuffledTargets = [...constellationTargets];

  for (let i = shuffledTargets.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [shuffledTargets[i], shuffledTargets[j]] =
      [shuffledTargets[j], shuffledTargets[i]];

  }

  // Select stars to form the name.

  const availableStars = [...constellationParticles];

  for (
    let i = availableStars.length - 1;
    i > 0;
    i--
  ) {

    const j = Math.floor(Math.random() * (i + 1));

    [availableStars[i], availableStars[j]] =
      [availableStars[j], availableStars[i]];

  }

  const count = Math.min(
    shuffledTargets.length,
    availableStars.length
  );

  for (let i = 0; i < count; i++) {

    const star = availableStars[i];
    const target = shuffledTargets[i];

    star.targetX = target.x;
    star.targetY = target.y;

    star.assigned = true;

  }

  constellationStartTime = performance.now();

  // Reveal the final message after the constellation forms.

  await sleep(6500);

  $("#constellationLabel").textContent =
    "AND THERE YOU ARE";

  $("#constellationHint").textContent =
    "A little universe. A little place for you.";

  $("#finalMessage").classList.remove("hidden");

  $("#finalMessage").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  showToast("A little constellation, just for you.");

});


/* =========================================
   RESIZE CONSTELLATION
========================================= */

window.addEventListener("resize", () => {

  if (
    universe.classList.contains("hidden") ||
    !constellationCanvas.isConnected
  ) {
    return;
  }

  const wasStarted = constellationStarted;

  resizeConstellationCanvas();

  if (!wasStarted) {

    generateConstellationTargets();

  }

});


/* =========================================
   PAGE VISIBILITY
========================================= */

document.addEventListener("visibilitychange", async () => {

  if (!audioContext) return;

  if (document.hidden) {

    if (musicPlaying) {
      masterGain.gain.setTargetAtTime(
        0,
        audioContext.currentTime,
        0.4
      );
    }

  } else if (musicPlaying) {

    try {

      await audioContext.resume();

      masterGain.gain.setTargetAtTime(
        0.8,
        audioContext.currentTime,
        1
      );

    } catch (error) {

      console.warn("Audio resume failed:", error);

    }

  }

});


/* =========================================
   INITIALIZATION
========================================= */

console.log(
  "%cA Little Universe for Rain",
  "color:#d7b783;font-size:18px;font-family:Georgia;"
);

console.log(
  "Made with love, just because. — Kei"
);
