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
    if (isBgmMuted) pauseBGM();
    else playBGM();
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

// ============================================
// MINI PUZZLE SYSTEM - PRESSURE PLATES
// ============================================
let puzzlePlates = [];
let puzzleSolved = false;
let currentPuzzleIndex = 0;
let isPlayerOnPlate = false; // <--- Variabel baru agar tulisan tidak spam
const PUZZLE_SECRET_SEQUENCE = ["MERAH", "BIRU", "HIJAU", "KUNING"];

function initPuzzle() {
    puzzleSolved = false;
    currentPuzzleIndex = 0;
    isPlayerOnPlate = false; // Reset status saat stage dimulai
    
    // Asumsi map cukup besar, ditaruh di berbagai sudut
    puzzlePlates = [
        { id: "MERAH", x: 720, y: 144, width: 48, height: 48, color: "#e74c3c", isPressed: false },
        { id: "HIJAU", x: 2000, y: 144, width: 48, height: 48, color: "#2ecc71", isPressed: false },
        { id: "BIRU", x: 144, y: 2000, width: 48, height: 48, color: "#3498db", isPressed: false },
        { id: "KUNING", x: 2000, y: 2000, width: 48, height: 48, color: "#f1c40f", isPressed: false }
    ];
}

function updatePuzzle() {
    if (puzzleSolved) return;

    let playerHitbox = { x: player.x + 10, y: player.y + 10, width: player.width - 20, height: player.height - 20 };
    let currentlyOnPlate = false; // Cek apakah di frame ini player menempel di plate

    puzzlePlates.forEach(plate => {
        if (checkCollision(playerHitbox.x, playerHitbox.y, playerHitbox.width, playerHitbox.height, plate)) {
            currentlyOnPlate = true; // Player sedang berdiri di atas plate
            
            // Logika hanya berjalan JIKA player sebelumnya tidak berada di atas plate
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
                    puzzlePlates.forEach(p => p.isPressed = false);
                }
            }
        }
    });

    // Mengunci status agar tidak spam selama belum turun dari plate
    isPlayerOnPlate = currentlyOnPlate;
}

function drawPuzzle() {
    puzzlePlates.forEach(plate => {
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

// ============================================
// ASSETS MANAGER
// ============================================
const assets = { tiles: {}, player: {}, objects: {}, projectile: {}, enemy: {} };
function loadAsset(category, name, src) {
    const img = new Image();
    img.src = src;
    assets[category][name] = img;
}

const PLAYER_TEXTURES = {
    Warrior: { prefix: "war", dirMap: { up: "atas", down: "bawah", left: "kiri", right: "kanan" } },
    Archer: { prefix: "arc", dirMap: { up: "atas", down: "bawah", left: "kiri", right: "kanan" } },
    Mage: { prefix: "mage", dirMap: { up: "atas", down: "bawah", left: "kiri", right: "kanan" } },
};

function getPlayerTextureKey(job, direction, frameNum = 1, useAttackTexture = false) {
    const config = PLAYER_TEXTURES[job] || PLAYER_TEXTURES.Warrior;
    const sprite = `${config.prefix}_${config.dirMap[direction] || "bawah"}_${frameNum}`;
    if (useAttackTexture && config.prefix === "war") return `${sprite}_nyerang`;
    return sprite;
}

// Tiles & Player
loadAsset("tiles", "0", "res/tiles/grass.png");
loadAsset("tiles", "8", "res/tiles/000.png");
loadAsset("tiles", "2", "res/tiles/019.png");
loadAsset("tiles", "3", "res/tiles/017.png");
loadAsset("tiles", "4", "res/tiles/tree.png");
loadAsset("tiles", "5", "res/tiles/sand.png");
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

// Objects & Projectiles
loadAsset("objects", "sword", "res/objects/sword_normal.png");
loadAsset("objects", "potion", "res/objects/potion_red.png");
loadAsset("objects", "chest", "res/objects/chest.png");
loadAsset("objects", "chest_opened", "res/objects/chest_opened.png");

const projectileDirMap = { up: "atas", down: "bawah", left: "kiri", right: "kanan" };
["up", "down", "left", "right"].forEach((dir) => {
    let indoDir = projectileDirMap[dir];
    loadAsset("projectile", `arrow_${indoDir}`, `res/projectile/arrow_${indoDir}.png`);
    loadAsset("projectile", `petir_${indoDir}_1`, `res/projectile/petir_${indoDir}_1.png`);
    loadAsset("projectile", `fireball_${dir}_1`, `res/projectile/fireball_${dir}_1.png`);
});
loadAsset("projectile", `rock_down_1`, `res/projectile/rock_down_1.png`);

// Enemies & Boss (Load 4 arah pergerakan)
const dirs = ["up", "down", "left", "right"];
dirs.forEach(dir => {
    loadAsset("enemy", `orc_${dir}_1`, `res/monster/orc_${dir}_1.png`);
    loadAsset("enemy", `orc_${dir}_2`, `res/monster/orc_${dir}_2.png`);
    loadAsset("enemy", `skeletonlord_${dir}_1`, `res/monster/skeletonlord_${dir}_1.png`);
    loadAsset("enemy", `skeletonlord_${dir}_2`, `res/monster/skeletonlord_${dir}_2.png`);
});
loadAsset("enemy", "slime_1", "res/monster/greenslime_down_1.png");
loadAsset("enemy", "slime_2", "res/monster/greenslime_down_2.png");
loadAsset("enemy", "bat_1", "res/monster/bat_down_1.png");
loadAsset("enemy", "bat_2", "res/monster/bat_down_2.png");


// Sound Effects
const SFX_VOLUME = 0.4;
const sfx = {
    attack: new Audio("res/sound/cuttree.wav"),
    hit: new Audio("res/sound/hitmonster.wav"),
    hurt: new Audio("res/sound/receivedamage.wav"),
    pickup: new Audio("res/sound/coin.wav"),
    chest: new Audio("res/sound/unlock.wav"),
    levelup: new Audio("res/sound/levelup.wav"),
    fanfare: new Audio("res/sound/fanfare.wav"),
    powerup: new Audio("res/sound/powerup.wav")
};
Object.values(sfx).forEach((a) => { a.volume = SFX_VOLUME; a.preload = "auto"; });

function playSfx(name) {
    const base = sfx[name];
    if (!base) return;
    try {
        const node = base.cloneNode(); 
        node.volume = SFX_VOLUME;
        node.play().catch(() => {});
    } catch (e) {}
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
        activeMap = text.trim().split("\n").map((row) => row.trim().split(/\s+/).map(Number));
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
const ENEMY_AGGRO_RANGE = 300;
const ENEMY_DEAGGRO_RANGE = 500;
const ENEMY_ATTACK_RANGE = 60;
const ENEMY_PATROL_INTERVAL = 120;
let playerHitFlash = 0; 

function parseServerEnemies(serverEnemies) {
    if (!serverEnemies) return [];
    return serverEnemies.map((e) => {

        // ==========================================
        // AUTO-DETECT BOSS HACK (ANTI CACHE NETBEANS)
        // ==========================================
        if (e.skin && (e.skin.toLowerCase().includes("skeletonlord") || e.skin.toLowerCase().includes("dragon") || e.skin.toLowerCase().includes("boss"))) {
            e.isBoss = true;
            e.skin = "skeletonlord"; 
        }

        if (e.isBoss) {
            e.width = 96;       // Diperbesar
            e.height = 96;
            e.speed = 0.5;      // Diperlambat
        } else {
            e.width = 40;
            e.height = 40;
            e.speed = 0.7;      // Diperlambat
        }
        
        e.patrolDir = { x: 0, y: 0 };
        e.patrolTimer = 0;
        e.attackCooldown = 0;
        e.hitFlash = 0;
        e.direction = "down";
        e.getCenter = function () {
            return { x: this.x + this.width/2, y: this.y + this.height/2 };
        };
        return e;
    });
}

let player = {
    x: 240,
    y: 240,
    speed: 1.5, // Speed diperlambat
    width: TILE_SIZE,
    height: TILE_SIZE,
    job: "",
    hp: 100, maxHp: 100, mp: 100, maxMp: 100,
    isAttacking: false, isMoving: false, direction: "down",
    frameCounter: 0, frameNum: 1, baseAtk: 10, isDefending: false, slashColor: "#f1c40f",

    setJob(jobName) {
        this.job = jobName;
        if (jobName === "Warrior") { this.maxHp = 150; this.baseAtk = 20; }
        else if (jobName === "Mage") { this.maxHp = 80; this.baseAtk = 5; }
        else if (jobName === "Archer") { this.maxHp = 100; this.baseAtk = 10; }
        this.hp = this.maxHp;
    },

    skill1() {
        fetch("GameServlet", {
            method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=use_skill&skill_num=1`,
        }).then(res => res.json()).then(data => this.processSkill(data));
    },

    skill2() {
        fetch("GameServlet", {
            method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=use_skill&skill_num=2`,
        }).then(res => res.json()).then(data => this.processSkill(data));
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
        if (effect === "mage_basic") spawnProjectile(this.x, this.y, this.direction, this.baseAtk, "fireball");
        else if (effect === "warrior_skill_1") this.performMelee(this.baseAtk * 2.5, "#e74c3c");
        else if (effect === "warrior_skill_2") {
            this.isDefending = true;
            setTimeout(() => (this.isDefending = false), 2000);
            showFloatingDamage(this.x, this.y, "DEFENSE UP", "#3498db");
        } 
        else if (effect === "mage_skill_1") spawnProjectile(this.x, this.y, this.direction, 25, "mage");
        else if (effect === "mage_skill_2") showFloatingDamage(this.x, this.y, "+30 MANA", "#3498db");
        else if (effect === "archer_skill_1") spawnProjectile(this.x, this.y, this.direction, 15, "archer");
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
                
                // Knockback kecil
                let kbForce = enemy.isBoss ? 5 : 20; 
                let kbX = enemy.x;
                let kbY = enemy.y;
                if (this.direction === "up") kbY -= kbForce;
                else if (this.direction === "down") kbY += kbForce;
                else if (this.direction === "left") kbX -= kbForce;
                else if (this.direction === "right") kbX += kbForce;
                
                if (canMoveTo(kbX, kbY, enemy.width, enemy.height)) {
                    enemy.x = kbX; enemy.y = kbY;
                }

                fetch("GameServlet", {
                    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `action=attack_enemy&enemy_id=${idx}`,
                }).then(res => res.json()).then(data => syncPlayerStatsAndEnemies(data));
            }
        });
        setTimeout(() => { this.isAttacking = false; }, 150);
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
        playSfx("levelup"); 
    }

    player.hp = data.player.hp;
    player.maxHp = data.player.maxHp;
    player.mp = data.player.mp;
    player.maxMp = data.player.maxMp;
    serverLevel = data.player.level;
    serverExp = data.player.exp;
    serverMaxExp = data.player.maxExp;
    updateHUD();
}

function renderInventory() {
    if (document.getElementById("inv-job")) document.getElementById("inv-job").innerText = player.job || "Warrior";
    if (document.getElementById("inv-level")) document.getElementById("inv-level").innerText = "Lv. " + serverLevel;
    if (document.getElementById("inv-hp")) document.getElementById("inv-hp").innerText = Math.ceil(player.hp) + " / " + player.maxHp;
    if (document.getElementById("inv-mp")) document.getElementById("inv-mp").innerText = player.mp + " / " + player.maxMp;
    if (document.getElementById("inv-exp")) document.getElementById("inv-exp").innerText = serverExp + " / " + serverMaxExp;
    if (document.getElementById("inv-atk")) document.getElementById("inv-atk").innerText = player.baseAtk;

    let prefix = player.job === "Mage" ? "mage" : (player.job === "Archer" ? "arc" : "war");
    let imgEl = document.getElementById("inv-char-img");
    if (imgEl) imgEl.src = `res/player/${prefix}_bawah_1.png`;

    const listContainer = document.getElementById("inventory-list");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    if (inventory.length === 0) {
        listContainer.innerHTML = '<p style="color: #bdc3c7; text-align: center; margin-top: 30px; font-weight: bold;">Tas / Inventory Kosong.</p>';
        return;
    }

    inventory.forEach((item, index) => {
        let itemDiv = document.createElement("div");
        itemDiv.className = "item-card";
        let imagePath = item.type === "potion" ? "res/objects/potion_red.png" : "res/objects/sword_normal.png";

        itemDiv.innerHTML = `
            <div class="item-info">
                <img src="${imagePath}" alt="item">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-qty">Dimiliki: x${item.count}</div>
                </div>
            </div>`;
        if (item.type === "potion") {
            let useBtn = document.createElement("button");
            useBtn.className = "use-btn";
            useBtn.innerText = "GUNAKAN";
            useBtn.onclick = (e) => { e.stopPropagation(); usePotion(index); };
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
            method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=use_potion`,
        }).then(res => res.json()).then(data => {
            if (data.error) return;
            player.hp = data.player.hp;
            showFloatingDamage(player.x, player.y, "+30 HP", "#2ecc71");
            item.count--;
            if (item.count <= 0) inventory.splice(index, 1);
            updateHUD();
            renderInventory();
        });
    }
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
            if (!hit && enemy.alive && checkCollision(p.x, p.y, p.size, p.size, enemy)) {
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
                    enemy.x = kbX; enemy.y = kbY;
                }

                fetch("GameServlet", {
                    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `action=attack_enemy&enemy_id=${idx}`,
                }).then(res => res.json()).then(data => syncPlayerStatsAndEnemies(data));
                
                hit = true;
            }
        });

        if (hit) projectiles.splice(i, 1);
    }
}

const keys = {};
function showScreen(id) {
    document.querySelectorAll(".overlay").forEach((el) => el.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) target.classList.add("active");
    if (id === "none") { gameState = "PLAYING"; return; }
    gameState = id.toUpperCase();
}

function openSettings() { pauseBGM(); showScreen("settings-menu"); }
function closeSettings() {
    if (isGameStarted) { showScreen("none"); gameState = "PLAYING"; playBGM(); requestAnimationFrame(gameLoop); } 
    else showScreen("main-menu");
}
function closeInventory() {
    document.querySelectorAll(".overlay").forEach((el) => el.classList.remove("active"));
    gameState = "PLAYING";
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(gameLoop);
}

function gameOver() { stopBGM(); isGameStarted = false; showScreen("game-over-menu"); }

function stageClear() {
    if (stageFinished) return;
    stageFinished = true;
    
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 40px Arial";
    ctx.fillText("AREA DIBERSIHKAN!", canvas.width / 2 - 190, canvas.height / 2 - 20);
    
    // Ganti ke backToMainMenu() alih-alih me-reset game otomatis
    setTimeout(() => {
        backToMainMenu();
    }, 2500);
}

function backToMainMenu() {
    stopBGM(); isGameStarted = false;
    let hud = document.getElementById("hud"); if (hud) hud.style.display = "none";
    showScreen("main-menu");
}

async function startGame(job) {
    isGameStarted = true;
    stageFinished = false;
    inventory = [];
    player.setJob(job);
    initBGM(); playBGM(); initPuzzle();
    
    if (document.getElementById("job-val")) document.getElementById("job-val").innerText = job;
    if (document.getElementById("hud")) document.getElementById("hud").style.display = "block";
    
    await fetchMapFromServer("world01");

    fetch("GameServlet", {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=new_game&job=${job}`,
    }).then(res => res.json()).then(data => {
        if (data.error) return alert("Error: " + data.error);
        player.x = data.player.x; player.y = data.player.y; player.setJob(job);
        enemies = parseServerEnemies(data.enemies);
        chests = data.chests;
        updateHUD();
        document.querySelectorAll(".overlay").forEach((el) => el.classList.remove("active"));
        gameState = "PLAYING";
        requestAnimationFrame(gameLoop);
    });
}

function prepareSlot(action) { pendingAction = action; showScreen("slot-menu"); }
function cancelSlotSelection() { pendingAction === "save" ? showScreen("settings-menu") : showScreen("main-menu"); }
function performSlotAction(slotId) { pendingAction === "save" ? saveGameData(slotId) : loadGameData(slotId); }

function saveGameData(slotId) {
    fetch("GameServlet", {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=save&slot_id=${slotId}&x=${player.x}&y=${player.y}&hp=${player.hp}&job=${player.job}`,
    }).then(res => res.text()).then(() => { alert("Disimpan!"); showScreen("settings-menu"); });
}

async function loadGameData(slotId) {
    fetch("GameServlet", {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=load&slot_id=${slotId}`,
    }).then(res => res.text()).then(async (text) => {
        let data = JSON.parse(text);
        if (data.status === "empty") return alert("Slot kosong!");
        isGameStarted = true; stageFinished = false;
        player.setJob(data.player.job);
        player.x = data.player.x; player.y = data.player.y; player.hp = data.player.hp;
        serverLevel = data.player.level || 1; serverExp = data.player.exp || 0;
        enemies = parseServerEnemies(data.enemies);
        chests = data.chests; projectiles = [];
        updateHUD();
        await fetchMapFromServer("world01");
        showScreen("none");
        requestAnimationFrame(gameLoop);
    });
}

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { gameState === "PLAYING" ? openSettings() : closeSettings(); return; }
    if (e.key === "i" || e.key === "I") { gameState === "PLAYING" ? (showScreen("inventory-menu"), renderInventory()) : closeInventory(); return; }
    keys[e.code] = true;

    if (gameState === "PLAYING" && !stageFinished) {
        if (e.code === "Space") {
            e.preventDefault();
            let atkBox = { x: player.x - 20, y: player.y - 20, size: player.width + 40 };
            let hitChest = false;
            chests.forEach((chest, idx) => {
                if (!chest.opened && checkCollisionBox(atkBox, { x: chest.x, y: chest.y, width: TILE_SIZE, height: TILE_SIZE })) {
                    showFloatingDamage(chest.x, chest.y, "ITEM!", "#f1c40f");
                    playSfx("pickup");
                    fetch("GameServlet", {
                        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: `action=open_chest&chest_id=${idx}`,
                    }).then(res => res.json()).then(data => { if (!data.error) chests = data.chests; updateHUD(); });
                    hitChest = true;
                }
            });

            if (hitChest) return;

            if (player.job === "Mage") {
                if (player.isAttacking) return;
                player.isAttacking = true;
                fetch("GameServlet", {
                    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `action=use_skill&skill_num=0`,
                }).then(res => res.json()).then(data => { player.processSkill(data); setTimeout(() => { player.isAttacking = false; }, 250); });
            } else if (player.job === "Archer") {
                if (player.isAttacking) return;
                player.isAttacking = true;
                spawnProjectile(player.x, player.y, player.direction, player.baseAtk, "rock");
                setTimeout(() => { player.isAttacking = false; }, 250);
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

    if (hpVal) hpVal.innerText = Math.ceil(player.hp);
    if (maxHpVal) maxHpVal.innerText = player.maxHp;
    if (hpFill) hpFill.style.width = (player.hp / player.maxHp) * 100 + "%";
    
    if (resName) {
        resName.innerText = player.job === "Warrior" ? "Rage/MP" : "Mana/MP";
    }
    if (resVal) {
        resVal.innerText = player.mp + " / " + player.maxMp;
    }
}

function checkCollision(x, y, w, h, target) {
    return (x < target.x + target.width && x + w > target.x && y < target.y + target.height && y + h > target.y);
}
function checkCollisionBox(box1, box2) {
    return (box1.x < box2.x + box2.width && box1.x + box1.size > box2.x && box1.y < box2.y + box2.height && box1.y + box1.size > box2.y);
}
function isSolid(x, y) {
    let col = Math.floor(x / TILE_SIZE), row = Math.floor(y / TILE_SIZE);
    if (activeMap.length === 0 || row < 0 || row >= activeMap.length || col < 0 || col >= activeMap[0].length) return true;
    let tileId = activeMap[row][col];
    return tileId === 1 || tileId === 2 || tileId === 4;
}
function canMoveTo(newX, newY, width, height) {
    return (!isSolid(newX, newY) && !isSolid(newX + width, newY) && !isSolid(newX, newY + height) && !isSolid(newX + width, newY + height));
}

function drawMap() {
    if (activeMap.length === 0) return;
    let startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    let endCol = Math.min(activeMap[0].length, startCol + canvas.width / TILE_SIZE + 1);
    let startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    let endRow = Math.min(activeMap.length, startRow + canvas.height / TILE_SIZE + 1);
    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            let img = assets.tiles[activeMap[row][col]];
            if (img && img.complete) ctx.drawImage(img, col * TILE_SIZE - camera.x, row * TILE_SIZE - camera.y, TILE_SIZE, TILE_SIZE);
        }
    }
}

function drawChests() {
    chests.forEach((chest) => {
        let cx = chest.x - camera.x, cy = chest.y - camera.y;
        if (cx + TILE_SIZE < 0 || cx > canvas.width || cy + TILE_SIZE < 0 || cy > canvas.height) return;
        const imgKey = chest.opened ? "chest_opened" : "chest";
        const img = assets.objects[imgKey] || assets.objects["chest"];
        if (img && img.complete) ctx.drawImage(img, cx, cy, TILE_SIZE, TILE_SIZE);
    });
}
function showFloatingDamage(x, y, damage, color) {
    floatingTexts.push({ x: x, y: y, text: typeof damage === "number" ? "-" + Math.floor(damage) : damage, color: color, life: 60 });
}

function updateEnemies() {
    enemies.forEach((enemy) => {
        if (!enemy.alive) return;
        const playerCenter = { x: player.x + player.width / 2, y: player.y + player.height / 2 };
        const enemyCenter = enemy.getCenter();
        const dx = playerCenter.x - enemyCenter.x;
        const dy = playerCenter.y - enemyCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Update Agresivitas Jarak
        const aggro = enemy.isBoss ? 600 : ENEMY_AGGRO_RANGE;
        const deaggro = enemy.isBoss ? 800 : ENEMY_DEAGGRO_RANGE;
        const atkRange = enemy.isBoss ? 80 : ENEMY_ATTACK_RANGE;

        switch (enemy.state) {
            case "IDLE":
                if (distance <= aggro) {
                    enemy.state = "CHASE";
                    if (enemy.isBoss) showFloatingDamage(enemy.x, enemy.y - 20, "BOSS ENGAGED!", "#e74c3c");
                }
                break;

            case "CHASE":
                if (distance > deaggro) { enemy.state = "IDLE"; break; }
                if (distance <= atkRange) { enemy.state = "ATTACK"; break; }
                
                let absDx = Math.abs(dx);
                let absDy = Math.abs(dy);
                let moveX = 0, moveY = 0;

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
                if (distance > atkRange) { enemy.state = "CHASE"; break; }
                if (enemy.attackCooldown <= 0) {
                    let dmg = enemy.damage;
                    if (player.isDefending) dmg = Math.floor(dmg * 0.3);
                    player.hp -= dmg;
                    showFloatingDamage(player.x, player.y, dmg, "red");
                    playSfx("hurt"); 
                    playerHitFlash = 10; 

                    fetch("GameServlet", {
                        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: `action=take_damage&damage=${dmg}`,
                    });
                    if (player.hp <= 0) { player.hp = 0; gameOver(); }
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
        const ex = enemy.x - camera.x;
        const ey = enemy.y - camera.y;
        if (ex + enemy.width < 0 || ex > canvas.width || ey + enemy.height < 0 || ey > canvas.height) return;

        const frame = Math.floor(Date.now() / 250) % 2 === 0 ? "1" : "2";
        
        let assetKey = `${enemy.skin}_${enemy.direction}_${frame}`;
        if (!assets.enemy[assetKey]) {
            assetKey = `${enemy.skin}_${frame}`;
            if (!assets.enemy[assetKey]) assetKey = `${enemy.skin}_down_${frame}`;
        }

        let img = assets.enemy[assetKey];
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, ex, ey, enemy.width, enemy.height);
        } else {
            ctx.fillStyle = enemy.isBoss ? "purple" : "red";
            ctx.fillRect(ex, ey, enemy.width, enemy.height);
        }

        if (enemy.hitFlash > 0) {
            ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = "#ff0000";
            ctx.fillRect(ex, ey, enemy.width, enemy.height);
            ctx.restore(); enemy.hitFlash--;
        }

        const hpPercent = enemy.hp / enemy.maxHp;
        
        if (enemy.isBoss) {
            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 14px Arial";
            ctx.fillText("★ SKELETON LORD ★", ex - 15, ey - 25);
            ctx.fillStyle = "#000"; ctx.fillRect(ex - 15, ey - 20, enemy.width + 30, 10);
            ctx.fillStyle = hpPercent > 0.5 ? "#e74c3c" : "#ff0000";
            ctx.fillRect(ex - 14, ey - 19, (enemy.width + 28) * hpPercent, 8);
            ctx.strokeStyle = "#ffd700"; ctx.strokeRect(ex - 15, ey - 20, enemy.width + 30, 10);
        } else {
            ctx.fillStyle = "#c0392b"; ctx.fillRect(ex, ey - 12, enemy.width, 8);
            ctx.fillStyle = hpPercent > 0.5 ? "#2ecc71" : hpPercent > 0.25 ? "#f39c12" : "#e74c3c";
            ctx.fillRect(ex, ey - 12, enemy.width * hpPercent, 8);
            ctx.strokeStyle = "#000"; ctx.strokeRect(ex, ey - 12, enemy.width, 8);
        }
    });
}

function updatePlayer() {
    let isMoving = false, newX = player.x, newY = player.y;

    if (keys["ArrowUp"] || keys["KeyW"]) {
        newY -= player.speed; player.direction = "up"; isMoving = true;
    } else if (keys["ArrowDown"] || keys["KeyS"]) {
        newY += player.speed; player.direction = "down"; isMoving = true;
    } else if (keys["ArrowLeft"] || keys["KeyA"]) {
        newX -= player.speed; player.direction = "left"; isMoving = true;
    } else if (keys["ArrowRight"] || keys["KeyD"]) {
        newX += player.speed; player.direction = "right"; isMoving = true;
    }

    if (canMoveTo(newX, newY, player.width - 20, player.height - 10)) {
        player.x = newX; player.y = newY;
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
            if (img && img.complete && img.naturalWidth > 0) ctx.drawImage(img, p.x - camera.x, p.y - camera.y, p.size, p.size);
            else {
                ctx.fillStyle = p.kind === "mage" ? "#3498db" : "#bdc3c7";
                ctx.beginPath(); ctx.arc(p.x - camera.x, p.y - camera.y, 8, 0, Math.PI * 2); ctx.fill();
            }
        });

        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            let text = floatingTexts[i];
            ctx.fillStyle = text.color; ctx.font = "bold 20px Arial";
            ctx.fillText(text.text, text.x - camera.x, text.y - camera.y);
            text.y -= 1; text.life--;
            if (text.life <= 0) floatingTexts.splice(i, 1);
        }

        const useAttackTexture = (player.job || "Warrior") === "Warrior" && player.isAttacking;
        const textureKey = getPlayerTextureKey(player.job || "Warrior", player.direction, 1, useAttackTexture);
        const img = assets.player[textureKey];
        if (img && img.complete && img.naturalWidth > 0) {
            const yBobbing = player.isMoving ? Math.sin(Date.now() / 80) * 3 : 0;
            ctx.drawImage(img, player.x - camera.x, player.y - camera.y + yBobbing, player.width, player.height);
        }

        if (player.isAttacking) {
            const px = player.x - camera.x + player.width / 2;
            const py = player.y - camera.y + player.height / 2;
            let angle = player.direction === "up" ? -Math.PI/2 : (player.direction === "down" ? Math.PI/2 : (player.direction === "left" ? Math.PI : 0));

            if (player.job === "Mage" || player.job === "Archer") {
                let glowColor = player.job === "Mage" ? "#3498db" : "#2ecc71";
                ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = glowColor; ctx.beginPath();
                ctx.arc(px + Math.cos(angle) * 30, py + Math.sin(angle) * 30, 10, 0, Math.PI * 2); ctx.fill(); ctx.restore();
            } else {
                ctx.save(); ctx.strokeStyle = player.slashColor; ctx.lineWidth = 4; ctx.beginPath();
                ctx.arc(px, py, player.width * 0.7, angle - 0.8, angle + 0.8); ctx.stroke(); ctx.restore();
            }
        }

        if (player.isDefending) {
            ctx.strokeStyle = "#3498db"; ctx.lineWidth = 3; ctx.beginPath();
            ctx.arc(player.x + 24 - camera.x, player.y + 24 - camera.y, 30, 0, Math.PI * 2); ctx.stroke();
        }

        if (playerHitFlash > 0) {
            ctx.save(); ctx.globalAlpha = playerHitFlash / 25; ctx.fillStyle = "#ff0000";
            ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.restore();
            playerHitFlash--;
        }
    }
    
    if (gameState === "PLAYING") requestAnimationFrame(gameLoop);
}