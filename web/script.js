const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- 1. ASSET MANAGER ---
const assets = { tiles: {}, player: {}, objects: {} };
function loadAsset(category, name, src) { 
    const img = new Image(); 
    img.src = src; 
    assets[category][name] = img; 
}

loadAsset('tiles', '0', 'res/tiles/grass.png'); 
loadAsset('tiles', '1', 'res/tiles/wall.png');
loadAsset('tiles', '2', 'res/tiles/water.png'); 
loadAsset('tiles', '3', 'res/tiles/earth.png');
loadAsset('tiles', '4', 'res/tiles/tree.png');

['down_1', 'down_2', 'up_1', 'up_2', 'left_1', 'left_2', 'right_1', 'right_2'].forEach(dir => {
    loadAsset('player', dir, `res/player/boy_${dir}.png`);
});

loadAsset('objects', 'sword', 'res/objects/sword_normal.png');
loadAsset('objects', 'potion', 'res/objects/potion_red.png');
loadAsset('objects', 'chest', 'res/objects/chest.png'); // Fallback akan handle kalau gak ada

// --- 2. TILEMAP SYSTEM ---
const TILE_SIZE = 48; 

// Map 20x25 (960x1200) — rapi, variatif, gak kosong
const mapGrid = [
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
];

const MAP_WIDTH = mapGrid[0].length * TILE_SIZE;  // 1200
const MAP_HEIGHT = mapGrid.length * TILE_SIZE;      // 960

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

// --- 3. ENTITAS GAME ---
let gameState = 'MAIN-MENU'; 
let isGameStarted = false; 
let projectiles = []; 
const floatingTexts = [];
let stageFinished = false;

let enemy = {
    x: 19 * TILE_SIZE,
    y: 7 * TILE_SIZE,
    width: 40,
    height: 48,
    hp: 200,
    maxHp: 200,
    damage: 10,
    speed: 1,
    alive: true,
    attackCooldown: 0
};

let player = { 
    x: 3 * TILE_SIZE, y: 3 * TILE_SIZE, 
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
            spawnProjectile(this.x, this.y, this.direction, '#3498db', 25);
        } else if (this.job === 'Archer' && this.resVal >= 1) {
            this.resVal -= 1;
            spawnProjectile(this.x, this.y, this.direction, '#bdc3c7', 15);
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
            spawnProjectile(this.x, this.y, this.direction, '#bdc3c7', 15);
            spawnProjectile(this.x + 10, this.y + 10, this.direction, '#bdc3c7', 15);
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

        // Cek collision dengan chest (buka chest)
        chests.forEach(chest => {
            if (!chest.opened && checkCollisionBox(atkBox, { x: chest.x, y: chest.y, width: TILE_SIZE, height: TILE_SIZE })) {
                chest.opened = true;
                showFloatingDamage(chest.x, chest.y, 'ITEM!', '#f1c40f');
                // Bonus efek
                if (chest.item === 'potion') {
                    this.hp = Math.min(this.maxHp, this.hp + 30);
                    showFloatingDamage(this.x, this.y, '+30 HP', '#2ecc71');
                }
                updateHUD();
            }
        });

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

function spawnProjectile(x, y, dir, color, damage) {
    let vx = 0, vy = 0;
    if (dir === 'up') vy = -8; 
    else if (dir === 'down') vy = 8;
    else if (dir === 'left') vx = -8; 
    else if (dir === 'right') vx = 8;
    projectiles.push({ x: x + 15, y: y + 15, vx: vx, vy: vy, size: 10, color: color, damage: damage });
}

const keys = {};

// --- 4. SISTEM NAVIGASI & INTERAKSI UI ---
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
    const visibleItems = Array.from(container.querySelectorAll('.menu-btn, .job-card'))
                              .filter(el => el.style.display !== 'none');
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
    } else {
        showScreen('main-menu');
    }
}

function gameOver() {
    isGameStarted = false;
    document.getElementById('hud').style.display = 'none';
    showScreen('game-over-menu');
}

function stageClear() {
    if (stageFinished) return;
    stageFinished = true;
    gameState = 'STAGE-CLEAR';
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'yellow';
    ctx.font = 'bold 50px Arial';
    ctx.fillText('STAGE CLEAR!', canvas.width / 2 - 180, canvas.height / 2);
    setTimeout(() => { backToMainMenu(); }, 2000);
}

function backToMainMenu() {
    isGameStarted = false;
    document.getElementById('hud').style.display = 'none';
    showScreen('main-menu');
}

function startGame(job) {
    isGameStarted = true; 
    stageFinished = false;
    player.setJob(job);
    player.x = 3 * TILE_SIZE; 
    player.y = 3 * TILE_SIZE;

    // Reset enemy ke spawn area A
    enemy.x = 19 * TILE_SIZE;
    enemy.y = 7 * TILE_SIZE;
    enemy.hp = enemy.maxHp; 
    enemy.alive = true; 
    projectiles = [];

    // Reset chests
    chests.forEach(c => c.opened = false);

    document.getElementById('job-val').innerText = job; 
    document.getElementById('hud').style.display = 'block';
    updateHUD(); 

    document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
    gameState = 'PLAYING';
    requestAnimationFrame(gameLoop);
}

// --- 5. KEYBOARD LISTENER ---
window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (gameState === 'PLAYING') openSettings();
        else if (gameState === 'SETTINGS-MENU') closeSettings();
        return;
    }

    const activeOverlay = document.querySelector('.overlay.active');
    if (activeOverlay && gameState.includes('MENU')) {
        const items = Array.from(activeOverlay.querySelectorAll('.menu-btn, .job-card'))
                           .filter(el => el.style.display !== 'none');

        if (items.length > 0) {
            let index = items.findIndex(el => el.classList.contains('selected'));
            if (index === -1) index = 0;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { 
                e.preventDefault();
                items[index].classList.remove('selected'); 
                index = (index + 1) % items.length; 
                items[index].classList.add('selected'); 
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { 
                e.preventDefault();
                items[index].classList.remove('selected'); 
                index = (index - 1 + items.length) % items.length; 
                items[index].classList.add('selected'); 
            } else if (e.key === 'Enter') { 
                e.preventDefault();
                items[index].click(); 
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
    let col = Math.floor(x / TILE_SIZE); 
    let row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= mapGrid.length || col < 0 || col >= mapGrid[0].length) return true;
    let tileId = mapGrid[row][col]; 
    // 1=wall, 2=water, 4=tree adalah solid. 0=grass, 3=earth bisa dilewati.
    return tileId === 1 || tileId === 2 || tileId === 4; 
}

function drawMap() {
    let startCol = Math.floor(camera.x / TILE_SIZE);
    let endCol = startCol + (canvas.width / TILE_SIZE) + 1;
    let startRow = Math.floor(camera.y / TILE_SIZE);
    let endRow = startRow + (canvas.height / TILE_SIZE) + 1;

    startCol = Math.max(0, startCol);
    startRow = Math.max(0, startRow);
    endCol = Math.min(mapGrid[0].length, endCol);
    endRow = Math.min(mapGrid.length, endRow);

    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            let img = assets.tiles[mapGrid[row][col]];
            if (img && img.complete) {
                ctx.drawImage(img, col * TILE_SIZE - camera.x, row * TILE_SIZE - camera.y, TILE_SIZE, TILE_SIZE);
            } else {
                // Fallback warna kalau asset belum load
                const colors = ['#2ecc71', '#7f8c8d', '#3498db', '#d35400', '#27ae60'];
                ctx.fillStyle = colors[mapGrid[row][col]] || '#000';
                ctx.fillRect(col * TILE_SIZE - camera.x, row * TILE_SIZE - camera.y, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

function drawChests() {
    chests.forEach(chest => {
        let cx = chest.x - camera.x;
        let cy = chest.y - camera.y;

        // Hanya draw kalau dalam viewport
        if (cx + TILE_SIZE < 0 || cx > canvas.width || cy + TILE_SIZE < 0 || cy > canvas.height) return;

        let img = assets.objects['chest'];
        if (img && img.complete && !chest.opened) {
            ctx.drawImage(img, cx, cy, TILE_SIZE, TILE_SIZE);
        } else {
            // Fallback: kotak kuning untuk chest tertutup, abu-abu untuk terbuka
            ctx.fillStyle = chest.opened ? '#7f8c8d' : '#f1c40f';
            ctx.fillRect(cx + 8, cy + 8, TILE_SIZE - 16, TILE_SIZE - 16);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx + 8, cy + 8, TILE_SIZE - 16, TILE_SIZE - 16);

            if (!chest.opened) {
                ctx.fillStyle = '#000';
                ctx.font = 'bold 12px Arial';
                ctx.fillText('?', cx + 20, cy + 32);
            }
        }
    });
}

function drawSpawnAreas() {
    spawnAreas.forEach(area => {
        let ax = area.x - camera.x;
        let ay = area.y - camera.y;

        // Culling
        if (ax + area.w < 0 || ax > canvas.width || ay + area.h < 0 || ay > canvas.height) return;

        // Area transparan ungu
        ctx.fillStyle = 'rgba(155, 89, 182, 0.25)';
        ctx.fillRect(ax, ay, area.w, area.h);
        ctx.strokeStyle = 'rgba(155, 89, 182, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(ax, ay, area.w, area.h);

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(area.label, ax + 10, ay + 20);
    });
}

function showFloatingDamage(x, y, damage, color) {
    floatingTexts.push({
        x: x,
        y: y,
        text: typeof damage === 'number' ? '-' + Math.floor(damage) : damage,
        color: color,
        life: 60
    });
}

function updateEnemy() {
    if (!enemy.alive) return;

    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
        enemy.x += (dx / distance) * enemy.speed;
        enemy.y += (dy / distance) * enemy.speed;
    }

    if (distance < 50) {
        if (enemy.attackCooldown <= 0) {
            let damage = enemy.damage;
            if (player.isDefending) damage *= 0.3;

            player.hp -= damage;
            if (player.hp < 0) {
                player.hp = 0;
                gameOver();
            }
            showFloatingDamage(player.x, player.y, damage, 'red');
            updateHUD();
            enemy.attackCooldown = 60;
        }
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown--;
}

function updatePlayer() {
    let isMoving = false; 
    let newX = player.x; 
    let newY = player.y;

    if (keys['ArrowUp'] || keys['KeyW']) { 
        newY -= player.speed; player.direction = 'up'; isMoving = true; 
    } else if (keys['ArrowDown'] || keys['KeyS']) { 
        newY += player.speed; player.direction = 'down'; isMoving = true; 
    }

    if (keys['ArrowLeft'] || keys['KeyA']) { 
        newX -= player.speed; player.direction = 'left'; isMoving = true; 
    } else if (keys['ArrowRight'] || keys['KeyD']) { 
        newX += player.speed; player.direction = 'right'; isMoving = true; 
    }

    // Collision detection dengan tembok & obstacle (4-point check)
    if (!isSolid(newX + 10, newY + 30) && 
        !isSolid(newX + player.width - 10, newY + 30) &&
        !isSolid(newX + 10, newY + player.height) && 
        !isSolid(newX + player.width - 10, newY + player.height)) {
        player.x = newX; 
        player.y = newY;
    }

    // Boundary check: player tidak boleh keluar map
    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x + player.width > MAP_WIDTH) player.x = MAP_WIDTH - player.width;
    if (player.y + player.height > MAP_HEIGHT) player.y = MAP_HEIGHT - player.height;

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

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i]; 
        p.x += p.vx; 
        p.y += p.vy;

        if (isSolid(p.x, p.y)) { 
            projectiles.splice(i, 1); 
            continue; 
        }

        if (enemy.alive && checkCollision(p.x, p.y, p.size, p.size, enemy)) {
            enemy.hp -= p.damage;
            showFloatingDamage(enemy.x, enemy.y, p.damage, '#3498db');

            if (enemy.hp <= 0) {
                enemy.hp = 0;
                enemy.alive = false;
                stageClear();
            }

            projectiles.splice(i, 1); 
            updateHUD();
        }
    }
}

function gameLoop() {
    if (gameState === 'PLAYING') {
        updatePlayer();
        updateProjectiles();
        updateEnemy();
        updateCamera();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap();
        drawSpawnAreas();
        drawChests();

        // Draw projectiles
        projectiles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x - camera.x, p.y - camera.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw floating texts
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            let text = floatingTexts[i];
            ctx.fillStyle = text.color;
            ctx.font = '20px Arial';
            ctx.fillText(text.text, text.x - camera.x, text.y - camera.y);
            text.y -= 1;
            text.life--;
            if (text.life <= 0) floatingTexts.splice(i, 1);
        }

        // Draw enemy
        if (enemy.alive) {
            ctx.fillStyle = 'red';
            ctx.fillRect(enemy.x - camera.x, enemy.y - camera.y, enemy.width, enemy.height);
            ctx.fillStyle = 'white'; 
            ctx.font = "bold 14px sans-serif";
            ctx.fillText("HP: " + Math.ceil(enemy.hp), enemy.x - camera.x, enemy.y - camera.y - 10);
        }

        // Draw player
        let img = assets.player[`${player.direction}_${player.frameNum}`];
        if (img && img.complete) {
            ctx.drawImage(img, player.x - camera.x, player.y - camera.y, player.width, player.height);
        }

        // Defend effect
        if (player.isDefending) {
            ctx.strokeStyle = '#3498db'; 
            ctx.lineWidth = 3;
            ctx.beginPath(); 
            ctx.arc(player.x + 24 - camera.x, player.y + 24 - camera.y, 30, 0, Math.PI * 2); 
            ctx.stroke();
        }

        // Attack effect
        if (player.isAttacking) {
            ctx.strokeStyle = player.slashColor; 
            ctx.lineWidth = 4;
            ctx.strokeRect(player.x - 10 - camera.x, player.y - 10 - camera.y, player.width + 20, player.height + 20);
        }

        requestAnimationFrame(gameLoop);
    }
}

// Jalankan engine loop pertama kali
gameLoop();