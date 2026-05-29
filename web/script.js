const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- 1. ASSET MANAGER ---
const assets = { tiles: {}, player: {}, objects: {} };
function loadAsset(category, name, src) { const img = new Image(); img.src = src; assets[category][name] = img; }

loadAsset('tiles', '0', 'res/tiles/grass.png'); loadAsset('tiles', '1', 'res/tiles/wall.png');
loadAsset('tiles', '2', 'res/tiles/water.png'); loadAsset('tiles', '3', 'res/tiles/earth.png');
loadAsset('tiles', '4', 'res/tiles/tree.png');

['down_1', 'down_2', 'up_1', 'up_2', 'left_1', 'left_2', 'right_1', 'right_2'].forEach(dir => {
    loadAsset('player', dir, `res/player/boy_${dir}.png`);
});

loadAsset('objects', 'sword', 'res/objects/sword_normal.png');
loadAsset('objects', 'potion', 'res/objects/potion_red.png');

// --- 2. TILEMAP SYSTEM ---
const TILE_SIZE = 48; 
const mapGrid = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,4,4,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,2,2,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,2,2,2,0,1],
    [1,4,4,0,0,0,0,0,0,0,0,0,2,2,0,1],
    [1,4,4,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,3,3,3,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,3,3,3,0,0,0,4,4,1],
    [1,0,2,2,2,0,0,0,0,0,0,0,0,4,4,1],
    [1,0,0,0,2,2,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// --- 3. ENTITAS GAME ---
let gameState = 'MAIN-MENU'; 
let isGameStarted = false; 
let projectiles = []; 
const floatingTexts = [];
let stageFinished = false;
let enemy = {
    x: 500,
    y: 300,
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
    x: 100, y: 100, 
    speed: 2.5, // DITURUNKAN AGAR TIDAK TERLALU CEPAT
    width: TILE_SIZE, height: TILE_SIZE,
    job: '', hp: 100, maxHp: 100, isAttacking: false,
    direction: 'down', frameCounter: 0, frameNum: 1, 
    baseAtk: 10, baseDef: 5, slashColor: '#f1c40f',
    resName: '', resVal: 0, resMax: 100,
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

    if (
        enemy.alive &&
        checkCollisionBox(atkBox, enemy)
    ) {

        enemy.hp -= damage;

        showFloatingDamage(
            enemy.x,
            enemy.y,
            damage,
            '#f1c40f'
        );

        if (this.job === 'Warrior') {

            this.resVal = Math.min(
                this.resMax,
                this.resVal + 15
            );
        }

        if (enemy.hp <= 0) {

            enemy.hp = 0;

            enemy.alive = false;
                stageClear();
        }
    }

    updateHUD();

    setTimeout(() => {

        this.isAttacking = false;

    }, 150);
}
};

function spawnProjectile(x, y, dir, color, damage) {
    let vx = 0, vy = 0;
    if (dir === 'up') vy = -8; else if (dir === 'down') vy = 8;
    else if (dir === 'left') vx = -8; else if (dir === 'right') vx = 8;
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

// Fungsi Pemicu Game Over
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
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
    ctx.fillStyle = 'yellow';
    ctx.font = 'bold 50px Arial';
    ctx.fillText(
        'STAGE CLEAR!',
        canvas.width / 2 - 180,
        canvas.height / 2
    );
    setTimeout(() => {
        backToMainMenu();
    }, 2000);
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
    player.x = 100; player.y = 100; // Reset posisi
    enemy.hp = enemy.maxHp; enemy.alive = true; projectiles = [];
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
    let col = Math.floor(x / TILE_SIZE); let row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= mapGrid.length || col < 0 || col >= mapGrid[0].length) return true;
    let tileId = mapGrid[row][col]; return tileId === 1 || tileId === 2 || tileId === 4; 
}

function drawMap() {
    for (let row = 0; row < mapGrid.length; row++) {
        for (let col = 0; col < mapGrid[row].length; col++) {
            let img = assets.tiles[mapGrid[row][col]];
            if (img && img.complete) ctx.drawImage(img, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

function showFloatingDamage(x, y, damage, color) {

    floatingTexts.push({

        x: x,
        y: y,

        text: '-' + Math.floor(damage),

        color: color,

        life: 60
    });
}

function updateEnemy() {

    if (!enemy.alive) return;

    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    // enemy chase
    if (distance > 5) {

        enemy.x += (dx / distance) * enemy.speed;

        enemy.y += (dy / distance) * enemy.speed;
    }

    // enemy attack
    if (distance < 50) {

        if (enemy.attackCooldown <= 0) {

            let damage = enemy.damage;

            if (player.isDefending) {

                damage *= 0.3;
            }

            player.hp -= damage;

            if (player.hp < 0) {

                player.hp = 0;
                gameOver();
            }

            showFloatingDamage(
                player.x,
                player.y,
                damage,
                'red'
            );

            updateHUD();

            enemy.attackCooldown = 60;
        }
    }

    if (enemy.attackCooldown > 0) {

        enemy.attackCooldown--;
    }
}

function updatePlayer() {
    let isMoving = false; let newX = player.x; let newY = player.y;
    if (keys['ArrowUp'] || keys['KeyW']) { newY -= player.speed; player.direction = 'up'; isMoving = true; }
    else if (keys['ArrowDown'] || keys['KeyS']) { newY += player.speed; player.direction = 'down'; isMoving = true; }
    else if (keys['ArrowLeft'] || keys['KeyA']) { newX -= player.speed; player.direction = 'left'; isMoving = true; }
    else if (keys['ArrowRight'] || keys['KeyD']) { newX += player.speed; player.direction = 'right'; isMoving = true; }

    if (!isSolid(newX + 10, newY + 30) && !isSolid(newX + player.width - 10, newY + 30) &&
        !isSolid(newX + 10, newY + player.height) && !isSolid(newX + player.width - 10, newY + player.height)) {
        player.x = newX; player.y = newY;
    }
    if (isMoving) { player.frameCounter++; if (player.frameCounter > 10) { player.frameNum = player.frameNum === 1 ? 2 : 1; player.frameCounter = 0; } } 
    else { player.frameNum = 1; }
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i]; p.x += p.vx; p.y += p.vy;
        if (isSolid(p.x, p.y)) { projectiles.splice(i, 1); continue; }
        if (enemy.alive && checkCollision(p.x, p.y, p.size, p.size, enemy)) {
            enemy.hp -= p.damage;
            showFloatingDamage(
                enemy.x,
                enemy.y,
                p.damage,
                '#3498db'
            );
            if (enemy.hp <= 0) {
                enemy.hp = 0;
                enemy.alive = false;
                stageClear();
};
            projectiles.splice(i, 1); updateHUD();
        }
    }
}

function gameLoop() {
    if (gameState === 'PLAYING') {
        updatePlayer();
        updateProjectiles();
        updateEnemy();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap();
        
      projectiles.forEach(p => {

    ctx.fillStyle = p.color;

    ctx.beginPath();

    ctx.arc(
        p.x,
        p.y,
        p.size,
        0,
        Math.PI * 2
    );

    ctx.fill();
});

floatingTexts.forEach((text, index) => {
    ctx.fillStyle = text.color;
    ctx.font = '20px Arial';
    ctx.fillText(
        text.text,
        text.x,
        text.y
        );

        text.y -= 1;

         text.life--;

            if (text.life <= 0) {

            floatingTexts.splice(index, 1);
             }
        });

        if (enemy.alive) {
            ctx.fillStyle = 'red';

            ctx.fillRect(
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
        );
            ctx.fillStyle = 'white'; ctx.font = "bold 14px sans-serif";
            ctx.fillText("HP: " + Math.ceil(enemy.hp), enemy.x, enemy.y - 10);
        }

        let img = assets.player[`${player.direction}_${player.frameNum}`];
        if (img && img.complete) ctx.drawImage(img, player.x, player.y, player.width, player.height);
        
        if (player.isDefending) {
            ctx.strokeStyle = '#3498db'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(player.x + 24, player.y + 24, 30, 0, Math.PI * 2); ctx.stroke();
        }
        if (player.isAttacking) {
            ctx.strokeStyle = player.slashColor; ctx.lineWidth = 4;
            ctx.strokeRect(player.x - 10, player.y - 10, player.width + 20, player.height + 20);
        }
        
        requestAnimationFrame(gameLoop);
    }
}

// Jalankan engine loop pertama kali
gameLoop();