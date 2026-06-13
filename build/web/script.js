const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const BGM_VOLUME = 0.3;
let bgmAudio = null;
let isBgmPlaying = false;
let isBgmMuted = false;

function initBGM() {
    if (!bgmAudio) {
        bgmAudio = new Audio("res/sound/background_music.mp3");
        bgmAudio.loop = true;
        bgmAudio.volume = BGM_VOLUME;
        bgmAudio.preload = "auto";
    }
}

function playBGM() {
    if (isBgmMuted || !bgmAudio) return;
    if (!isBgmPlaying) {
        bgmAudio.play().catch(() => {});
        isBgmPlaying = true;
    }
}

function pauseBGM() {
    if (bgmAudio && isBgmPlaying) {
        bgmAudio.pause();
        isBgmPlaying = false;
    }
}

function stopBGM() {
    if (bgmAudio) {
        bgmAudio.pause();
        bgmAudio.currentTime = 0;
        isBgmPlaying = false;
    }
}

function toggleBGMMute() {
    isBgmMuted = !isBgmMuted;
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

let boss = null;
let bossDefeated = false;

function initBoss() {
    boss = {
        nama: "Dragon",
        skin: "dragon",
        hp: 400,
        maxHp: 400,
        damage: 40,
        x: 1800,
        y: 1800,
        width: 64,
        height: 64,
        speed: 1.0,
        alive: true,
        state: "IDLE",
        patrolDir: { x: 0, y: 0 },
        patrolTimer: 0,
        attackCooldown: 0,
        hitFlash: 0,
        isBoss: true,
        getCenter: function() {
            return { x: this.x + 32, y: this.y + 32 };
        }
    };
    bossDefeated = false;
}

function updateBoss() {
    if (!boss || !boss.alive || bossDefeated) return;

    const playerCenter = {
        x: player.x + player.width / 2,
        y: player.y + player.height / 2
    };
    const bossCenter = boss.getCenter();
    const dx = playerCenter.x - bossCenter.x;
    const dy = playerCenter.y - bossCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const BOSS_AGGRO_RANGE = 500;
    const BOSS_DEAGGRO_RANGE = 700;
    const BOSS_ATTACK_RANGE = 80;

    switch (boss.state) {
        case "IDLE":
            if (distance <= BOSS_AGGRO_RANGE) {
                boss.state = "CHASE";
                showFloatingDamage(boss.x, boss.y - 20, "BOSS ENGAGED!", "#e74c3c");
            } else {
                boss.patrolTimer++;
                if (boss.patrolTimer >= ENEMY_PATROL_INTERVAL) {
                    boss.patrolTimer = 0;
                    const dirs = [-1, 0, 1];
                    boss.patrolDir.x = dirs[Math.floor(Math.random() * 3)];
                    boss.patrolDir.y = dirs[Math.floor(Math.random() * 3)];
                }
                if (boss.patrolDir.x !== 0 || boss.patrolDir.y !== 0) {
                    let patrolX = boss.x + boss.patrolDir.x * (boss.speed * 0.3);
                    let patrolY = boss.y + boss.patrolDir.y * (boss.speed * 0.3);
                    if (canMoveTo(patrolX, boss.y, boss.width, boss.height))
                        boss.x = patrolX;
                    if (canMoveTo(boss.x, patrolY, boss.width, boss.height))
                        boss.y = patrolY;
                }
            }
            break;

        case "CHASE":
            if (distance > BOSS_DEAGGRO_RANGE) {
                boss.state = "IDLE";
                boss.patrolTimer = ENEMY_PATROL_INTERVAL;
                break;
            }
            if (distance <= BOSS_ATTACK_RANGE) {
                boss.state = "ATTACK";
                break;
            }
            let chaseDx = (dx / distance) * boss.speed;
            let chaseDy = (dy / distance) * boss.speed;
            let newBossX = boss.x + chaseDx;
            if (canMoveTo(newBossX, boss.y, boss.width, boss.height))
                boss.x = newBossX;
            let newBossY = boss.y + chaseDy;
            if (canMoveTo(boss.x, newBossY, boss.width, boss.height))
                boss.y = newBossY;
            break;

        case "ATTACK":
            if (distance > BOSS_ATTACK_RANGE) {
                boss.state = "CHASE";
                break;
            }
            if (boss.attackCooldown <= 0) {
                let dmg = boss.damage;
                if (player.isDefending) dmg = Math.floor(dmg * 0.3);
                player.hp -= dmg;
                showFloatingDamage(player.x, player.y, dmg, "#e74c3c");
                playSfx("hurt");
                playerHitFlash = 15;

                showFloatingDamage(boss.x, boss.y - 30, "FIRE BREATH!", "#ff6b35");

                fetch("GameServlet", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `action=take_damage&damage=${dmg}`,
                });
                if (player.hp <= 0) {
                    player.hp = 0;
                    gameOver();
                }
                updateHUD();
                boss.attackCooldown = 90;
            }
            break;
    }
    if (boss.attackCooldown > 0) boss.attackCooldown--;
}

function drawBoss() {
    if (!boss || !boss.alive || bossDefeated) return;

    const bx = boss.x - camera.x;
    const by = boss.y - camera.y;

    if (bx + boss.width < 0 || bx > canvas.width || 
        by + boss.height < 0 || by > canvas.height) return;

    const frame = Math.floor(Date.now() / 300) % 2 === 0 ? "1" : "2";
    let img = assets.enemy[`${boss.skin}_${frame}`];

    if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, bx, by, boss.width, boss.height);
    } else {
        ctx.fillStyle = "#8b0000";
        ctx.fillRect(bx, by, boss.width, boss.height);
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.moveTo(bx + 20, by - 10);
        ctx.lineTo(bx + 32, by + 5);
        ctx.lineTo(bx + 44, by - 10);
        ctx.fill();
    }

    if (boss.hitFlash > 0) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(bx, by, boss.width, boss.height);
        ctx.restore();
        boss.hitFlash--;
    }

    const hpPercent = boss.hp / boss.maxHp;
    const barWidth = boss.width + 20;
    const barX = bx - 10;

    ctx.fillStyle = "#000";
    ctx.fillRect(barX, by - 25, barWidth, 14);
    ctx.fillStyle = "#c0392b";
    ctx.fillRect(barX + 1, by - 24, barWidth - 2, 12);
    ctx.fillStyle = hpPercent > 0.5 ? "#e74c3c" : hpPercent > 0.25 ? "#ff6b35" : "#ff0000";
    ctx.fillRect(barX + 1, by - 24, (barWidth - 2) * hpPercent, 12);
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, by - 25, barWidth, 14);

    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 14px Arial";
    ctx.fillText("★ DRAGON BOSS ★", barX, by - 30);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px Arial";
    ctx.fillText(`${boss.hp}/${boss.maxHp}`, barX + barWidth/2 - 25, by - 15);
}

function checkBossHit(projectile, index) {
    if (!boss || !boss.alive || bossDefeated) return false;

    if (checkCollision(projectile.x, projectile.y, projectile.size, projectile.size, boss)) {
        showFloatingDamage(boss.x, boss.y, "HIT!", "#3498db");
        playSfx("hit");
        boss.hitFlash = 10;

        let kbX = boss.x;
        let kbY = boss.y;
        let kbForce = 15;
        if (projectile.vy < 0) kbY -= kbForce;
        else if (projectile.vy > 0) kbY += kbForce;
        else if (projectile.vx < 0) kbX -= kbForce;
        else if (projectile.vx > 0) kbX += kbForce;
        if (canMoveTo(kbX, kbY, boss.width, boss.height)) {
            boss.x = kbX;
            boss.y = kbY;
        }

        boss.hp -= projectile.damage;
        if (boss.hp <= 0) {
            boss.hp = 0;
            boss.alive = false;
            bossDefeated = true;
            showFloatingDamage(boss.x, boss.y - 50, "BOSS DEFEATED!", "#ffd700");
            showFloatingDamage(player.x, player.y - 30, "+500 EXP", "#f1c40f");
            playSfx("levelup");

            setTimeout(() => {
                showFloatingDamage(boss.x, boss.y, "LEGENDARY DROP!", "#9b59b6");
            }, 1000);
        }

        projectiles.splice(index, 1);
        return true;
    }
    return false;
}

function checkBossMeleeHit() {
    if (!boss || !boss.alive || bossDefeated) return;

    let atkBox = { x: player.x - 20, y: player.y - 20, size: player.width + 40 };
    if (checkCollisionBox(atkBox, boss)) {
        showFloatingDamage(boss.x, boss.y, "HIT!", "#f1c40f");
        playSfx("hit");
        boss.hitFlash = 10;

        let kbX = boss.x;
        let kbY = boss.y;
        let kbForce = 20;
        if (player.direction === "up") kbY -= kbForce;
        else if (player.direction === "down") kbY += kbForce;
        else if (player.direction === "left") kbX -= kbForce;
        else if (player.direction === "right") kbX += kbForce;
        if (canMoveTo(kbX, kbY, boss.width, boss.height)) {
            boss.x = kbX;
            boss.y = kbY;
        }

        boss.hp -= player.baseAtk * 2;
        if (boss.hp <= 0) {
            boss.hp = 0;
            boss.alive = false;
            bossDefeated = true;
            showFloatingDamage(boss.x, boss.y - 50, "BOSS DEFEATED!", "#ffd700");
            showFloatingDamage(player.x, player.y - 30, "+500 EXP", "#f1c40f");
            playSfx("levelup");
        }
    }
}



const assets = {
  tiles: {},
  player: {},
  objects: {},
  projectile: {},
  enemy: {},
};
function loadAsset(category, name, src) {
  const img = new Image();
  img.src = src;
  assets[category][name] = img;
}

const PLAYER_TEXTURES = {
  Warrior: {
    prefix: "war",
    dirMap: { up: "atas", down: "bawah", left: "kiri", right: "kanan" },
  },
  Archer: {
    prefix: "arc",
    dirMap: { up: "atas", down: "bawah", left: "kiri", right: "kanan" },
  },
  Mage: {
    prefix: "mage",
    dirMap: { up: "atas", down: "bawah", left: "kiri", right: "kanan" },
  },
};
function getPlayerTextureKey(job, direction, frameNum = 1) {
  const config = PLAYER_TEXTURES[job] || PLAYER_TEXTURES.Warrior;
  return `${config.prefix}_${config.dirMap[direction] || "bawah"}_${frameNum}`;
}

loadAsset("tiles", "0", "res/tiles/grass.png");
loadAsset("tiles", "1", "res/tiles/wall.png");
loadAsset("tiles", "2", "res/tiles/water.png");
loadAsset("tiles", "3", "res/tiles/earth.png");
loadAsset("tiles", "4", "res/tiles/tree.png");
loadAsset("tiles", "5", "res/tiles/sand.png");

Object.values(PLAYER_TEXTURES).forEach(({ prefix }) => {
  ["atas_1", "bawah_1", "kiri_1", "kanan_1"].forEach((sprite) => {
    loadAsset(
      "player",
      `${prefix}_${sprite}`,
      `res/player/${prefix}_${sprite}.png`,
    );
  });
});

loadAsset("objects", "sword", "res/objects/sword_normal.png");
loadAsset("objects", "potion", "res/objects/potion_red.png");
loadAsset("objects", "chest", "res/objects/chest.png");
loadAsset("enemy", "slime_1", "res/monster/greenslime_down_1.png");
loadAsset("enemy", "slime_2", "res/monster/greenslime_down_2.png");
loadAsset("enemy", "orc_1", "res/monster/orc_down_1.png");
loadAsset("enemy", "orc_2", "res/monster/orc_down_2.png");
loadAsset("enemy", "bat_1", "res/monster/bat_down_1.png");
loadAsset("enemy", "bat_2", "res/monster/bat_down_2.png");
loadAsset("enemy", "dragon_1", "res/monster/dragon_down_1.png");
loadAsset("enemy", "dragon_2", "res/monster/dragon_down_2.png");

const projectileDirMap = {
  up: "atas",
  down: "bawah",
  left: "kiri",
  right: "kanan",
};
["up", "down", "left", "right"].forEach((dir) => {
  let indoDir = projectileDirMap[dir];
  loadAsset(
    "projectile",
    `arrow_${indoDir}`,
    `res/projectile/arrow_${indoDir}.png`,
  );
  loadAsset(
    "projectile",
    `petir_${indoDir}_1`,
    `res/projectile/petir_${indoDir}_1.png`,
  );
  // [FITUR BARU] Load Aset Fireball
  loadAsset(
    "projectile",
    `fireball_${dir}_1`,
    `res/projectile/fireball_${dir}_1.png`,
  );
});
// [FITUR BARU] Load Aset Batu (karena cuma ada arah bawah, kita load 1 saja)
loadAsset("projectile", `rock_down_1`, `res/projectile/rock_down_1.png`);

// [FITUR BARU] Sound Effect System
const SFX_VOLUME = 0.4;
const sfx = {
  attack: new Audio("res/sound/cuttree.wav"),
  hit: new Audio("res/sound/hitmonster.wav"),
  hurt: new Audio("res/sound/receivedamage.wav"),
  pickup: new Audio("res/sound/coin.wav"),
  chest: new Audio("res/sound/unlock.wav"),
  levelup: new Audio("res/sound/levelup.wav"),
};
Object.values(sfx).forEach((a) => {
  a.volume = SFX_VOLUME;
  a.preload = "auto";
});
function playSfx(name) {
  const base = sfx[name];
  if (!base) return;
  try {
    const node = base.cloneNode(); // biar bisa overlap kalau dipanggil cepat
    node.volume = SFX_VOLUME;
    node.play().catch(() => {});
  } catch (e) {
    // ignore audio errors (misal browser belum interaksi user)
  }
}

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

async function fetchMapFromServer(mapId) {
  try {
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
  if (camera.y + canvas.height > MAP_HEIGHT)
    camera.y = MAP_HEIGHT - canvas.height;
}

let gameState = "MAIN-MENU";
let isGameStarted = false;
let projectiles = [];
const floatingTexts = [];
let stageFinished = false;
let pendingAction = null;
const ENEMY_AGGRO_RANGE = 300;
const ENEMY_DEAGGRO_RANGE = 500;
const ENEMY_ATTACK_RANGE = 50;
const ENEMY_PATROL_INTERVAL = 120;
let playerHitFlash = 0; // [FITUR BARU] efek flash merah saat player kena damage

function parseServerEnemies(serverEnemies) {
  if (!serverEnemies) return [];
  return serverEnemies.map((e) => {
    e.width = 40;
    e.height = 40;
    e.speed = 1.2;
    e.patrolDir = { x: 0, y: 0 };
    e.patrolTimer = 0;
    e.attackCooldown = 0;
    e.hitFlash = 0;
    e.getCenter = function () {
      return { x: this.x + 20, y: this.y + 20 };
    };
    return e;
  });
}

let player = {
  x: 240,
  y: 240,
  speed: 2.5,
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
  isDefending: false,
  slashColor: "#f1c40f",

  setJob(jobName) {
    this.job = jobName;
    if (jobName === "Warrior") {
      this.maxHp = 150;
      this.baseAtk = 20;
    } else if (jobName === "Mage") {
      this.maxHp = 80;
      this.baseAtk = 5;
    } else if (jobName === "Archer") {
      this.maxHp = 100;
      this.baseAtk = 10;
    }
    this.hp = this.maxHp;
  },

  skill1() {
    fetch("GameServlet", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=use_skill&skill_num=1`,
    })
      .then((res) => res.json())
      .then((data) => this.processSkill(data))
      .catch((e) => console.error(e));
  },

  skill2() {
    fetch("GameServlet", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=use_skill&skill_num=2`,
    })
      .then((res) => res.json())
      .then((data) => this.processSkill(data))
      .catch((e) => console.error(e));
  },

  processSkill(data) {
    if (data.skill_effect === "failed") {
      showFloatingDamage(this.x, this.y - 10, "NO MP!", "#e74c3c");
      return;
    }
    this.hp = data.player.hp;
    this.mp = data.player.mp;
    updateHUD();

    let effect = data.skill_effect;

    // [FITUR BARU] Reaksi dari Server
    if (effect === "mage_basic") {
      spawnProjectile(this.x, this.y, this.direction, this.baseAtk, "fireball");
    } else if (effect === "warrior_skill_1") {
      this.performMelee(this.baseAtk * 2.5, "#e74c3c");
    } else if (effect === "warrior_skill_2") {
      this.isDefending = true;
      setTimeout(() => (this.isDefending = false), 2000);
      showFloatingDamage(this.x, this.y, "DEFENSE UP", "#3498db");
    } else if (effect === "mage_skill_1") {
      spawnProjectile(this.x, this.y, this.direction, 25, "mage");
    } else if (effect === "mage_skill_2") {
      showFloatingDamage(this.x, this.y, "+30 MANA", "#3498db");
    } else if (effect === "archer_skill_1") {
      spawnProjectile(this.x, this.y, this.direction, 15, "archer");
    } else if (effect === "archer_skill_2") {
      spawnProjectile(this.x, this.y, this.direction, 15, "archer");
      spawnProjectile(this.x + 10, this.y + 10, this.direction, 15, "archer");
    }
  },

  performMelee(damage, color = "#f1c40f") {
    if (this.isAttacking) return;
    this.isAttacking = true;
    this.slashColor = color;
    playSfx("attack"); // [FITUR BARU] sound effect attack
    let atkBox = { x: this.x - 20, y: this.y - 20, size: this.width + 40 };

    enemies.forEach((enemy, idx) => {
      if (enemy.alive && checkCollisionBox(atkBox, enemy)) {
        showFloatingDamage(enemy.x, enemy.y, "HIT!", "#f1c40f");
        playSfx("hit"); // [FITUR BARU] sound effect kena hit
        enemy.hitFlash = 8; // [FITUR BARU] efek flash merah saat enemy kena hit
        let kbX = enemy.x;
        let kbY = enemy.y;
        let kbForce = 35;
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
          body: `action=attack_enemy&enemy_id=${idx}`,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) return;
            data.enemies.forEach((serverData, i) => {
              if (enemies[i]) {
                enemies[i].hp = serverData.hp;
                enemies[i].alive = serverData.alive;
              }
            });
            if (data.player.level > serverLevel) {
              showFloatingDamage(
                player.x,
                player.y - 20,
                "LEVEL UP!",
                "#f1c40f",
              );
              playSfx("levelup"); // [FITUR BARU] sound effect level up
            }

            player.hp = data.player.hp;
            player.maxHp = data.player.maxHp;
            player.mp = data.player.mp;
            player.maxMp = data.player.maxMp;
            serverLevel = data.player.level;
            serverExp = data.player.exp;
            serverMaxExp = data.player.maxExp;
            updateHUD();
            if (enemies.every((e) => !e.alive)) stageClear();
          });
      }
    });
    checkBossMeleeHit();
    setTimeout(() => {
      this.isAttacking = false;
    }, 150);
  },
};

function renderInventory() {
  if (document.getElementById("inv-job"))
    document.getElementById("inv-job").innerText = player.job || "Warrior";
  if (document.getElementById("inv-level"))
    document.getElementById("inv-level").innerText = "Lv. " + serverLevel;
  if (document.getElementById("inv-hp"))
    document.getElementById("inv-hp").innerText =
      Math.ceil(player.hp) + " / " + player.maxHp;
  if (document.getElementById("inv-mp"))
    document.getElementById("inv-mp").innerText =
      player.mp + " / " + player.maxMp;
  if (document.getElementById("inv-exp"))
    document.getElementById("inv-exp").innerText =
      serverExp + " / " + serverMaxExp;
  if (document.getElementById("inv-atk"))
    document.getElementById("inv-atk").innerText = player.baseAtk;

  let prefix = "war";
  if (player.job === "Mage") prefix = "mage";
  else if (player.job === "Archer") prefix = "arc";

  let imgEl = document.getElementById("inv-char-img");
  if (imgEl) imgEl.src = `res/player/${prefix}_bawah_1.png`;

  const listContainer = document.getElementById("inventory-list");
  if (!listContainer) return;
  listContainer.innerHTML = "";

  if (inventory.length === 0) {
    listContainer.innerHTML =
      '<p style="color: #bdc3c7; text-align: center; margin-top: 30px; font-weight: bold;">Tas / Inventory Kosong.</p>';
    return;
  }

  inventory.forEach((item, index) => {
    let itemDiv = document.createElement("div");
    itemDiv.className = "item-card";
    let imagePath =
      item.type === "potion"
        ? "res/objects/potion_red.png"
        : "res/objects/sword_normal.png";

    itemDiv.innerHTML = `
            <div class="item-info">
                <img src="${imagePath}" alt="item">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-qty">Dimiliki: x${item.count}</div>
                </div>
            </div>
        `;
    if (item.type === "potion") {
      let useBtn = document.createElement("button");
      useBtn.className = "use-btn";
      useBtn.innerText = "GUNAKAN";
      useBtn.onclick = (e) => {
        e.stopPropagation();
        usePotion(index);
      };
      itemDiv.appendChild(useBtn);
    }
    listContainer.appendChild(itemDiv);
  });
}

function usePotion(index) {
  let item = inventory[index];
  if (item && item.type === "potion" && item.count > 0) {
    if (player.hp >= player.maxHp) {
      alert("HP kamu sudah penuh! Jangan buang-buang Potion.");
      return;
    }

    fetch("GameServlet", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=use_potion`,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return;
        player.hp = data.player.hp;
        showFloatingDamage(player.x, player.y, "+30 HP", "#2ecc71");
        item.count--;
        if (item.count <= 0) inventory.splice(index, 1);
        updateHUD();
        renderInventory();
      })
      .catch((e) => console.error(e));
  }
}

// [FITUR BARU] Spawn Projectile menyesuaikan Fireball dan Rock
function spawnProjectile(x, y, dir, damage, type = "archer") {
  playSfx("attack"); // [FITUR BARU] sound effect attack untuk ranged
  let vx = 0,
    vy = 0;
  if (dir === "up") vy = -8;
  else if (dir === "down") vy = 8;
  else if (dir === "left") vx = -8;
  else if (dir === "right") vx = 8;

  let textureName = `arrow_${projectileDirMap[dir]}`;
  if (type === "mage") {
    textureName = `petir_${projectileDirMap[dir]}_1`;
  } else if (type === "fireball") {
    textureName = `fireball_${dir}_1`;
  } else if (type === "rock") {
    textureName = `rock_down_1`; // Batu selalu berputar arah bawah sesuai aset file
  }

  projectiles.push({
    x: x + 15,
    y: y + 15,
    vx,
    vy,
    size: 24,
    damage,
    kind: type,
    textureName,
    dir,
  });
}

function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (isSolid(p.x, p.y)) {
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
        playSfx("hit"); // [FITUR BARU] sound effect kena hit
        enemy.hitFlash = 8; // [FITUR BARU] efek flash merah saat enemy kena hit

        let kbX = enemy.x;
        let kbY = enemy.y;
        let kbForce = 25;
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
          body: `action=attack_enemy&enemy_id=${idx}`,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) return;
            data.enemies.forEach((se, i) => {
              if (enemies[i]) {
                enemies[i].hp = se.hp;
                enemies[i].alive = se.alive;
              }
            });

            if (data.player.level > serverLevel) {
              showFloatingDamage(
                player.x,
                player.y - 20,
                "LEVEL UP!",
                "#f1c40f",
              );
              playSfx("levelup"); // [FITUR BARU] sound effect level up
            }

            player.hp = data.player.hp;
            player.maxHp = data.player.maxHp;
            player.mp = data.player.mp;
            player.maxMp = data.player.maxMp;
            serverLevel = data.player.level;
            serverExp = data.player.exp;
            serverMaxExp = data.player.maxExp;
            updateHUD();
            if (enemies.every((e) => !e.alive)) stageClear();
          });
        hit = true;
      }
    });
    if (!hit) {
      hit = checkBossHit(p, i);
    }
    if (hit) {
      projectiles.splice(i, 1);
    }
  }
}

const keys = {};
function showScreen(id) {
  document
    .querySelectorAll(".overlay")
    .forEach((el) => el.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
  gameState = id.toUpperCase();
}
function openSettings() {
  pauseBGM();
  showScreen("settings-menu");
  let m = document.getElementById("btn-main-menu");
  if (m) m.style.display = isGameStarted ? "block" : "none";
}
function closeSettings() {
  if (isGameStarted) {
    showScreen("none");
    gameState = "PLAYING";
    playBGM();
    requestAnimationFrame(gameLoop);
  } else showScreen("main-menu");
}
function closeInventory() {
  showScreen("none");
  gameState = "PLAYING";
  requestAnimationFrame(gameLoop);
}
function gameOver() {
  stopBGM();
  isGameStarted = false;
  let hud = document.getElementById("hud");
  if (hud) hud.style.display = "none";
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
    canvas.height / 2 - 20,
  );
  setTimeout(() => {
    fetch("GameServlet", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=new_game`,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          enemies = parseServerEnemies(data.enemies);
          chests = data.chests;
          projectiles = [];
          updateHUD();
          stageFinished = false;
          gameState = "PLAYING";
          requestAnimationFrame(gameLoop);
        }
      })
      .catch((e) => console.error(e));
  }, 2500);
}

function backToMainMenu() {
  stopBGM();
  isGameStarted = false;
  let hud = document.getElementById("hud");
  if (hud) hud.style.display = "none";
  showScreen("main-menu");
}

async function startGame(job) {
  isGameStarted = true;
  stageFinished = false;
  inventory = [];
  player.setJob(job);
      initBGM();
      playBGM();
      initBoss();
  if (document.getElementById("job-val"))
    document.getElementById("job-val").innerText = job;
  if (document.getElementById("hud"))
    document.getElementById("hud").style.display = "block";
  await fetchMapFromServer("world01");

  fetch("GameServlet", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `action=new_game&job=${job}`,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error || !data.player) {
        alert("Error Backend Java: " + (data.error || "Data Kosong"));
        return;
      }
      player.x = data.player.x;
      player.y = data.player.y;
      player.setJob(job);
      enemies = parseServerEnemies(data.enemies);
      chests = data.chests;
      updateHUD();
      document
        .querySelectorAll(".overlay")
        .forEach((el) => el.classList.remove("active"));
      gameState = "PLAYING";
      requestAnimationFrame(gameLoop);
    })
    .catch((error) => {
      alert("Gagal load Server Java! Coba Clean & Build lalu F5.");
    });
}

function prepareSlot(action) {
  pendingAction = action;
  showScreen("slot-menu");
}
function cancelSlotSelection() {
  pendingAction === "save"
    ? showScreen("settings-menu")
    : showScreen("main-menu");
}
function performSlotAction(slotId) {
  pendingAction === "save" ? saveGameData(slotId) : loadGameData(slotId);
}

function saveGameData(slotId) {
  let payload = `action=save&slot_id=${slotId}&x=${player.x}&y=${player.y}&hp=${player.hp}&job=${player.job}`;
  fetch("GameServlet", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload,
  })
    .then((res) => res.text())
    .then((text) => {
      alert("Disimpan di Slot " + slotId);
      showScreen("settings-menu");
    });
}

async function loadGameData(slotId) {
  fetch("GameServlet", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `action=load&slot_id=${slotId}`,
  })
    .then((res) => res.text())
    .then(async (text) => {
      let data = JSON.parse(text);
      if (data.status === "empty" || !data.player) {
        alert("Slot kosong!");
        showScreen("main-menu");
        return;
      }
      isGameStarted = true;
      stageFinished = false;
      player.setJob(data.player.job);
      player.x = data.player.x;
      player.y = data.player.y;
      player.hp = data.player.hp;
      player.mp = data.player.mp || player.maxMp;
      serverLevel = data.player.level || 1;
      serverExp = data.player.exp || 0;
      enemies = parseServerEnemies(data.enemies);
      chests = data.chests;
      projectiles = [];
      if (document.getElementById("job-val"))
        document.getElementById("job-val").innerText = player.job;
      if (document.getElementById("hud"))
        document.getElementById("hud").style.display = "block";
      updateHUD();
      await fetchMapFromServer("world01");
      document
        .querySelectorAll(".overlay")
        .forEach((el) => el.classList.remove("active"));
      gameState = "PLAYING";
      requestAnimationFrame(gameLoop);
    })
    .catch((e) => alert("Gagal Load DB!"));
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    gameState === "PLAYING" ? openSettings() : closeSettings();
    return;
  }
  if (e.key === "i" || e.key === "I") {
    gameState === "PLAYING"
      ? (showScreen("inventory-menu"), renderInventory())
      : closeInventory();
    return;
  }
  keys[e.code] = true;

  if (gameState === "PLAYING") {
    // [FITUR BARU] SPASI DIPISAH AGAR ARCHER & MAGE BISA BUKA PETI
    if (e.code === "Space") {
      e.preventDefault();

      // 1. Cek Interaksi Peti Lebih Dulu (Bisa buka peti walau dari jarak dekat)
      let atkBox = {
        x: player.x - 20,
        y: player.y - 20,
        size: player.width + 40,
      };
      let hitChest = false;
      chests.forEach((chest, idx) => {
        if (
          !chest.opened &&
          checkCollisionBox(atkBox, {
            x: chest.x,
            y: chest.y,
            width: TILE_SIZE,
            height: TILE_SIZE,
          })
        ) {
          showFloatingDamage(chest.x, chest.y, "ITEM!", "#f1c40f");
          playSfx("pickup"); // [FITUR BARU] sound effect pickup item
          fetch("GameServlet", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=open_chest&chest_id=${idx}`,
          })
            .then((res) => res.json())
            .then((data) => {
              if (!data.error) {
                chests = data.chests;
                inventory = data.inventory;
                updateHUD();
              }
            });
          hitChest = true;
        }
      });

      // Jika lagi buka peti, gak usah menyerang.
      if (hitChest) return;

      // 2. Jika tidak ada peti, jalankan Basic Attack berdasarkan Job!
      if (player.job === "Mage") {
        if (player.isAttacking) return;
        player.isAttacking = true;
        fetch("GameServlet", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `action=use_skill&skill_num=0`,
        })
          .then((res) => res.json())
          .then((data) => {
            player.processSkill(data);
            setTimeout(() => {
              player.isAttacking = false;
            }, 250);
          })
          .catch((e) => {
            console.error(e);
            player.isAttacking = false;
          });
      } else if (player.job === "Archer") {
        if (player.isAttacking) return;
        player.isAttacking = true;
        spawnProjectile(
          player.x,
          player.y,
          player.direction,
          player.baseAtk,
          "rock",
        );
        setTimeout(() => {
          player.isAttacking = false;
        }, 250);
      } else {
        player.performMelee(player.baseAtk); // Warrior Melee
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
  if (hpVal) hpVal.innerText = Math.ceil(player.hp);
  if (maxHpVal) maxHpVal.innerText = player.maxHp;
  if (hpFill) hpFill.style.width = (player.hp / player.maxHp) * 100 + "%";
  if (resName)
    resName.innerText = player.job === "Warrior" ? "Rage/MP" : "Mana/MP";
  if (resVal) resVal.innerText = player.mp + " / " + player.maxMp;
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
  return tileId === 1 || tileId === 2 || tileId === 4;
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
  let startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
  let endCol = Math.min(
    activeMap[0].length,
    startCol + canvas.width / TILE_SIZE + 1,
  );
  let startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
  let endRow = Math.min(
    activeMap.length,
    startRow + canvas.height / TILE_SIZE + 1,
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
          TILE_SIZE,
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
    let img = assets.objects["chest"];
    if (img && img.complete && !chest.opened) {
      ctx.drawImage(img, cx, cy, TILE_SIZE, TILE_SIZE);
    } else if (chest.opened) {
      ctx.fillStyle = "#7f8c8d";
      ctx.fillRect(cx + 8, cy + 8, TILE_SIZE - 16, TILE_SIZE - 16);
    }
  });
}
function showFloatingDamage(x, y, damage, color) {
  floatingTexts.push({
    x: x,
    y: y,
    text: typeof damage === "number" ? "-" + Math.floor(damage) : damage,
    color: color,
    life: 60,
  });
}

function updateEnemies() {
  enemies.forEach((enemy) => {
    if (!enemy.alive) return;
    const playerCenter = {
      x: player.x + player.width / 2,
      y: player.y + player.height / 2,
    };
    const enemyCenter = enemy.getCenter();
    const dx = playerCenter.x - enemyCenter.x;
    const dy = playerCenter.y - enemyCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    switch (enemy.state) {
      case "IDLE":
        if (distance <= ENEMY_AGGRO_RANGE) {
          enemy.state = "CHASE";
        } else {
          enemy.patrolTimer++;
          if (enemy.patrolTimer >= ENEMY_PATROL_INTERVAL) {
            enemy.patrolTimer = 0;
            const dirs = [-1, 0, 1];
            enemy.patrolDir.x = dirs[Math.floor(Math.random() * 3)];
            enemy.patrolDir.y = dirs[Math.floor(Math.random() * 3)];
          }
          if (enemy.patrolDir.x !== 0 || enemy.patrolDir.y !== 0) {
            let patrolX = enemy.x + enemy.patrolDir.x * (enemy.speed * 0.5);
            let patrolY = enemy.y + enemy.patrolDir.y * (enemy.speed * 0.5);
            if (canMoveTo(patrolX, enemy.y, enemy.width, enemy.height))
              enemy.x = patrolX;
            if (canMoveTo(enemy.x, patrolY, enemy.width, enemy.height))
              enemy.y = patrolY;
          }
        }
        break;
      case "CHASE":
        if (distance > ENEMY_DEAGGRO_RANGE) {
          enemy.state = "IDLE";
          enemy.patrolTimer = ENEMY_PATROL_INTERVAL;
          break;
        }
        if (distance <= ENEMY_ATTACK_RANGE) {
          enemy.state = "ATTACK";
          break;
        }
        let chaseDx = (dx / distance) * enemy.speed;
        let chaseDy = (dy / distance) * enemy.speed;
        let newEnemyX = enemy.x + chaseDx;
        if (canMoveTo(newEnemyX, enemy.y, enemy.width, enemy.height))
          enemy.x = newEnemyX;
        else {
          let slideY = enemy.y + (chaseDy > 0 ? enemy.speed : -enemy.speed);
          if (canMoveTo(enemy.x, slideY, enemy.width, enemy.height))
            enemy.y = slideY;
        }
        let newEnemyY = enemy.y + chaseDy;
        if (canMoveTo(enemy.x, newEnemyY, enemy.width, enemy.height))
          enemy.y = newEnemyY;
        else {
          let slideX = enemy.x + (chaseDx > 0 ? enemy.speed : -enemy.speed);
          if (canMoveTo(slideX, enemy.y, enemy.width, enemy.height))
            enemy.x = slideX;
        }
        break;
      case "ATTACK":
        if (distance > ENEMY_ATTACK_RANGE) {
          enemy.state = "CHASE";
          break;
        }
        if (enemy.attackCooldown <= 0) {
          let dmg = enemy.damage;
          if (player.isDefending) dmg = Math.floor(dmg * 0.3);
          player.hp -= dmg;
          showFloatingDamage(player.x, player.y, dmg, "red");
          playSfx("hurt"); // [FITUR BARU] sound effect player kena damage
          playerHitFlash = 10; // [FITUR BARU] efek flash merah di layar saat kena damage
          fetch("GameServlet", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=take_damage&damage=${dmg}`,
          });
          if (player.hp <= 0) {
            player.hp = 0;
            gameOver();
          }
          updateHUD();
          enemy.attackCooldown = 60;
        }
        break;
    }
    if (enemy.attackCooldown > 0) enemy.attackCooldown--;
  });
}

function drawEnemies() {
  enemies.forEach((enemy) => {
    if (!enemy.alive) return;
    const ex = enemy.x - camera.x;
    const ey = enemy.y - camera.y;
    if (
      ex + enemy.width < 0 ||
      ex > canvas.width ||
      ey + enemy.height < 0 ||
      ey > canvas.height
    )
      return;

    const frame = Math.floor(Date.now() / 250) % 2 === 0 ? "1" : "2";
    let img = assets.enemy[`${enemy.skin}_${frame}`];

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, ex, ey, enemy.width, enemy.height);
    }

    // [FITUR BARU] Efek flash merah saat enemy kena damage
    if (enemy.hitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(ex, ey, enemy.width, enemy.height);
      ctx.restore();
      enemy.hitFlash--;
    }

    const hpPercent = enemy.hp / enemy.maxHp;
    ctx.fillStyle = "#c0392b";
    ctx.fillRect(ex, ey - 12, enemy.width, 8);
    ctx.fillStyle =
      hpPercent > 0.5 ? "#2ecc71" : hpPercent > 0.25 ? "#f39c12" : "#e74c3c";
    ctx.fillRect(ex, ey - 12, enemy.width * hpPercent, 8);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(ex, ey - 12, enemy.width, 8);
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
  }
  if (keys["ArrowLeft"] || keys["KeyA"]) {
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
  player.isMoving = isMoving; // [FITUR BARU] dipakai untuk animasi walk
  if (isMoving) {
    player.frameCounter++;
    if (player.frameCounter > 10) {
      player.frameNum = player.frameNum === 1 ? 2 : 1;
      player.frameCounter = 0;
    }
  } else {
    player.frameNum = 1;
  }
}

function gameLoop() {
  if (gameState === "PLAYING") {
    updatePlayer();
    updateProjectiles();
    updateEnemies();
    updateBoss();
    updateCamera();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMap();
    drawChests();
    drawEnemies();
    drawBoss();

    // RENDER PELURU/SIHIR
    projectiles.forEach((p) => {
      const img = assets.projectile[p.textureName];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, p.x - camera.x, p.y - camera.y, p.size, p.size);
      } else {
        ctx.fillStyle = p.kind === "mage" ? "#3498db" : "#bdc3c7";
        ctx.beginPath();
        ctx.arc(p.x - camera.x, p.y - camera.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Teks melayang (Damage, Item, dll)
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      let text = floatingTexts[i];
      ctx.fillStyle = text.color;
      ctx.font = "bold 20px Arial";
      ctx.fillText(text.text, text.x - camera.x, text.y - camera.y);
      text.y -= 1;
      text.life--;
      if (text.life <= 0) floatingTexts.splice(i, 1);
    }

    // Gambar Karakter Pahlawan
    const textureKey = getPlayerTextureKey(
      player.job || "Warrior",
      player.direction,
      1,
    );
    const img = assets.player[textureKey];
    if (img && img.complete && img.naturalWidth > 0) {
      // [FITUR BARU] Animasi walk lebih halus (bobbing sinus saat bergerak)
      const yBobbing = player.isMoving ? Math.sin(Date.now() / 80) * 3 : 0;
      ctx.drawImage(
        img,
        player.x - camera.x,
        player.y - camera.y + yBobbing,
        player.width,
        player.height,
      );
    }

    // [FITUR BARU] Animasi Attack Sederhana
    if (player.isAttacking) {
      const px = player.x - camera.x + player.width / 2;
      const py = player.y - camera.y + player.height / 2;
      let angle = 0;
      if (player.direction === "up") angle = -Math.PI / 2;
      else if (player.direction === "down") angle = Math.PI / 2;
      else if (player.direction === "left") angle = Math.PI;
      else angle = 0;

      if (player.job === "Mage" || player.job === "Archer") {
        // Efek cast/lepas tembakan untuk Mage & Archer
        let glowColor = player.job === "Mage" ? "#3498db" : "#2ecc71";
        let gx = px + Math.cos(angle) * 30;
        let gy = py + Math.sin(angle) * 30;
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(gx, gy, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // Efek slash untuk Warrior (melee)
        ctx.save();
        ctx.strokeStyle = player.slashColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(px, py, player.width * 0.7, angle - 0.8, angle + 0.8);
        ctx.stroke();
        ctx.restore();
      }
    }

    //Skill 2 (Bertahan)
    if (player.isDefending) {
      ctx.strokeStyle = "#3498db";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        player.x + 24 - camera.x,
        player.y + 24 - camera.y,
        30,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    // [FITUR BARU] Efek flash merah di layar saat player kena damage
    if (playerHitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = playerHitFlash / 25;
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      playerHitFlash--;
    }

    requestAnimationFrame(gameLoop);
  }
}