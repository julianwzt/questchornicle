/* ==========================================================================
   SCRIPT.JS - QUEST CHRONICLE (ENEMY AI SPRINT)
   ========================================================================== */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- 1. ASSET MANAGER ---
const assets = { tiles: {}, player: {}, objects: {}, projectile: {}, enemy: {} };
function loadAsset(category, name, src) { 
    const img = new Image(); 
    img.src = src; 
    assets[category][name] = img; 
}

const PLAYER_TEXTURES = {
    Warrior: { prefix: 'war', dirMap: { up: 'atas', down: 'bawah', left: 'kiri', right: 'kanan' } },
    Archer: { prefix: 'arc', dirMap: { up: 'atas', down: 'bawah', left: 'kiri', right: 'kanan' } },
    Mage: { prefix: 'mage', dirMap: { up: 'atas', down: 'bawah', left: 'kiri', right: 'kanan' } }
};

function getPlayerTextureKey(job, direction, frameNum = 1) {
    const config = PLAYER_TEXTURES[job] || PLAYER_TEXTURES.Warrior;
    const spriteDir = config.dirMap[direction] || 'bawah';
    return `${config.prefix}_${spriteDir}_${frameNum}`;
}

loadAsset('tiles', '0', 'res/tiles/grass.png'); 
loadAsset('tiles', '1', 'res/tiles/wall.png');
loadAsset('tiles', '2', 'res/tiles/water.png'); 
loadAsset('tiles', '3', 'res/tiles/earth.png');
loadAsset('tiles', '4', 'res/tiles/tree.png');

Object.values(PLAYER_TEXTURES).forEach(({ prefix }) => {
    ['atas_1', 'bawah_1', 'kiri_1', 'kanan_1'].forEach(sprite => {
        loadAsset('player', `${prefix}_${sprite}`, `res/player/${prefix}_${sprite}.png`);
    });
});

loadAsset('objects', 'sword', 'res/objects/sword_normal.png');
loadAsset('objects', 'potion', 'res/objects/potion_red.png');
loadAsset('objects', 'chest', 'res/objects/chest.png');

// Enemy textures
loadAsset('enemy', 'slime', 'res/enemy/slime.png');

const projectileDirMap = { up: 'atas', down: 'bawah', left: 'kiri', right: 'kanan' };
['atas', 'bawah', 'kiri', 'kanan'].forEach(dir => {
    loadAsset('projectile', `arrow_${dir}`, `res/projectile/arrow_${dir}.png`);
    loadAsset('projectile', `petir_${dir}_1`, `res/projectile/petir_${dir}_1.png`);
});

// --- 2. TILEMAP SYSTEM (MULTI-MAP) ---
const TILE_SIZE = 48; 
let currentMapIndex = 0; 

const maps = [
    [ // MAP 1
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,4,4,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,4,4,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,4,4,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,4,4,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    [ // MAP 2
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,4,4,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,4,4,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]
];

const MAP_WIDTH = maps[0][0].length * TILE_SIZE;  // 1200
const MAP_HEIGHT = maps[0].length * TILE_SIZE;      // 960

// --- OBJECTS ON MAP ---
const chests = [
    { x: 2 * TILE_SIZE, y: 2 * TILE_SIZE, opened: false, item: 'potion' },
    { x: 22 * TILE_SIZE, y: 2 * TILE_SIZE, opened: false, item: 'sword' },
    { x: 2 * TILE_SIZE, y: 17 * TILE_SIZE, opened: false, item: 'potion' },
    { x: 22 * TILE_SIZE, y: 17 * TILE_SIZE, opened: false, item: 'potion' }
];

const spawnAreas = [
    { x: 18 * TILE_SIZE, y: 5 * TILE_SIZE, w: 5 * TILE_SIZE, h: 4 * TILE_SIZE, label: 'Spawn A' },
    { x: 18 * TILE_SIZE, y: 13 * TILE_SIZE, w: 5 * TILE_SIZE, h: 4 * TILE_SIZE, label: 'Spawn B' }
];

// --- CAMERA SYSTEM ---
const camera = { x: 0, y: 0 };

function updateCamera() {
    camera.x = player.x + player.width / 2 - canvas.width / 2;
    camera.y = player.y + player.height / 2 - canvas.height / 2;

    if (camera.x < 0) camera.x = 0;
    if (camera.y < 0) camera.y = 0;
    if (camera.x + canvas.width > MAP_WIDTH) camera.x = MAP_WIDTH - canvas.width;
    if (camera.y + canvas.height > MAP_HEIGHT) camera.y = MAP_HEIGHT - canvas.height;

    if (MAP_WIDTH < canvas.width) camera.x = -(canvas.width - MAP_WIDTH) / 2;
    if (MAP_HEIGHT < canvas.height) camera.y = -(canvas.height - MAP_HEIGHT) / 2;
}

// --- 3. ENTITAS GAME & INVENTORY ---
let gameState = 'MAIN-MENU'; 
let isGameStarted = false; 
let projectiles = []; 
const floatingTexts = [];
let stageFinished = false;
let inventory = [];
let pendingAction = null;

// --- ENEMY AI SYSTEM ---
const ENEMY_AGGRO_RANGE = 300;      // Jarak mulai ngejar
const ENEMY_DEAGGRO_RANGE = 500;    // Jarak berhenti ngejar
const ENEMY_ATTACK_RANGE = 50;      // Jarak menyerang
const ENEMY_PATROL_INTERVAL = 120;  // Interval ganti arah patrol

let enemy = {
    x: 19 * TILE_SIZE, 
    y: 7 * TILE_SIZE,
    width: 40, 
    height: 40,
    hp: 200, 
    maxHp: 200,
    damage: 10, 
    speed: 1.2,
    alive: true, 
    attackCooldown: 0,

    // AI State
    state: 'IDLE',        // IDLE, CHASE, PATROL, ATTACK
    patrolDir: { x: 0, y: 0 },
    patrolTimer: 0,
    lastPlayerX: 0,
    lastPlayerY: 0,

    reset(x, y) {
        this.x = x; 
        this.y = y;
        this.hp = this.maxHp;
        this.alive = true;
        this.attackCooldown = 0;
        this.state = 'IDLE';
        this.patrolTimer = 0;
    },

    getCenter() {
        return { x: this.x + this.width/2, y: this.y + this.height/2 };
    }
};

let player = { 
    x: 3 * TILE_SIZE, 
    y: 3 * TILE_SIZE, 
    speed: 2.5,
    width: TILE_SIZE, 
    height: TILE_SIZE,
    job: '', 
    hp: 100, 
    maxHp: 100, 
    isAttacking: false,
    direction: 'down', 
    frameCounter: 0, 
    frameNum: 1, 
    baseAtk: 10, 
    baseDef: 5, 
    slashColor: '#f1c40f',
    resName: '', 
    resVal: 0, 
    resMax: 100,
    isDefending: false,

    setJob(jobName) {
        this.job = jobName;
        if (jobName === 'Warrior') {
            this.maxHp = 150; this.baseAtk = 20; this.baseDef = 10;
            this.resName = 'Rage'; this.resVal = 0; this.resMax = 100;
        } else if (jobName === 'Mage') {
            this.maxHp = 80; this.baseAtk = 5; this.baseDef = 3;
            this.resName = 'Mana'; this.resVal = 100; this.resMax = 100;
        } else if (jobName === 'Archer') {
            this.maxHp = 100; this.baseAtk = 10; this.baseDef = 5;
            this.resName = 'Arrows'; this.resVal = 30; this.resMax = 30;
        }
        this.hp = this.maxHp;
    },

    skill1() {
        if (this.job === 'Warrior' && this.resVal >= 30) {
            this.resVal -= 30;
            this.performMelee(this.baseAtk * 2.5, '#e74c3c');
        } else if (this.job === 'Mage' && this.resVal >= 10) {
            this.resVal -= 10;
            spawnProjectile(this.x, this.y, this.direction, 25, 'mage');
        } else if (this.job === 'Archer' && this.resVal >= 1) {
            this.resVal -= 1;
            spawnProjectile(this.x, this.y, this.direction, 15, 'archer');
        }
        updateHUD();
    },

    skill2() {
        if (this.job === 'Warrior' && this.resVal >= 20) {
            this.resVal -= 20;
            this.isDefending = true;
            setTimeout(() => this.isDefending = false, 2000);
        } else if (this.job === 'Mage') {
            this.resVal = Math.min(this.resMax, this.resVal + 30);
        } else if (this.job === 'Archer' && this.resVal >= 3) {
            this.resVal -= 3;
            spawnProjectile(this.x, this.y, this.direction, 15, 'archer');
            spawnProjectile(this.x + 10, this.y + 10, this.direction, 15, 'archer');
        }
        updateHUD();
    },

    performMelee(damage, color = '#f1c40f') {
        if (this.isAttacking) return;
        this.isAttacking = true;
        this.slashColor = color;

        let atkBox = {
            x: this.x - 20,
            y: this.y - 20,
            size: this.width + 40
        };

        // Buka chest
        chests.forEach(chest => {
            if (!chest.opened && checkCollisionBox(atkBox, { x: chest.x, y: chest.y, width: TILE_SIZE, height: TILE_SIZE })) {
                chest.opened = true;
                showFloatingDamage(chest.x, chest.y, 'ITEM!', '#f1c40f');
                if (chest.item === 'potion') {
                    addInventoryItem('Red Potion', 'potion');
                    showFloatingDamage(player.x, player.y, '+1 Red Potion', '#2ecc71');
                }
                updateHUD();
            }
        });

        // Serang enemy
        if (enemy.alive && checkCollisionBox(atkBox, enemy)) {
            enemy.hp -= damage;
            showFloatingDamage(enemy.x, enemy.y, damage, '#f1c40f');
            if (this.job === 'Warrior') {
                this.resVal = Math.min(this.resMax, this.resVal + 15);
            }
            if (enemy.hp <= 0) {
                enemy.hp = 0;
                enemy.alive = false;
                stageClear();
            }
        }

        updateHUD();
        setTimeout(() => { this.isAttacking = false; }, 150);
    }
};

// --- INVENTORY SYSTEM ---
function addInventoryItem(name, type) {
    let existing = inventory.find(item => item.type === type);
    if (existing) {
        existing.count++;
    } else {
        inventory.push({ name: name, type: type, count: 1 });
    }
}

function closeInventory() {
    document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
    gameState = 'PLAYING';
    requestAnimationFrame(gameLoop);
}

function renderInventory() {
    const listContainer = document.getElementById('inventory-list');
    listContainer.innerHTML = '';

    if (inventory.length === 0) {
        listContainer.innerHTML = '<p style="color: #bdc3c7; font-weight: bold; margin: 15px 0;">Inventory Kosong</p>';
        return;
    }

    inventory.forEach((item, index) => {
        let itemDiv = document.createElement('div');
        itemDiv.className = 'menu-btn';
        itemDiv.style.width = '320px';
        itemDiv.style.display = 'flex';
        itemDiv.style.justifyContent = 'space-between';
        itemDiv.style.alignItems = 'center';
        itemDiv.style.padding = '10px 15px';
        itemDiv.style.margin = '5px 0';
        itemDiv.style.cursor = 'default';

        let imagePath = item.type === 'potion' ? 'res/objects/potion_red.png' : '';

        itemDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${imagePath}" alt="item" style="width: 32px; height: 32px; image-rendering: pixelated;">
                <span style="font-size: 14px;">${item.name} (x${item.count})</span>
            </div>
        `;

        if (item.type === 'potion') {
            let useBtn = document.createElement('button');
            useBtn.innerText = 'USE';
            useBtn.style.background = '#2ecc71';
            useBtn.style.border = '2px solid #27ae60';
            useBtn.style.color = 'white';
            useBtn.style.padding = '6px 12px';
            useBtn.style.cursor = 'pointer';
            useBtn.style.fontWeight = 'bold';
            useBtn.style.borderRadius = '5px';
            useBtn.onmouseover = () => useBtn.style.background = '#27ae60';
            useBtn.onmouseout = () => useBtn.style.background = '#2ecc71';
            useBtn.onclick = (e) => { e.stopPropagation(); usePotion(index); };
            itemDiv.appendChild(useBtn);
        }
        listContainer.appendChild(itemDiv);
    });
}

function usePotion(index) {
    let item = inventory[index];
    if (item && item.type === 'potion' && item.count > 0) {
        if (player.hp >= player.maxHp) {
            alert("Darah pahlawan sudah penuh!");
            return;
        }
        player.hp = Math.min(player.maxHp, player.hp + 30);
        showFloatingDamage(player.x, player.y, '+30 HP', '#2ecc71');
        item.count--;
        if (item.count <= 0) inventory.splice(index, 1);
        updateHUD();
        renderInventory();
    }
}

function spawnProjectile(x, y, dir, damage, type = 'archer') {
    let vx = 0, vy = 0;
    if (dir === 'up') vy = -8;
    else if (dir === 'down') vy = 8;
    else if (dir === 'left') vx = -8;
    else if (dir === 'right') vx = 8;

    const textureName = type === 'mage'
        ? `petir_${projectileDirMap[dir]}_1`
        : `arrow_${projectileDirMap[dir]}`;

    projectiles.push({
        x: x + 15, y: y + 15,
        vx, vy,
        size: 24,
        damage,
        kind: type,
        textureName,
        dir
    });
}

const keys = {};

// --- 4. SISTEM NAVIGASI UI ---
function showScreen(id) { 
    document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active')); 
    const targetOverlay = document.getElementById(id);
    if (targetOverlay) {
        targetOverlay.classList.add('active');
        resetMenuSelection(id);
    }
    gameState = id.toUpperCase(); 
}

function resetMenuSelection(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.menu-btn, .job-card').forEach(el => el.classList.remove('selected'));
    const visibleItems = Array.from(container.querySelectorAll('.menu-btn, .job-card')).filter(el => el.style.display !== 'none');
    if (visibleItems.length > 0) visibleItems[0].classList.add('selected');
}

function openSettings() {
    showScreen('settings-menu');
    if (isGameStarted) {
        document.getElementById('btn-resume').innerText = 'RESUME';
        document.getElementById('btn-main-menu').style.display = 'block';
    } else {
        document.getElementById('btn-resume').innerText = 'KEMBALI';
        document.getElementById('btn-main-menu').style.display = 'none';
    }
    resetMenuSelection('settings-menu');
}

function closeSettings() {
    if (isGameStarted) {
        document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
        gameState = 'PLAYING';
        requestAnimationFrame(gameLoop);
    } else { showScreen('main-menu'); }
}

function gameOver() {
    isGameStarted = false;
    document.getElementById('hud').style.display = 'none';
    showScreen('game-over-menu');
}

function stageClear() {
    if (stageFinished) return;
    stageFinished = true; 

    if (currentMapIndex < maps.length - 1) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px Arial';
        ctx.fillText('MAP CLEAR!', canvas.width / 2 - 120, canvas.height / 2 - 20);

        setTimeout(() => {
            currentMapIndex++; 
            player.x = 3 * TILE_SIZE;
            player.y = 3 * TILE_SIZE;
            enemy.reset(19 * TILE_SIZE, 7 * TILE_SIZE);
            enemy.maxHp += (currentMapIndex * 50);
            enemy.hp = enemy.maxHp;
            enemy.damage += (currentMapIndex * 5);
            projectiles = [];
            chests.forEach(c => c.opened = false);
            updateHUD();

            stageFinished = false; 
            gameState = 'PLAYING';
            requestAnimationFrame(gameLoop);
        }, 2500);
    } else {
        gameState = 'STAGE-CLEAR';
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'yellow';
        ctx.font = 'bold 50px Arial';
        ctx.fillText('GAME TAMAT!', canvas.width / 2 - 160, canvas.height / 2);
        setTimeout(() => { backToMainMenu(); }, 3000);
    }
}

function backToMainMenu() {
    isGameStarted = false;
    currentMapIndex = 0; 
    document.getElementById('hud').style.display = 'none';
    showScreen('main-menu');
}

function startGame(job) {
    isGameStarted = true; 
    stageFinished = false;
    currentMapIndex = 0; 
    inventory = [];
    player.setJob(job);
    player.x = 3 * TILE_SIZE; 
    player.y = 3 * TILE_SIZE;
    enemy.reset(19 * TILE_SIZE, 7 * TILE_SIZE);
    projectiles = []; 
    chests.forEach(c => c.opened = false);

    document.getElementById('job-val').innerText = job; 
    document.getElementById('hud').style.display = 'block';
    updateHUD(); 

    document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
    gameState = 'PLAYING';
    requestAnimationFrame(gameLoop);
}

function prepareSlot(action) {
    pendingAction = action;
    showScreen('slot-menu');
}

function cancelSlotSelection() {
    if (pendingAction === 'save') showScreen('settings-menu');
    else showScreen('main-menu');
}

function performSlotAction(slotId) {
    if (pendingAction === 'save') saveGameData(slotId);
    else if (pendingAction === 'load') loadGameData(slotId);
}

function saveGameData(slotId) {
    let payload = `action=save&slot_id=${slotId}&x=${player.x}&y=${player.y}&hp=${player.hp}&job=${player.job}`;
    fetch('GameServlet', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: payload
    })
    .then(res => res.text())
    .then(text => {
        try {
            let data = JSON.parse(text);
            alert("Progres Berhasil Disimpan di Slot " + slotId + "!");
            showScreen('settings-menu');
        } catch (e) {
            alert("SERVER ERROR! Gagal mengurai data.\nPastikan XAMPP & Driver JDBC MySQL aktif.");
        }
    })
    .catch(err => alert("Gagal koneksi: " + err));
}

function loadGameData(slotId) {
    fetch('GameServlet', {
        method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: `action=load&slot_id=${slotId}`
    })
    .then(res => res.text())
    .then(text => {
        try {
            let data = JSON.parse(text);

            if (data.status === 'empty' || !data.player || !data.player.job) {
                alert("Slot " + slotId + " masih kosong! Silakan pilih slot lain atau mulai Game Baru.");
                showScreen('main-menu');
                return;
            }

            isGameStarted = true; stageFinished = false; currentMapIndex = 0; 

            player.setJob(data.player.job);
            player.x = data.player.x; 
            player.y = data.player.y; 
            player.hp = data.player.hp;

            if (data.enemy) {
                enemy.reset(data.enemy.x || 19 * TILE_SIZE, data.enemy.y || 7 * TILE_SIZE);
                enemy.hp = data.enemy.hp; 
                enemy.maxHp = data.enemy.maxHp; 
                enemy.damage = data.enemy.damage; 
                enemy.speed = data.enemy.speed;
            }

            if (data.inventory) inventory = data.inventory; 
            else inventory = [];

            projectiles = []; chests.forEach(c => c.opened = false);

            document.getElementById('job-val').innerText = player.job; 
            document.getElementById('hud').style.display = 'block';
            updateHUD(); 

            document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
            gameState = 'PLAYING';
            requestAnimationFrame(gameLoop);

            alert("Data Game Berhasil Dimuat dari Server!");
        } catch (e) {
            alert("SERVER ERROR! Gagal memproses data JSON dari Java.");
            console.error(text);
        }
    })
    .catch(err => alert("Gagal koneksi ke server Java: " + err));
}

// --- 5. KEYBOARD LISTENER ---
window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (gameState === 'PLAYING') openSettings();
        else if (gameState === 'SETTINGS-MENU') closeSettings();
        return;
    }

    if (e.key === 'i' || e.key === 'I') {
        if (gameState === 'PLAYING') {
            showScreen('inventory-menu');
            renderInventory();
        } else if (gameState === 'INVENTORY-MENU') {
            closeInventory();
        }
        return;
    }

    const activeOverlay = document.querySelector('.overlay.active');
    if (activeOverlay && gameState.includes('MENU')) {
        const items = Array.from(activeOverlay.querySelectorAll('.menu-btn, .job-card')).filter(el => el.style.display !== 'none');
        if (items.length > 0) {
            let index = items.findIndex(el => el.classList.contains('selected'));
            if (index === -1) index = 0;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { 
                e.preventDefault(); items[index].classList.remove('selected'); 
                index = (index + 1) % items.length; items[index].classList.add('selected'); 
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { 
                e.preventDefault(); items[index].classList.remove('selected'); 
                index = (index - 1 + items.length) % items.length; items[index].classList.add('selected'); 
            } else if (e.key === 'Enter') { 
                e.preventDefault(); items[index].click(); 
            }
        }
    }

    keys[e.code] = true;
    if (gameState === 'PLAYING') {
        if (e.code === 'Space') { e.preventDefault(); player.performMelee(player.baseAtk); }
        if (e.code === 'Digit1') player.skill1(); 
        if (e.code === 'Digit2') player.skill2(); 
    }
});
window.addEventListener('keyup', e => keys[e.code] = false);

// --- 6. LOGIKA GAME ENGINE ---
function updateHUD() { 
    document.getElementById('hp-val').innerText = Math.ceil(player.hp); 
    document.getElementById('max-hp-val').innerText = player.maxHp; 
    document.getElementById('hp-fill').style.width = ((player.hp / player.maxHp) * 100) + '%'; 
    document.getElementById('res-name').innerText = player.resName;
    document.getElementById('res-val').innerText = player.resVal + " / " + player.resMax;
}

function checkCollision(x, y, w, h, target) {
    return (x < target.x + target.width && x + w > target.x && y < target.y + target.height && y + h > target.y);
}
function checkCollisionBox(box1, box2) {
    return (box1.x < box2.x + box2.width && box1.x + box1.size > box2.x && box1.y < box2.y + box2.height && box1.y + box1.size > box2.y);
}

function isSolid(x, y) {
    let col = Math.floor(x / TILE_SIZE), row = Math.floor(y / TILE_SIZE);
    let activeMap = maps[currentMapIndex]; 
    if (row < 0 || row >= activeMap.length || col < 0 || col >= activeMap[0].length) return true;
    let tileId = activeMap[row][col]; 
    return tileId === 1 || tileId === 2 || tileId === 4; 
}

// --- ENEMY COLLISION HELPER ---
function canMoveTo(newX, newY, width, height) {
    return !isSolid(newX, newY) && 
           !isSolid(newX + width, newY) && 
           !isSolid(newX, newY + height) && 
           !isSolid(newX + width, newY + height);
}

function drawMap() {
    let activeMap = maps[currentMapIndex];
    let startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    let endCol = Math.min(activeMap[0].length, startCol + (canvas.width / TILE_SIZE) + 1);
    let startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    let endRow = Math.min(activeMap.length, startRow + (canvas.height / TILE_SIZE) + 1);

    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            let img = assets.tiles[activeMap[row][col]];
            if (img && img.complete) {
                ctx.drawImage(img, col * TILE_SIZE - camera.x, row * TILE_SIZE - camera.y, TILE_SIZE, TILE_SIZE);
            } else {
                const colors = ['#2ecc71', '#7f8c8d', '#3498db', '#d35400', '#27ae60'];
                ctx.fillStyle = colors[activeMap[row][col]] || '#000';
                ctx.fillRect(col * TILE_SIZE - camera.x, row * TILE_SIZE - camera.y, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

function drawChests() {
    chests.forEach(chest => {
        let cx = chest.x - camera.x, cy = chest.y - camera.y;
        if (cx + TILE_SIZE < 0 || cx > canvas.width || cy + TILE_SIZE < 0 || cy > canvas.height) return;
        let img = assets.objects['chest'];
        if (img && img.complete && !chest.opened) { 
            ctx.drawImage(img, cx, cy, TILE_SIZE, TILE_SIZE); 
        } else {
            ctx.fillStyle = chest.opened ? '#7f8c8d' : '#f1c40f';
            ctx.fillRect(cx + 8, cy + 8, TILE_SIZE - 16, TILE_SIZE - 16);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx + 8, cy + 8, TILE_SIZE - 16, TILE_SIZE - 16);
            if (!chest.opened) {
                ctx.fillStyle = '#000';
                ctx.font = 'bold 16px Arial';
                ctx.fillText('?', cx + 20, cy + 32);
            }
        }
    });
}

function drawSpawnAreas() {
    spawnAreas.forEach(area => {
        let ax = area.x - camera.x, ay = area.y - camera.y;
        if (ax + area.w < 0 || ax > canvas.width || ay + area.h < 0 || ay > canvas.height) return;
        ctx.fillStyle = 'rgba(155, 89, 182, 0.2)';
        ctx.fillRect(ax, ay, area.w, area.h);
        ctx.strokeStyle = 'rgba(155, 89, 182, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(ax, ay, area.w, area.h);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(area.label, ax + 10, ay + 18);
    });
}

function showFloatingDamage(x, y, damage, color) {
    floatingTexts.push({ 
        x: x, y: y, 
        text: typeof damage === 'number' ? '-' + Math.floor(damage) : damage, 
        color: color, life: 60 
    });
}

// ============================================================================
// ENEMY AI SYSTEM - LENGKAP
// ============================================================================
function updateEnemy() {
    if (!enemy.alive) return;

    const playerCenter = { x: player.x + player.width/2, y: player.y + player.height/2 };
    const enemyCenter = enemy.getCenter();

    const dx = playerCenter.x - enemyCenter.x;
    const dy = playerCenter.y - enemyCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // --- STATE MACHINE ---
    switch(enemy.state) {
        case 'IDLE':
            // Cek apakah player masuk aggro range
            if (distance <= ENEMY_AGGRO_RANGE) {
                enemy.state = 'CHASE';
                enemy.lastPlayerX = player.x;
                enemy.lastPlayerY = player.y;
            } else {
                // Patrol idle
                enemy.patrolTimer++;
                if (enemy.patrolTimer >= ENEMY_PATROL_INTERVAL) {
                    enemy.patrolTimer = 0;
                    // Random arah: -1, 0, 1 untuk x dan y
                    const dirs = [-1, 0, 1];
                    enemy.patrolDir.x = dirs[Math.floor(Math.random() * 3)];
                    enemy.patrolDir.y = dirs[Math.floor(Math.random() * 3)];
                }

                // Gerak patrol
                if (enemy.patrolDir.x !== 0 || enemy.patrolDir.y !== 0) {
                    let patrolX = enemy.x + enemy.patrolDir.x * (enemy.speed * 0.5);
                    let patrolY = enemy.y + enemy.patrolDir.y * (enemy.speed * 0.5);

                    // Cek collision X
                    if (canMoveTo(patrolX, enemy.y, enemy.width, enemy.height)) {
                        enemy.x = patrolX;
                    }
                    // Cek collision Y
                    if (canMoveTo(enemy.x, patrolY, enemy.width, enemy.height)) {
                        enemy.y = patrolY;
                    }
                }
            }
            break;

        case 'CHASE':
            // Cek de-aggro: player terlalu jauh
            if (distance > ENEMY_DEAGGRO_RANGE) {
                enemy.state = 'IDLE';
                enemy.patrolTimer = ENEMY_PATROL_INTERVAL; // Langsung ganti arah
                break;
            }

            // Cek attack range
            if (distance <= ENEMY_ATTACK_RANGE) {
                enemy.state = 'ATTACK';
                break;
            }

            // Chase player dengan wall collision
            let chaseDx = (dx / distance) * enemy.speed;
            let chaseDy = (dy / distance) * enemy.speed;

            // Try move X
            let newEnemyX = enemy.x + chaseDx;
            if (canMoveTo(newEnemyX, enemy.y, enemy.width, enemy.height)) {
                enemy.x = newEnemyX;
            } else {
                // Slide: coba gerak vertikal aja kalau horizontal blocked
                let slideY = enemy.y + (chaseDy > 0 ? enemy.speed : -enemy.speed);
                if (canMoveTo(enemy.x, slideY, enemy.width, enemy.height)) {
                    enemy.y = slideY;
                }
            }

            // Try move Y
            let newEnemyY = enemy.y + chaseDy;
            if (canMoveTo(enemy.x, newEnemyY, enemy.width, enemy.height)) {
                enemy.y = newEnemyY;
            } else {
                // Slide: coba gerak horizontal aja kalau vertical blocked
                let slideX = enemy.x + (chaseDx > 0 ? enemy.speed : -enemy.speed);
                if (canMoveTo(slideX, enemy.y, enemy.width, enemy.height)) {
                    enemy.x = slideX;
                }
            }

            enemy.lastPlayerX = player.x;
            enemy.lastPlayerY = player.y;
            break;

        case 'ATTACK':
            // Kalau player kabur, chase lagi
            if (distance > ENEMY_ATTACK_RANGE) {
                enemy.state = 'CHASE';
                break;
            }

            // Serang player
            if (enemy.attackCooldown <= 0) {
                let damage = enemy.damage;
                if (player.isDefending) damage *= 0.3;

                player.hp -= damage;
                showFloatingDamage(player.x, player.y, damage, 'red');

                if (player.hp <= 0) {
                    player.hp = 0;
                    gameOver();
                }
                updateHUD();
                enemy.attackCooldown = 60; // 1 detik (60 frame @ 60fps)
            }
            break;
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown--;
}

function drawEnemy() {
    if (!enemy.alive) return;

    const ex = enemy.x - camera.x;
    const ey = enemy.y - camera.y;

    // Culling
    if (ex + enemy.width < 0 || ex > canvas.width || ey + enemy.height < 0 || ey > canvas.height) return;

    // Draw aggro range (visual debug - bisa dihapus kalau gak mau)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(231, 76, 60, 0.15)';
    ctx.lineWidth = 1;
    ctx.arc(ex + enemy.width/2, ey + enemy.height/2, ENEMY_AGGRO_RANGE, 0, Math.PI * 2);
    ctx.stroke();

    // Draw enemy body
    let img = assets.enemy['slime'];
    if (img && img.complete) {
        ctx.drawImage(img, ex, ey, enemy.width, enemy.height);
    } else {
        // Fallback: slime shape
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.ellipse(ex + enemy.width/2, ey + enemy.height/2, enemy.width/2, enemy.height/2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ex + 12, ey + 15, 5, 0, Math.PI * 2);
        ctx.arc(ex + 28, ey + 15, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(ex + 12, ey + 15, 2, 0, Math.PI * 2);
        ctx.arc(ex + 28, ey + 15, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // HP bar di atas enemy
    const hpPercent = enemy.hp / enemy.maxHp;
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(ex, ey - 12, enemy.width, 8);
    ctx.fillStyle = hpPercent > 0.5 ? '#2ecc71' : hpPercent > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(ex, ey - 12, enemy.width * hpPercent, 8);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(ex, ey - 12, enemy.width, 8);

    // State indicator
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 10px Arial';
    const stateLabels = { 'IDLE': '...', 'CHASE': '!', 'ATTACK': '!!', 'PATROL': '~' };
    ctx.fillText(stateLabels[enemy.state] || '', ex + enemy.width + 5, ey + 10);
}

function updatePlayer() {
    let isMoving = false, newX = player.x, newY = player.y;
    if (keys['ArrowUp'] || keys['KeyW']) { newY -= player.speed; player.direction = 'up'; isMoving = true; } 
    else if (keys['ArrowDown'] || keys['KeyS']) { newY += player.speed; player.direction = 'down'; isMoving = true; }
    if (keys['ArrowLeft'] || keys['KeyA']) { newX -= player.speed; player.direction = 'left'; isMoving = true; } 
    else if (keys['ArrowRight'] || keys['KeyD']) { newX += player.speed; player.direction = 'right'; isMoving = true; }

    if (!isSolid(newX + 10, newY + 30) && !isSolid(newX + player.width - 10, newY + 30) &&
        !isSolid(newX + 10, newY + player.height) && !isSolid(newX + player.width - 10, newY + player.height)) {
        player.x = newX; player.y = newY;
    }

    if (player.x < 0) player.x = 0; if (player.y < 0) player.y = 0;
    if (player.x + player.width > MAP_WIDTH) player.x = MAP_WIDTH - player.width;
    if (player.y + player.height > MAP_HEIGHT) player.y = MAP_HEIGHT - player.height;

    if (isMoving) { 
        player.frameCounter++; 
        if (player.frameCounter > 10) { player.frameNum = player.frameNum === 1 ? 2 : 1; player.frameCounter = 0; } 
    } else { player.frameNum = 1; }
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i]; p.x += p.vx; p.y += p.vy;
        if (isSolid(p.x, p.y)) { projectiles.splice(i, 1); continue; }
        if (enemy.alive && checkCollision(p.x, p.y, p.size, p.size, enemy)) {
            enemy.hp -= p.damage; showFloatingDamage(enemy.x, enemy.y, p.damage, '#3498db');
            if (enemy.hp <= 0) { enemy.hp = 0; enemy.alive = false; stageClear(); }
            projectiles.splice(i, 1); updateHUD();
        }
    }
}

function gameLoop() {
    if (gameState === 'PLAYING') {
        updatePlayer(); updateProjectiles(); updateEnemy(); updateCamera();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap(); drawSpawnAreas(); drawChests();

        projectiles.forEach(p => {
            const img = assets.projectile[p.textureName];
            if (img && img.complete) {
                ctx.drawImage(img, p.x - camera.x, p.y - camera.y, p.size, p.size);
            } else {
                ctx.fillStyle = p.kind === 'mage' ? '#3498db' : '#bdc3c7';
                ctx.beginPath();
                ctx.arc(p.x - camera.x, p.y - camera.y, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            let text = floatingTexts[i]; ctx.fillStyle = text.color; ctx.font = '20px Arial';
            ctx.fillText(text.text, text.x - camera.x, text.y - camera.y);
            text.y -= 1; text.life--; if (text.life <= 0) floatingTexts.splice(i, 1);
        }

        drawEnemy();

        const textureKey = getPlayerTextureKey(player.job || 'Warrior', player.direction, 1);
        const img = assets.player[textureKey];
        if (img && img.complete) {
            ctx.drawImage(img, player.x - camera.x, player.y - camera.y, player.width, player.height);
        }

        if (player.isDefending) { ctx.strokeStyle = '#3498db'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(player.x + 24 - camera.x, player.y + 24 - camera.y, 30, 0, Math.PI * 2); ctx.stroke(); }
        if (player.isAttacking) { ctx.strokeStyle = player.slashColor; ctx.lineWidth = 4; ctx.strokeRect(player.x - 10 - camera.x, player.y - 10 - camera.y, player.width + 20, player.height + 20); }

        requestAnimationFrame(gameLoop);
    }
}

gameLoop();