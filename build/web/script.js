const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ===== SCREEN SIZE FIX =====
const BASE_WIDTH = 800;
const BASE_HEIGHT = 600;

function resizeCanvas() {
  const container = document.getElementById("game-container");
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const scale = Math.min(containerWidth / BASE_WIDTH, containerHeight / BASE_HEIGHT);
  canvas.width = BASE_WIDTH;
  canvas.height = BASE_HEIGHT;
  canvas.style.width = (BASE_WIDTH * scale) + "px";
  canvas.style.height = (BASE_HEIGHT * scale) + "px";
}

window.addEventListener("resize", resizeCanvas);
document.addEventListener("DOMContentLoaded", resizeCanvas);


// ===== AUDIO SYSTEM - WEB AUDIO API (FIXED VOLUME) =====
let bgmVolume = 0.3;
let sfxVolume = 0.4;
let isBgmMuted = false;
let isBgmPlaying = false;

// Web Audio API context
let audioCtx = null;
let bgmGainNode = null;
let sfxGainNode = null;
let bgmSourceNode = null;
let currentBgmBuffer = null;
let currentBgmName = "world";

// BGM buffers
let bgmWorldBuffer = null;
let bgmDungeonBuffer = null;

function initAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    // Create gain nodes for volume control
    bgmGainNode = audioCtx.createGain();
    bgmGainNode.connect(audioCtx.destination);
    bgmGainNode.gain.value = isBgmMuted ? 0 : bgmVolume;

    sfxGainNode = audioCtx.createGain();
    sfxGainNode.connect(audioCtx.destination);
    sfxGainNode.gain.value = sfxVolume;
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

// Load audio file as buffer
async function loadAudioBuffer(url) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
  } catch (e) {
    console.error("Failed to load audio:", url, e);
    return null;
  }
}

// Preload BGM
async function preloadBGM() {
  initAudioContext();
  if (!bgmWorldBuffer) {
    bgmWorldBuffer = await loadAudioBuffer("res/sound/BlueBoyAdventure.wav");
  }
  if (!bgmDungeonBuffer) {
    bgmDungeonBuffer = await loadAudioBuffer("res/sound/background_music.mp3");
  }
}

function playBGM() {
  if (isBgmMuted || !audioCtx) return;

  // Stop current BGM if playing
  if (bgmSourceNode) {
    try { bgmSourceNode.stop(); } catch(e) {}
    bgmSourceNode = null;
  }

  const buffer = currentBgmName === "dungeon02" ? bgmDungeonBuffer : bgmWorldBuffer;
  if (!buffer) return;

  bgmSourceNode = audioCtx.createBufferSource();
  bgmSourceNode.buffer = buffer;
  bgmSourceNode.loop = true;
  bgmSourceNode.connect(bgmGainNode);
  bgmSourceNode.start(0);
  isBgmPlaying = true;
}

function pauseBGM() {
  if (bgmSourceNode) {
    try { bgmSourceNode.stop(); } catch(e) {}
    bgmSourceNode = null;
  }
  isBgmPlaying = false;
}

function stopBGM() {
  pauseBGM();
}

function switchBGM(mapName) {
  let wasPlaying = isBgmPlaying;
  pauseBGM();
  currentBgmName = mapName;
  if (wasPlaying && !isBgmMuted) playBGM();
}

function toggleBGMMute() {
  isBgmMuted = !isBgmMuted;
  if (bgmGainNode) {
    bgmGainNode.gain.value = isBgmMuted ? 0 : bgmVolume;
  }
  if (isBgmMuted) {
    pauseBGM();
  } else {
    playBGM();
  }
  updateMuteButton();
  return isBgmMuted;
}

function updateMuteButton() {
  const btn = document.getElementById("bgm-mute-btn");
  if (btn) {
    btn.innerText = isBgmMuted ? "🔇 UNMUTE MUSIC" : "🔊 MUTE MUSIC";
    btn.style.background = isBgmMuted ? "#c0392b" : "#27ae60";
  }
}

function updateBGMVolume(val) {
  bgmVolume = val / 100;
  document.getElementById("bgm-volume-val").innerText = val + "%";
  if (bgmGainNode) {
    bgmGainNode.gain.value = isBgmMuted ? 0 : bgmVolume;
  }
  if (bgmVolume > 0 && isBgmMuted) {
    isBgmMuted = false;
    updateMuteButton();
    if (!isBgmPlaying) playBGM();
  }
}

function updateSFXVolume(val) {
  sfxVolume = val / 100;
  document.getElementById("sfx-volume-val").innerText = val + "%";
  if (sfxGainNode) {
    sfxGainNode.gain.value = sfxVolume;
  }
}

// SFX using Web Audio API
const sfxBuffers = {};
const sfxUrls = {
  attack: "res/sound/cuttree.wav",
  hit: "res/sound/hitmonster.wav",
  hurt: "res/sound/receivedamage.wav",
  pickup: "res/sound/coin.wav",
  unlock: "res/sound/unlock.wav",
  levelup: "res/sound/levelup.wav",
  fanfare: "res/sound/fanfare.wav",
  powerup: "res/sound/powerup.wav"
};

async function preloadSFX() {
  initAudioContext();
  for (const [name, url] of Object.entries(sfxUrls)) {
    if (!sfxBuffers[name]) {
      sfxBuffers[name] = await loadAudioBuffer(url);
    }
  }
}

function playSfx(name) {
  if (!audioCtx || !sfxGainNode) return;
  const buffer = sfxBuffers[name];
  if (!buffer) return;

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(sfxGainNode);
  source.start(0);
}

// Preload all audio on first user interaction
document.addEventListener("click", async () => {
  if (!audioCtx) {
    await preloadBGM();
    await preloadSFX();
  }
}, { once: true });

// Also try to preload on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(async () => {
    if (!audioCtx) {
      await preloadBGM();
      await preloadSFX();
    }
  }, 1000);
});

//puzzlekotak4
let puzzlePlates = [];
let puzzleSolved = false;
let currentPuzzleIndex = 0;
let isPlayerOnPlate = false;
const PUZZLE_SECRET_SEQUENCE = ["MERAH", "BIRU", "HIJAU", "KUNING"];

function initPuzzle() {
  puzzleSolved = false;
  currentPuzzleIndex = 0;
  isPlayerOnPlate = false;
  puzzlePlates = [
    { id: "MERAH", x: 720, y: 144, width: 48, height: 48, color: "#e74c3c", isPressed: false },
    { id: "HIJAU", x: 2000, y: 144, width: 48, height: 48, color: "#2ecc71", isPressed: false },
    { id: "BIRU", x: 144, y: 2000, width: 48, height: 48, color: "#3498db", isPressed: false },
    { id: "KUNING", x: 2000, y: 2000, width: 48, height: 48, color: "#f1c40f", isPressed: false }
  ];
}

function updatePuzzle() {
  if (puzzleSolved) return;

  let playerHitbox = {
    x: player.x + 10,
    y: player.y + 10,
    width: player.width - 20,
    height: player.height - 20
  };
  let currentlyOnPlate = false;

  puzzlePlates.forEach((plate) => {
    if (checkCollision(playerHitbox.x, playerHitbox.y, playerHitbox.width, playerHitbox.height, plate)) {
      currentlyOnPlate = true;
      if (!isPlayerOnPlate && !plate.isPressed) {
        if (plate.id === PUZZLE_SECRET_SEQUENCE[currentPuzzleIndex]) {
          plate.isPressed = true;
          currentPuzzleIndex++;
          playSfx("powerup");
          showFloatingDamage(plate.x, plate.y - 20, "BENAR!", plate.color);
          if (currentPuzzleIndex >= PUZZLE_SECRET_SEQUENCE.length) {
            puzzleSolved = true;
            playSfx("fanfare");
            showFloatingDamage(player.x, player.y - 50, "GERBANG TERBUKA!", "#9b59b6");
            setTimeout(stageClear, 2000);
          }
        } else {
          showFloatingDamage(plate.x, plate.y - 20, "SALAH URUTAN!", "#e74c3c");
          playSfx("hurt");
          currentPuzzleIndex = 0;
          puzzlePlates.forEach((p) => (p.isPressed = false));
        }
      }
    }
  });
  isPlayerOnPlate = currentlyOnPlate;
}

function drawPuzzle() {
  puzzlePlates.forEach((plate) => {
    const px = plate.x - camera.x;
    const py = plate.y - camera.y;
    if (px + plate.width < 0 || px > canvas.width || py + plate.height < 0 || py > canvas.height) return;
    ctx.fillStyle = plate.isPressed ? plate.color : "#7f8c8d";
    ctx.fillRect(px, py, plate.width, plate.height);
    ctx.strokeStyle = plate.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(px, py, plate.width, plate.height);
  });
}


const assets = {
  tiles: {},
  player: {},
  objects: {},
  projectile: {},
  enemy: {}
};

function loadAsset(category, name, src) {
  const img = new Image();
  img.src = src;
  assets[category][name] = img;
}

const PLAYER_TEXTURES = {
  Warrior: {
    prefix: "war",
    dirMap: { up: "atas", down: "bawah", left: "kiri", right: "kanan" }
  },
  Archer: {
    prefix: "arc",
    dirMap: { up: "atas", down: "bawah", left: "kiri", right: "kanan" }
  },
  Mage: {
    prefix: "mage",
    dirMap: { up: "atas", down: "bawah", left: "kiri", right: "kanan" }
  }
};

function getPlayerTextureKey(job, direction, frameNum = 1, useAttackTexture = false) {
  const config = PLAYER_TEXTURES[job] || PLAYER_TEXTURES.Warrior;
  const sprite = `${config.prefix}_${config.dirMap[direction] || "bawah"}_${frameNum}`;
  return useAttackTexture && config.prefix === "war" ? `${sprite}_nyerang` : sprite;
}

///TILES
loadAsset("tiles", "0", "res/tiles/002.png");
loadAsset("tiles", "8", "res/tiles/000.png");
loadAsset("tiles", "2", "res/tiles/019.png");
loadAsset("tiles", "3", "res/tiles/017.png");
loadAsset("tiles", "4", "res/tiles/tree.png");
loadAsset("tiles", "5", "res/tiles/003.png");
loadAsset("tiles", "6", "res/tiles/036.png");
loadAsset("tiles", "7", "res/objects/door.png");
loadAsset("tiles", "1", "res/tiles/032.png");
loadAsset("tiles", "9", "res/tiles/026.png");
loadAsset("tiles", "10", "res/tiles/025.png");
loadAsset("tiles", "11", "res/tiles/029.png");
loadAsset("tiles", "12", "res/tiles/023.png");
loadAsset("tiles", "13", "res/tiles/024.png");
loadAsset("tiles", "14", "res/tiles/027.png");
loadAsset("tiles", "15", "res/tiles/028.png");
loadAsset("tiles", "17", "res/tiles/017.png");
loadAsset("tiles", "18", "res/tiles/007.png");
loadAsset("tiles", "19", "res/tiles/010.png");
loadAsset("tiles", "20", "res/tiles/013.png");
loadAsset("tiles", "21", "res/tiles/009.png");
loadAsset("tiles", "32", "res/tiles/032.png");
loadAsset("tiles", "34", "res/tiles/034.png");
loadAsset("tiles", "37", "res/tiles/037.png");


// PLAYER
Object.values(PLAYER_TEXTURES).forEach(({ prefix }) => {
  ["atas_1", "bawah_1", "kiri_1", "kanan_1"].forEach((sprite) => {
    loadAsset("player", `${prefix}_${sprite}`, `res/player/${prefix}_${sprite}.png`);
  });
  if (prefix === "war") {
    ["atas_1_nyerang", "bawah_1_nyerang", "kiri_1_nyerang", "kanan_1_nyerang"].forEach((sprite) => {
      loadAsset("player", `${prefix}_${sprite}`, `res/player/${prefix}_${sprite}.png`);
    });
  }
});

// OBJECTS
loadAsset("objects", "sword", "res/objects/sword_normal.png");
loadAsset("objects", "shield", "res/objects/shield_wood.png");
loadAsset("objects", "key", "res/objects/key.png");
loadAsset("objects", "potion", "res/objects/potion_red.png");
loadAsset("objects", "chest", "res/objects/chest.png");
loadAsset("objects", "chest_opened", "res/objects/chest_opened.png");
loadAsset("objects", "clue_icon", "res/objects/clue_icon.png");
loadAsset("objects", "clue_hint", "res/objects/clue_hint.png");

// PROJECTILES
const projectileDirMap = { up: "atas", down: "bawah", left: "kiri", right: "kanan" };
["up", "down", "left", "right"].forEach((dir) => {
  let indoDir = projectileDirMap[dir];
  loadAsset("projectile", `arrow_${indoDir}`, `res/projectile/arrow_${indoDir}.png`);
  loadAsset("projectile", `petir_${indoDir}_1`, `res/projectile/petir_${indoDir}_1.png`);
  loadAsset("projectile", `fireball_${dir}_1`, `res/projectile/fireball_${dir}_1.png`);
});
loadAsset("projectile", `rock_down_1`, `res/projectile/rock_down_1.png`);

// ENEMIES
const dirs = ["up", "down", "left", "right"];
dirs.forEach((dir) => {
  loadAsset("enemy", `orc_${dir}_1`, `res/monster/orc_${dir}_1.png`);
  loadAsset("enemy", `orc_${dir}_2`, `res/monster/orc_${dir}_2.png`);
  loadAsset("enemy", `orc_attack_${dir}_1`, `res/monster/orc_attack_${dir}_1.png`);
  loadAsset("enemy", `orc_attack_${dir}_2`, `res/monster/orc_attack_${dir}_2.png`);
  loadAsset("enemy", `skeletonlord_${dir}_1`, `res/monster/skeletonlord_${dir}_1.png`);
  loadAsset("enemy", `skeletonlord_${dir}_2`, `res/monster/skeletonlord_${dir}_2.png`);
  loadAsset("enemy", `skeletonlord_attack_${dir}_1`, `res/monster/skeletonlord_attack_${dir}_1.png`);
  loadAsset("enemy", `skeletonlord_attack_${dir}_2`, `res/monster/skeletonlord_attack_${dir}_2.png`);
});
loadAsset("enemy", "slime_down_1", "res/monster/greenslime_down_1.png");
loadAsset("enemy", "slime_down_2", "res/monster/greenslime_down_2.png");
loadAsset("enemy", "bat_down_1", "res/monster/bat_down_1.png");
loadAsset("enemy", "bat_down_2", "res/monster/bat_down_2.png");

//gamelogic
const TILE_SIZE = 48;
let activeMap = [];
let MAP_WIDTH = 0;
let MAP_HEIGHT = 0;
let enemies = [];
let chests = [];
let inventory = [];
let serverLevel = 1;
let serverExp = 0;
let serverMaxExp = 100;
let currentMapName = "world01";

async function fetchMapFromServer(mapId) {
  try {
    currentMapName = mapId;
    switchBGM(mapId);
    const response = await fetch(`res/maps/${mapId}.txt`);
    const text = await response.text();
    activeMap = text
      .trim()
      .split("\n")
      .map((row) => row.trim().split(/\s+/).map(Number));
    MAP_WIDTH = activeMap[0].length * TILE_SIZE;
    MAP_HEIGHT = activeMap.length * TILE_SIZE;
  } catch (e) {
    console.error("Gagal load map:", e);
  }
}

const camera = { x: 0, y: 0 };
function updateCamera() {
  camera.x = player.x + player.width / 2 - canvas.width / 2;
  camera.y = player.y + player.height / 2 - canvas.height / 2;
  if (camera.x < 0) camera.x = 0;
  if (camera.y < 0) camera.y = 0;
  if (camera.x + canvas.width > MAP_WIDTH) camera.x = MAP_WIDTH - canvas.width;
  if (camera.y + canvas.height > MAP_HEIGHT) camera.y = MAP_HEIGHT - canvas.height;
}

let gameState = "MAIN-MENU";
let isGameStarted = false;
let projectiles = [];
const floatingTexts = [];
let stageFinished = false;
let pendingAction = null;
let isTransitioning = false;
const ENEMY_AGGRO_RANGE = 300, ENEMY_DEAGGRO_RANGE = 500, ENEMY_ATTACK_RANGE = 60;
let playerHitFlash = 0;

function parseServerEnemies(serverEnemies) {
  if (!serverEnemies) return [];
  return serverEnemies.map((e) => {
    if (
      e.skin &&
      (e.skin.toLowerCase().includes("skeletonlord") ||
        e.skin.toLowerCase().includes("dragon") ||
        e.skin.toLowerCase().includes("boss"))
    ) {
      e.isBoss = true;
      e.skin = "skeletonlord";
    }
    if (e.isBoss) {
      e.width = 96;
      e.height = 96;
      e.speed = 0.65;
    } else {
      e.width = 40;
      e.height = 40;
      e.speed = 0.9;
    }
    e.patrolDir = { x: 0, y: 0 };
    e.patrolTimer = 0;
    e.attackCooldown = 0;
    e.hitFlash = 0;
    e.direction = "down";
    e.getCenter = function () {
      return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    };
    return e;
  });
}

let player = {
  name: "Player",
  x: 240,
  y: 240,
  speed: 4.0,
  width: TILE_SIZE,
  height: TILE_SIZE,
  job: "",
  hp: 100,
  maxHp: 100,
  mp: 100,
  maxMp: 100,
  isAttacking: false,
  isMoving: false,
  direction: "down",
  frameCounter: 0,
  frameNum: 1,
  baseAtk: 10,
  def: 0,
  keys: 0,
  isDefending: false,
  slashColor: "#f1c40f",

  setJob(jobName) {
    this.job = jobName;
    if (jobName === "Warrior") {
      this.maxHp = 150;
      this.baseAtk = 20;
      this.def = 5;
    } else if (jobName === "Mage") {
      this.maxHp = 80;
      this.baseAtk = 5;
      this.def = 2;
    } else if (jobName === "Archer") {
      this.maxHp = 100;
      this.baseAtk = 10;
      this.def = 3;
    }
    this.hp = this.maxHp;
  },

  skill1() {
    fetch("GameServlet", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=use_skill&skill_num=1`
    })
      .then((res) => res.json())
      .then((data) => this.processSkill(data));
  },
  skill2() {
    fetch("GameServlet", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=use_skill&skill_num=2`
    })
      .then((res) => res.json())
      .then((data) => this.processSkill(data));
  },

  processSkill(data) {
    if (data.skill_effect === "failed") {
      showFloatingDamage(this.x, this.y - 10, "NO MP!", "#e74c3c");
      return;
    }
    syncPlayerStatsAndEnemies(data);
    let effect = data.skill_effect;
    if (effect === "mage_basic")
      spawnProjectile(this.x, this.y, this.direction, this.baseAtk, "fireball");
    else if (effect === "warrior_skill_1")
      this.performMelee(this.baseAtk * 2.5, "#e74c3c");
    else if (effect === "warrior_skill_2") {
      this.isDefending = true;
      setTimeout(() => (this.isDefending = false), 2000);
      showFloatingDamage(this.x, this.y, "DEFENSE UP", "#3498db");
    } else if (effect === "mage_skill_1")
      spawnProjectile(this.x, this.y, this.direction, 25, "mage");
    else if (effect === "mage_skill_2")
      showFloatingDamage(this.x, this.y, "+30 MANA", "#3498db");
    else if (effect === "archer_skill_1")
      spawnProjectile(this.x, this.y, this.direction, 15, "archer");
    else if (effect === "archer_skill_2") {
      spawnProjectile(this.x, this.y, this.direction, 15, "archer");
      spawnProjectile(this.x + 10, this.y + 10, this.direction, 15, "archer");
    }
  },

  performMelee(damage, color = "#f1c40f") {
    if (this.isAttacking) return;
    this.isAttacking = true;
    this.slashColor = color;
    playSfx("attack");
    let atkBox = { x: this.x - 20, y: this.y - 20, size: this.width + 40 };

    enemies.forEach((enemy, idx) => {
      if (enemy.alive && checkCollisionBox(atkBox, enemy)) {
        showFloatingDamage(enemy.x, enemy.y, "HIT!", "#f1c40f");
        playSfx("hit");
        enemy.hitFlash = 8;
        let kbForce = enemy.isBoss ? 5 : 20;
        let kbX = enemy.x;
        let kbY = enemy.y;
        if (this.direction === "up") kbY -= kbForce;
        else if (this.direction === "down") kbY += kbForce;
        else if (this.direction === "left") kbX -= kbForce;
        else if (this.direction === "right") kbX += kbForce;
        if (canMoveTo(kbX, kbY, enemy.width, enemy.height)) {
          enemy.x = kbX;
          enemy.y = kbY;
        }
        fetch("GameServlet", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `action=attack_enemy&enemy_id=${idx}`
        })
          .then((res) => res.json())
          .then((data) => syncPlayerStatsAndEnemies(data));
      }
    });
    setTimeout(() => {
      this.isAttacking = false;
    }, 150);
  }
};

function syncPlayerStatsAndEnemies(data) {
  if (data.error) return;
  data.enemies.forEach((serverData, i) => {
    if (enemies[i]) {
      enemies[i].hp = serverData.hp;
      enemies[i].alive = serverData.alive;
    }
  });
  if (data.player.level > serverLevel) {
    showFloatingDamage(player.x, player.y - 20, "LEVEL UP!", "#f1c40f");
    let atkDiff = data.player.atk - player.baseAtk;
    if (atkDiff > 0) showFloatingDamage(player.x, player.y - 45, `ATK +${atkDiff}`, "#e74c3c");
    playSfx("levelup");
  }

  player.name = data.player.name || "Player";
  player.hp = data.player.hp;
  player.maxHp = data.player.maxHp;
  player.mp = data.player.mp;
  player.maxMp = data.player.maxMp;
  player.baseAtk = data.player.atk;
  player.def = data.player.def || 0;
  player.keys = data.player.keys || 0;
  player.job = data.player.job || player.job;
  serverLevel = data.player.level;
  serverExp = data.player.exp;
  serverMaxExp = data.player.maxExp;
  if (data.inventory) inventory = data.inventory;
  updateHUD();
}

function showClueOverlay() {
  let clueDiv = document.getElementById("clue-overlay");
  if (!clueDiv) {
    clueDiv = document.createElement("div");
    clueDiv.id = "clue-overlay";
    clueDiv.className = "overlay active";
    clueDiv.style.zIndex = "100";
    clueDiv.onclick = () => {
      clueDiv.remove();
    };
    clueDiv.innerHTML = `<img src="res/objects/clue_hint.png" alt="Petunjuk" style="max-width: 80%; max-height: 80%; image-rendering: pixelated; border: 4px solid #f1c40f; border-radius: 10px; background: #2c3e50; padding: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);"><p style="color: white; font-weight: bold; margin-top: 15px; font-size: 18px;">Klik di mana saja untuk menutup petunjuk</p>`;
    document.body.appendChild(clueDiv);
  }
}

function renderInventory() {
  let finalName = player.name;
  if (!finalName || finalName === "null" || finalName.trim() === "") finalName = "Player";
  if (document.getElementById("inv-name")) document.getElementById("inv-name").innerText = finalName;
  if (document.getElementById("inv-job")) document.getElementById("inv-job").innerText = player.job || "Warrior";
  if (document.getElementById("inv-job-list")) document.getElementById("inv-job-list").innerText = player.job || "Warrior";
  if (document.getElementById("inv-level")) document.getElementById("inv-level").innerText = "Lv. " + serverLevel;
  if (document.getElementById("inv-level-list")) document.getElementById("inv-level-list").innerText = serverLevel;
  if (document.getElementById("inv-hp")) document.getElementById("inv-hp").innerText = Math.ceil(player.hp) + " / " + player.maxHp;
  if (document.getElementById("inv-mp")) document.getElementById("inv-mp").innerText = player.mp + " / " + player.maxMp;
  if (document.getElementById("inv-exp")) document.getElementById("inv-exp").innerText = serverExp + " / " + serverMaxExp;
  if (document.getElementById("inv-atk")) document.getElementById("inv-atk").innerText = player.baseAtk;
  if (document.getElementById("inv-def")) document.getElementById("inv-def").innerText = player.def;

  let prefix = player.job === "Mage" ? "mage" : player.job === "Archer" ? "arc" : "war";
  let imgEl = document.getElementById("inv-char-img");
  if (imgEl) imgEl.src = `res/player/${prefix}_bawah_1.png`;

  const listContainer = document.getElementById("inventory-list");
  if (!listContainer) return;
  listContainer.innerHTML = "";
  if (inventory.length === 0) {
    listContainer.innerHTML = '<p style="color: #bdc3c7; text-align: center; margin-top: 30px; font-weight: bold;">Tas / Inventory Kosong.</p>';
    return;
  }

  inventory.forEach((item) => {
    let itemDiv = document.createElement("div");
    itemDiv.className = "item-card";
    let imagePath = "res/objects/potion_red.png";
    if (item.type === "sword") imagePath = "res/objects/sword_normal.png";
    else if (item.type === "shield") imagePath = "res/objects/shield_wood.png";
    else if (item.type === "key") imagePath = "res/objects/key.png";
    else if (item.type === "clue") imagePath = "res/objects/clue_icon.png";

    itemDiv.innerHTML = `<div class="item-info"><img src="${imagePath}" alt="item"><div><div class="item-name">${item.name}</div><div class="item-qty">${item.equipped ? "[EQUIPPED]" : "Dimiliki: x" + item.count}</div></div></div>`;

    if (item.type === "potion") {
      let useBtn = document.createElement("button");
      useBtn.className = "use-btn";
      useBtn.innerText = "GUNAKAN";
      useBtn.onclick = (e) => {
        e.stopPropagation();
        usePotion();
      };
      itemDiv.appendChild(useBtn);
    } else if (item.type === "clue") {
      let readBtn = document.createElement("button");
      readBtn.className = "use-btn";
      readBtn.style.background = "#3498db";
      readBtn.style.borderColor = "#2980b9";
      readBtn.innerText = "LIHAT";
      readBtn.onclick = (e) => {
        e.stopPropagation();
        showClueOverlay();
      };
      itemDiv.appendChild(readBtn);
    }
    listContainer.appendChild(itemDiv);
  });
}

function usePotion() {
  if (player.hp >= player.maxHp) {
    alert("HP kamu sudah penuh! Jangan buang-buang Potion.");
    return;
  }
  fetch("GameServlet", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `action=use_potion`
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) return;
      let hpDiff = data.player.hp - player.hp;
      if (hpDiff > 0)
        showFloatingDamage(player.x, player.y, `+${hpDiff} HP`, "#2ecc71");
      syncPlayerStatsAndEnemies(data);
      renderInventory();
    });
}

function spawnProjectile(x, y, dir, damage, type = "archer") {
  playSfx("attack");
  let vx = 0, vy = 0;
  if (dir === "up") vy = -6;
  else if (dir === "down") vy = 6;
  else if (dir === "left") vx = -6;
  else if (dir === "right") vx = 6;
  let textureName = `arrow_${projectileDirMap[dir]}`;
  if (type === "mage") textureName = `petir_${projectileDirMap[dir]}_1`;
  else if (type === "fireball") textureName = `fireball_${dir}_1`;
  else if (type === "rock") textureName = `rock_down_1`;
  projectiles.push({ x: x + 15, y: y + 15, vx, vy, size: 24, damage, kind: type, textureName, dir });
}

function isProjectileSolid(x, y) {
  let col = Math.floor(x / TILE_SIZE),
    row = Math.floor(y / TILE_SIZE);
  if (
    activeMap.length === 0 ||
    row < 0 ||
    row >= activeMap.length ||
    col < 0 ||
    col >= activeMap[0].length
  )
    return true;
  let tileId = activeMap[row][col];
  return (
    tileId === 1 || tileId === 2 || tileId === 4 || tileId === 7 ||
    tileId === 9 || tileId === 10 || tileId === 32
  );
}

function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (isProjectileSolid(p.x, p.y)) {
      projectiles.splice(i, 1);
      continue;
    }
    let hit = false;
    enemies.forEach((enemy, idx) => {
      if (
        !hit &&
        enemy.alive &&
        checkCollision(p.x, p.y, p.size, p.size, enemy)
      ) {
        showFloatingDamage(enemy.x, enemy.y, "HIT!", "#3498db");
        playSfx("hit");
        enemy.hitFlash = 8;
        let kbForce = enemy.isBoss ? 5 : 25;
        let kbX = enemy.x;
        let kbY = enemy.y;
        if (p.vy < 0) kbY -= kbForce;
        else if (p.vy > 0) kbY += kbForce;
        else if (p.vx < 0) kbX -= kbForce;
        else if (p.vx > 0) kbX += kbForce;
        if (canMoveTo(kbX, kbY, enemy.width, enemy.height)) {
          enemy.x = kbX;
          enemy.y = kbY;
        }
        fetch("GameServlet", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `action=attack_enemy&enemy_id=${idx}`
        })
          .then((res) => res.json())
          .then((data) => syncPlayerStatsAndEnemies(data));
        hit = true;
      }
    });
    if (hit) projectiles.splice(i, 1);
  }
}

const keys = {};
function showScreen(id) {
  document
    .querySelectorAll(".overlay")
    .forEach((el) => el.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
  if (id === "none") {
    gameState = "PLAYING";
    return;
  }
  gameState = id.toUpperCase();
}
function openSettings() {
  pauseBGM();
  showScreen("settings-menu");
  // Update volume sliders to match current values
  document.getElementById("bgm-volume").value = Math.round(bgmVolume * 100);
  document.getElementById("bgm-volume-val").innerText = Math.round(bgmVolume * 100) + "%";
  document.getElementById("sfx-volume").value = Math.round(sfxVolume * 100);
  document.getElementById("sfx-volume-val").innerText = Math.round(sfxVolume * 100) + "%";

  // Show/hide MAIN MENU button based on game state
  const btnMainMenu = document.getElementById("btn-main-menu");
  if (btnMainMenu) {
    btnMainMenu.style.display = isGameStarted ? "block" : "none";
  }
}
function closeSettings() {
  if (isGameStarted) {
    showScreen("none");
    gameState = "PLAYING";
    if (!isBgmMuted) playBGM();
    requestAnimationFrame(gameLoop);
  } else showScreen("main-menu");
}
function closeInventory() {
  document
    .querySelectorAll(".overlay")
    .forEach((el) => el.classList.remove("active"));
  gameState = "PLAYING";
  if (typeof requestAnimationFrame === "function")
    requestAnimationFrame(gameLoop);
}
function isOnlyInventoryOverlayActive() {
  const activeOverlays = document.querySelectorAll(".overlay.active");
  return (
    activeOverlays.length === 1 &&
    activeOverlays[0] &&
    activeOverlays[0].id === "inventory-menu"
  );
}
function gameOver() {
  stopBGM();
  isGameStarted = false;
  showScreen("game-over-menu");
}
function stageClear() {
  if (stageFinished) return;
  stageFinished = true;
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "bold 40px Arial";
  ctx.fillText(
    "AREA DIBERSIHKAN!",
    canvas.width / 2 - 190,
    canvas.height / 2 - 20
  );
  setTimeout(() => {
    backToMainMenu();
  }, 2500);
}
function backToMainMenu() {
  stopBGM();
  isGameStarted = false;
  let hud = document.getElementById("hud");
  if (hud) hud.style.display = "none";
  showScreen("main-menu");
}

async function enterDungeon() {
  if (isTransitioning) return;
  isTransitioning = true;
  gameState = "TRANSITION";
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "bold 40px Arial";
  ctx.fillText(
    "MEMASUKI DUNGEON...",
    canvas.width / 2 - 230,
    canvas.height / 2 - 20
  );
  await fetchMapFromServer("dungeon02");
  let spawnX = 240;
  let spawnY = 240;
  let foundStairs = false;
  for (let r = 0; r < activeMap.length; r++) {
    if (foundStairs) break;
    for (let c = 0; c < activeMap[r].length; c++) {
      if (activeMap[r][c] === 37 || activeMap[r][c] === 11) {
        spawnX = c * TILE_SIZE;
        spawnY = (r + 1) * TILE_SIZE;
        foundStairs = true;
        break;
      }
    }
  }
  fetch("GameServlet", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `action=enter_dungeon&spawnX=${spawnX}&spawnY=${spawnY}`
  })
    .then((res) => res.json())
    .then((data) => {
      player.x = spawnX;
      player.y = spawnY;
      syncPlayerStatsAndEnemies(data);
      enemies = parseServerEnemies(data.enemies);
      chests = data.chests;
      projectiles = [];
      isTransitioning = false;
      gameState = "PLAYING";
      requestAnimationFrame(gameLoop);
    });
}

async function exitDungeon() {
  if (isTransitioning) return;
  isTransitioning = true;
  gameState = "TRANSITION";
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "bold 40px Arial";
  ctx.fillText(
    "KEMBALI KE PERMUKAAN...",
    canvas.width / 2 - 250,
    canvas.height / 2 - 20
  );
  await fetchMapFromServer("world01");
  let spawnX = parseInt(localStorage.getItem("worldReturnX")) || 240;
  let spawnY = parseInt(localStorage.getItem("worldReturnY")) || 240;
  let pRow = Math.floor(spawnY / TILE_SIZE);
  let pCol = Math.floor(spawnX / TILE_SIZE);
  for (let r = pRow - 2; r <= pRow + 2; r++) {
    for (let c = pCol - 2; c <= pCol + 2; c++) {
      if (activeMap[r] && activeMap[r][c] === 7) {
        activeMap[r][c] = 8;
      }
    }
  }
  fetch("GameServlet", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `action=exit_dungeon&spawnX=${spawnX}&spawnY=${spawnY}`
  })
    .then((res) => res.json())
    .then((data) => {
      player.x = spawnX;
      player.y = spawnY;
      syncPlayerStatsAndEnemies(data);
      enemies = parseServerEnemies(data.enemies);
      chests = data.chests;
      projectiles = [];
      isTransitioning = false;
      gameState = "PLAYING";
      requestAnimationFrame(gameLoop);
    });
}

async function startGame(job) {
  let usernameInput = document.getElementById("username-input");
  let username = usernameInput ? usernameInput.value.trim() : "Player";
  if (!username) username = "Player";

  isGameStarted = true;
  stageFinished = false;
  inventory = [];
  player.setJob(job);
  initPuzzle();

  if (document.getElementById("hud"))
    document.getElementById("hud").style.display = "block";

  await fetchMapFromServer("world01");

  fetch("GameServlet", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `action=new_game&job=${job}&username=${encodeURIComponent(username)}`
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) return alert("Error: " + data.error);
      player.x = data.player.x;
      player.y = data.player.y;
      player.setJob(job);
      syncPlayerStatsAndEnemies(data);
      enemies = parseServerEnemies(data.enemies);
      chests = data.chests;
      document
        .querySelectorAll(".overlay")
        .forEach((el) => el.classList.remove("active"));
      gameState = "PLAYING";

      playBGM();

      requestAnimationFrame(gameLoop);
    });
}

function prepareSlot(action) {
    pendingAction = action;
    showScreen("slot-menu");
}

function cancelSlotSelection() {
    if (pendingAction === "save") {
        showScreen("settings-menu");
    } else {
        showScreen("main-menu");
    }
}

function performSlotAction(slotId) {
    if (pendingAction === "save") {
        saveGameData(slotId);
    } else {
        loadGameData(slotId);
    }
}

function saveGameData(slotId) {
  let safeX = Math.round(player.x);
  let safeY = Math.round(player.y);
  let safeHP = Math.round(player.hp);

  localStorage.setItem("savedMap_" + slotId, currentMapName);

  fetch("GameServlet", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `action=save&slot_id=${slotId}&x=${safeX}&y=${safeY}&hp=${safeHP}&job=${player.job}`
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "saved") {
        alert("BERHASIL: Game tersimpan ke Database!");
        showScreen("settings-menu");
      } else {
        alert(
          "GAGAL MENYIMPAN!\nPastikan XAMPP nyala dan tabel player_save sudah terbuat."
        );
      }
    })
    .catch((err) => {
      alert("ERROR SERVER! Cek tab 'Apache Tomcat' di jendela Output NetBeans Anda.");
      console.error(err);
    });
}

async function loadGameData(slotId) {
  fetch("GameServlet", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `action=load&slot_id=${slotId}`
  })
    .then((res) => res.text())
    .then(async (text) => {
      let data = JSON.parse(text);
      if (data.status === "empty") return alert("Slot kosong!");
      isGameStarted = true;
      stageFinished = false;
      player.setJob(data.player.job);
      player.x = data.player.x;
      player.y = data.player.y;
      syncPlayerStatsAndEnemies(data);

      let savedMap = localStorage.getItem("savedMap_" + slotId) || "world01";
      await fetchMapFromServer(savedMap);

      if (savedMap === "dungeon02") {
        fetch("GameServlet", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `action=enter_dungeon&spawnX=${Math.round(player.x)}&spawnY=${Math.round(player.y)}`
        })
          .then((res) => res.json())
          .then((d) => {
            enemies = parseServerEnemies(d.enemies);
            chests = d.chests;
          });
      } else {
        enemies = parseServerEnemies(data.enemies);
        chests = data.chests;
      }

      projectiles = [];
      showScreen("none");

      if (document.getElementById("hud")) {
        document.getElementById("hud").style.display = "block";
      }

      playBGM();
      requestAnimationFrame(gameLoop);
    });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    gameState === "PLAYING" ? openSettings() : closeSettings();
    return;
  }
  if (e.key === "i" || e.key === "I") {
    const activeElement = document.activeElement;
    if (
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable)
    ) {
      return;
    }

    if (gameState === "INVENTORY-MENU") {
      closeInventory();
      return;
    }

    if (!isOnlyInventoryOverlayActive() && !isGameStarted) {
      return;
    }

    if (!isOnlyInventoryOverlayActive() && gameState !== "PLAYING") {
      return;
    }

    if (!isOnlyInventoryOverlayActive()) {
      showScreen("inventory-menu");
      renderInventory();
    }
    return;
  }
  keys[e.code] = true;
  if (gameState === "PLAYING" && !stageFinished) {
    if (e.code === "Space") {
      e.preventDefault();
      let faceX = player.x + player.width / 2;
      let faceY = player.y + player.height / 2;
      if (player.direction === "up") faceY -= TILE_SIZE;
      else if (player.direction === "down") faceY += TILE_SIZE;
      else if (player.direction === "left") faceX -= TILE_SIZE;
      else if (player.direction === "right") faceX += TILE_SIZE;
      let targetCol = Math.floor(faceX / TILE_SIZE);
      let targetRow = Math.floor(faceY / TILE_SIZE);
      if (activeMap[targetRow] && activeMap[targetRow][targetCol] === 7) {
        if (player.keys > 0) {
          activeMap[targetRow][targetCol] = 8;
          playSfx("unlock");
          showFloatingDamage(faceX, faceY, "PINTU TERBUKA!", "#2ecc71");
          fetch("GameServlet", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=use_key`
          })
            .then((res) => res.json())
            .then((data) => syncPlayerStatsAndEnemies(data));
        } else {
          showFloatingDamage(faceX, faceY, "BUTUH KUNCI!", "#e74c3c");
          playSfx("hurt");
        }
        return;
      }
      let atkBox = {
        x: player.x - 20,
        y: player.y - 20,
        size: player.width + 40
      };
      let hitChest = false;
      chests.forEach((chest, idx) => {
        if (
          !chest.opened &&
          checkCollisionBox(atkBox, {
            x: chest.x,
            y: chest.y,
            width: TILE_SIZE,
            height: TILE_SIZE
          })
        ) {
          let itemName =
            chest.item === "potion"
              ? "Red Potion"
              : chest.item === "sword"
                ? "Iron Sword"
                : chest.item === "shield"
                  ? "Wooden Shield"
                  : chest.item === "clue"
                    ? "Kertas Petunjuk"
                    : "Dungeon Key";
          showFloatingDamage(
            chest.x,
            chest.y - 10,
            `+1 ${itemName}`,
            "#f1c40f"
          );
          if (chest.item === "sword")
            showFloatingDamage(player.x, player.y - 40, "ATK +15!", "#e74c3c");
          if (chest.item === "shield")
            showFloatingDamage(player.x, player.y - 40, "DEF +10!", "#3498db");

          playSfx("unlock");
          setTimeout(() => playSfx("pickup"), 200);
          fetch("GameServlet", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=open_chest&chest_id=${idx}`
          })
            .then((res) => res.json())
            .then((data) => {
              if (!data.error) {
                chests = data.chests;
                syncPlayerStatsAndEnemies(data);
              }
            });
          hitChest = true;
        }
      });
      if (hitChest) return;
      if (player.job === "Mage") {
        if (player.isAttacking) return;
        player.isAttacking = true;
        fetch("GameServlet", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `action=use_skill&skill_num=0`
        })
          .then((res) => res.json())
          .then((data) => {
            player.processSkill(data);
            setTimeout(() => {
              player.isAttacking = false;
            }, 250);
          });
      } else if (player.job === "Archer") {
        if (player.isAttacking) return;
        player.isAttacking = true;
        spawnProjectile(
          player.x,
          player.y,
          player.direction,
          player.baseAtk,
          "rock"
        );
        setTimeout(() => {
          player.isAttacking = false;
        }, 250);
      } else {
        player.performMelee(player.baseAtk);
      }
    }
    if (e.code === "Digit1") player.skill1();
    if (e.code === "Digit2") player.skill2();
  }
});
window.addEventListener("keyup", (e) => (keys[e.code] = false));

function updateHUD() {
  const hpVal = document.getElementById("hp-val");
  const maxHpVal = document.getElementById("max-hp-val");
  const hpFill = document.getElementById("hp-fill");
  const resName = document.getElementById("res-name");
  const resVal = document.getElementById("res-val");
  const hudName = document.getElementById("hud-name");
  if (hpVal) hpVal.innerText = Math.ceil(player.hp);
  if (maxHpVal) maxHpVal.innerText = player.maxHp;
  if (hpFill) hpFill.style.width = (player.hp / player.maxHp) * 100 + "%";
  if (resName)
    resName.innerText = player.job === "Warrior" ? "Rage/MP" : "Mana/MP";
  if (resVal) resVal.innerText = player.mp + " / " + player.maxMp;
  if (hudName) hudName.innerText = player.name || "Player";
}

function checkCollision(x, y, w, h, target) {
  return (
    x < target.x + target.width &&
    x + w > target.x &&
    y < target.y + target.height &&
    y + h > target.y
  );
}
function checkCollisionBox(box1, box2) {
  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.size > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.size > box2.y
  );
}

function isSolid(x, y) {
  let col = Math.floor(x / TILE_SIZE),
    row = Math.floor(y / TILE_SIZE);
  if (
    activeMap.length === 0 ||
    row < 0 ||
    row >= activeMap.length ||
    col < 0 ||
    col >= activeMap[0].length
  )
    return true;
  let tileId = activeMap[row][col];
  return (
    tileId === 1 ||
    tileId === 2 ||
    tileId === 4 ||
    tileId === 7 ||
    tileId === 9 ||
    tileId === 10 ||
    tileId === 12 ||
    tileId === 13 ||
    tileId === 14 ||
    tileId === 15 ||
    tileId === 32
  );
}
function canMoveTo(newX, newY, width, height) {
  return (
    !isSolid(newX, newY) &&
    !isSolid(newX + width, newY) &&
    !isSolid(newX, newY + height) &&
    !isSolid(newX + width, newY + height)
  );
}

function drawMap() {
  if (activeMap.length === 0) return;
  let startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE)),
    endCol = Math.min(
      activeMap[0].length,
      startCol + canvas.width / TILE_SIZE + 1
    );
  let startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE)),
    endRow = Math.min(
      activeMap.length,
      startRow + canvas.height / TILE_SIZE + 1
    );
  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      let img = assets.tiles[activeMap[row][col]];
      if (img && img.complete)
        ctx.drawImage(
          img,
          col * TILE_SIZE - camera.x,
          row * TILE_SIZE - camera.y,
          TILE_SIZE,
          TILE_SIZE
        );
    }
  }
}

function drawChests() {
  chests.forEach((chest) => {
    let cx = chest.x - camera.x,
      cy = chest.y - camera.y;
    if (
      cx + TILE_SIZE < 0 ||
      cx > canvas.width ||
      cy + TILE_SIZE < 0 ||
      cy > canvas.height
    )
      return;
    const imgKey = chest.opened ? "chest_opened" : "chest";
    const img = assets.objects[imgKey] || assets.objects["chest"];
    if (img && img.complete) ctx.drawImage(img, cx, cy, TILE_SIZE, TILE_SIZE);
  });
}
function showFloatingDamage(x, y, damage, color) {
  floatingTexts.push({
    x: x,
    y: y,
    text: typeof damage === "number" ? "-" + Math.floor(damage) : damage,
    color: color,
    life: 60
  });
}

function updateEnemies() {
  enemies.forEach((enemy) => {
    if (!enemy.alive) return;
    const playerCenter = {
        x: player.x + player.width / 2,
        y: player.y + player.height / 2
      },
      enemyCenter = enemy.getCenter();
    const dx = playerCenter.x - enemyCenter.x,
      dy = playerCenter.y - enemyCenter.y,
      distance = Math.sqrt(dx * dx + dy * dy);
    const aggro = enemy.isBoss ? 600 : ENEMY_AGGRO_RANGE;
    const deaggro = enemy.isBoss ? 800 : ENEMY_DEAGGRO_RANGE;
    const atkRange = enemy.isBoss ? 80 : ENEMY_ATTACK_RANGE;

    switch (enemy.state) {
      case "IDLE":
        if (distance <= aggro) {
          enemy.state = "CHASE";
          if (enemy.isBoss)
            showFloatingDamage(
              enemy.x,
              enemy.y - 20,
              "BOSS ENGAGED!",
              "#e74c3c"
            );
        }
        break;
      case "CHASE":
        if (distance > deaggro) {
          enemy.state = "IDLE";
          break;
        }
        if (distance <= atkRange) {
          enemy.state = "ATTACK";
          break;
        }
        let absDx = Math.abs(dx),
          absDy = Math.abs(dy),
          moveX = 0,
          moveY = 0;
        if (absDx > absDy) {
          moveX = dx > 0 ? enemy.speed : -enemy.speed;
          enemy.direction = dx > 0 ? "right" : "left";
        } else {
          moveY = dy > 0 ? enemy.speed : -enemy.speed;
          enemy.direction = dy > 0 ? "down" : "up";
        }
        if (moveX !== 0) {
          if (canMoveTo(enemy.x + moveX, enemy.y, enemy.width, enemy.height)) {
            enemy.x += moveX;
          } else {
            let altY = dy > 0 ? enemy.speed : -enemy.speed;
            if (canMoveTo(enemy.x, enemy.y + altY, enemy.width, enemy.height)) {
              enemy.y += altY;
              enemy.direction = dy > 0 ? "down" : "up";
            }
          }
        } else if (moveY !== 0) {
          if (canMoveTo(enemy.x, enemy.y + moveY, enemy.width, enemy.height)) {
            enemy.y += moveY;
          } else {
            let altX = dx > 0 ? enemy.speed : -enemy.speed;
            if (canMoveTo(enemy.x + altX, enemy.y, enemy.width, enemy.height)) {
              enemy.x += altX;
              enemy.direction = dx > 0 ? "right" : "left";
            }
          }
        }
        break;
      case "ATTACK":
        if (distance > atkRange) {
          enemy.state = "CHASE";
          break;
        }
        if (enemy.attackCooldown <= 0) {
          let dmg = enemy.damage - player.def;
          if (dmg < 1) dmg = 1;
          if (player.isDefending) dmg = Math.floor(dmg * 0.3);
          player.hp -= dmg;
          showFloatingDamage(player.x, player.y, dmg, "red");
          playSfx("hurt");
          playerHitFlash = 10;
          fetch("GameServlet", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=take_damage&damage=${dmg}`
          });
          if (player.hp <= 0) {
            player.hp = 0;
            gameOver();
          }
          updateHUD();
          enemy.attackCooldown = enemy.isBoss ? 90 : 60;
        }
        break;
    }
    if (enemy.attackCooldown > 0) enemy.attackCooldown--;
  });
}

function drawEnemies() {
  enemies.forEach((enemy) => {
    if (!enemy.alive) return;
    const ex = enemy.x - camera.x,
      ey = enemy.y - camera.y;
    if (
      ex + enemy.width < 0 ||
      ex > canvas.width ||
      ey + enemy.height < 0 ||
      ey > canvas.height
    )
      return;
    const frame = Math.floor(Date.now() / 250) % 2 === 0 ? "1" : "2";
    let isAttacking = enemy.attackCooldown > (enemy.isBoss ? 70 : 40);
    let actionStr = isAttacking ? "attack_" : "";
    let assetKey = `${enemy.skin}_${actionStr}${enemy.direction}_${frame}`;
    if (!assets.enemy[assetKey]) {
      assetKey = `${enemy.skin}_${enemy.direction}_${frame}`;
      if (!assets.enemy[assetKey]) {
        assetKey = `${enemy.skin}_down_${frame}`;
      }
      if (!assets.enemy[assetKey]) {
        assetKey = `${enemy.skin}_${frame}`;
      }
    }
    let img = assets.enemy[assetKey];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, ex, ey, enemy.width, enemy.height);
    } else {
      ctx.fillStyle = enemy.isBoss ? "purple" : "red";
      ctx.fillRect(ex, ey, enemy.width, enemy.height);
    }
    if (enemy.hitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(ex, ey, enemy.width, enemy.height);
      ctx.restore();
      enemy.hitFlash--;
    }
    const hpPercent = enemy.hp / enemy.maxHp;
    if (enemy.isBoss) {
      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 14px Arial";
      ctx.fillText("★ SKELETON LORD ★", ex - 15, ey - 25);
      ctx.fillStyle = "#000";
      ctx.fillRect(ex - 15, ey - 20, enemy.width + 30, 10);
      ctx.fillStyle = hpPercent > 0.5 ? "#e74c3c" : "#ff0000";
      ctx.fillRect(ex - 14, ey - 19, (enemy.width + 28) * hpPercent, 8);
      ctx.strokeStyle = "#ffd700";
      ctx.strokeRect(ex - 15, ey - 20, enemy.width + 30, 10);
    } else {
      ctx.fillStyle = "#c0392b";
      ctx.fillRect(ex, ey - 12, enemy.width, 8);
      ctx.fillStyle =
        hpPercent > 0.5 ? "#2ecc71" : hpPercent > 0.25 ? "#f39c12" : "#e74c3c";
      ctx.fillRect(ex, ey - 12, enemy.width * hpPercent, 8);
      ctx.strokeStyle = "#000";
      ctx.strokeRect(ex, ey - 12, enemy.width, 8);
    }
  });
}

function updatePlayer() {
  let isMoving = false,
    newX = player.x,
    newY = player.y;
  if (keys["ArrowUp"] || keys["KeyW"]) {
    newY -= player.speed;
    player.direction = "up";
    isMoving = true;
  } else if (keys["ArrowDown"] || keys["KeyS"]) {
    newY += player.speed;
    player.direction = "down";
    isMoving = true;
  } else if (keys["ArrowLeft"] || keys["KeyA"]) {
    newX -= player.speed;
    player.direction = "left";
    isMoving = true;
  } else if (keys["ArrowRight"] || keys["KeyD"]) {
    newX += player.speed;
    player.direction = "right";
    isMoving = true;
  }
  if (canMoveTo(newX, newY, player.width - 20, player.height - 10)) {
    player.x = newX;
    player.y = newY;
  }
  player.isMoving = isMoving;
  if (isMoving) {
    player.frameCounter++;
    if (player.frameCounter > 10) {
      player.frameNum = player.frameNum === 1 ? 2 : 1;
      player.frameCounter = 0;
    }
  } else {
    player.frameNum = 1;
  }
  let centerFeetX = player.x + player.width / 2;
  let centerFeetY = player.y + player.height - 10;
  let currCol = Math.floor(centerFeetX / TILE_SIZE);
  let currRow = Math.floor(centerFeetY / TILE_SIZE);
  if (
    activeMap[currRow] &&
    (activeMap[currRow][currCol] === 11 ||
      activeMap[currRow][currCol] === 37 ||
      activeMap[currRow][currCol] === 6)
  ) {
    if (currentMapName === "world01") {
      localStorage.setItem("worldReturnX", player.x);
      localStorage.setItem("worldReturnY", player.y + TILE_SIZE);
      enterDungeon();
    } else if (currentMapName === "dungeon02") {
      exitDungeon();
    }
  }
}

function gameLoop() {
  if (gameState === "PLAYING" && !stageFinished) {
    updatePlayer();
    updateProjectiles();
    updateEnemies();
    updatePuzzle();
    updateCamera();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawChests();
    drawEnemies();
    drawPuzzle();
    projectiles.forEach((p) => {
      const img = assets.projectile[p.textureName];
      if (img && img.complete && img.naturalWidth > 0)
        ctx.drawImage(img, p.x - camera.x, p.y - camera.y, p.size, p.size);
      else {
        ctx.fillStyle = p.kind === "mage" ? "#3498db" : "#bdc3c7";
        ctx.beginPath();
        ctx.arc(p.x - camera.x, p.y - camera.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      let text = floatingTexts[i];
      ctx.fillStyle = text.color;
      ctx.font = "bold 20px Arial";
      ctx.fillText(text.text, text.x - camera.x, text.y - camera.y);
      text.y -= 1;
      text.life--;
      if (text.life <= 0) floatingTexts.splice(i, 1);
    }
    const useAttackTexture =
      (player.job || "Warrior") === "Warrior" && player.isAttacking;
    const textureKey = getPlayerTextureKey(
      player.job || "Warrior",
      player.direction,
      1,
      useAttackTexture
    );
    const img = assets.player[textureKey];
    if (img && img.complete && img.naturalWidth > 0) {
      const yBobbing = player.isMoving ? Math.sin(Date.now() / 80) * 3 : 0;
      ctx.drawImage(
        img,
        player.x - camera.x,
        player.y - camera.y + yBobbing,
        player.width,
        player.height
      );
    }
    if (player.isAttacking) {
      const px = player.x - camera.x + player.width / 2,
        py = player.y - camera.y + player.height / 2;
      let angle =
        player.direction === "up"
          ? -Math.PI / 2
          : player.direction === "down"
            ? Math.PI / 2
            : player.direction === "left"
              ? Math.PI
              : 0;
      if (player.job === "Mage" || player.job === "Archer") {
        let glowColor = player.job === "Mage" ? "#3498db" : "#2ecc71";
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(
          px + Math.cos(angle) * 30,
          py + Math.sin(angle) * 30,
          10,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      } else {
        ctx.save();
        ctx.strokeStyle = player.slashColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(px, py, player.width * 0.7, angle - 0.8, angle + 0.8);
        ctx.stroke();
        ctx.restore();
      }
    }
    if (player.isDefending) {
      ctx.strokeStyle = "#3498db";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        player.x + 24 - camera.x,
        player.y + 24 - camera.y,
        30,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    if (playerHitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = playerHitFlash / 25;
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      playerHitFlash--;
    }
  }
  if (gameState === "PLAYING") requestAnimationFrame(gameLoop);
}