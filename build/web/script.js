const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'MAIN-MENU';
let isGameStarted = false; 
const keys = {};

// ==========================================
// 1. PENERAPAN OOP: ITEM & INVENTORY SYSTEM
// ==========================================

class Item {
    constructor(id, name, type, color) {
        this.id = id; 
        this.name = name; 
        this.type = type; 
        this.color = color;
    }
    // Method dasar (Polymorphism)
    use(target) { console.log("Digunakan!"); }
}

class Weapon extends Item {
    constructor(id, name, damage) {
        super(id, name, 'Weapon', '#e67e22'); // Warna Oranye
        this.damage = damage;
    }
    use(target) {
        target.equipWeapon(this);
    }
}

class Armor extends Item {
    constructor(id, name, defense) {
        super(id, name, 'Armor', '#95a5a6'); // Warna Abu-abu
        this.defense = defense;
    }
    use(target) {
        target.equipArmor(this);
    }
}

class Consumable extends Item {
    constructor(id, name, healValue) {
        super(id, name, 'Consumable', '#3498db'); // Warna Biru
        this.healValue = healValue;
    }
    use(target) {
        target.heal(this.healValue);
    }
}

class Inventory {
    constructor(maxCap) {
        this.items = [];
        this.maxCap = maxCap;
    }
    addItem(item) {
        if (this.items.length < this.maxCap) {
            this.items.push(item);
            return true;
        }
        return false; // Penuh
    }
    removeItem(index) {
        this.items.splice(index, 1);
    }
}

// ==========================================
// 2. ENTITAS GAME & STATS
// ==========================================

let player = { 
    x: 400, y: 300, size: 40, color: '#2ecc71', speed: 5, job: '', 
    hp: 100, maxHp: 100, isAttacking: false,
    
    // Base Stats
    baseAtk: 15, baseDef: 5,
    weapon: null, armor: null,
    inventory: new Inventory(8), // Kapasitas 8 slot
    
    // Getter dinamis (Menghitung stat dari equip)
    get atk() { return this.baseAtk + (this.weapon ? this.weapon.damage : 0); },
    get def() { return this.baseDef + (this.armor ? this.armor.defense : 0); },
    
    // Behaviors
    equipWeapon(wpn) { this.weapon = wpn; },
    equipArmor(arm) { this.armor = arm; },
    heal(amount) { 
        this.hp = Math.min(this.maxHp, this.hp + amount); 
        updateHUD(); 
    }
};

let enemy = { 
    x: 200, y: 200, size: 50, color: '#e74c3c', 
    hp: 150, maxHp: 150, atk: 20, alive: true 
};

// Item yang tercecer di Map untuk diambil
let droppedItems = [];

// ==========================================
// 3. KONTROL & LISTENER
// ==========================================

window.addEventListener('keydown', e => {
    // Tombol I untuk membuka Inventory
    if (e.key === 'i' || e.key === 'I') {
        if (gameState === 'PLAYING') openInventory();
        else if (gameState === 'INVENTORY-MENU') closeInventory();
        return;
    }

    if (e.key === 'Escape') {
        if (gameState === 'PLAYING') openSettings();
        else if (gameState === 'SETTINGS-MENU') closeSettings();
        else if (gameState === 'INVENTORY-MENU') closeInventory();
        return;
    }

    const activeOverlay = document.querySelector('.overlay.active');
    if (activeOverlay && gameState.includes('MENU') && gameState !== 'INVENTORY-MENU') {
        const items = Array.from(activeOverlay.querySelectorAll('.menu-btn, .job-card')).filter(el => el.style.display !== 'none');
        if (items.length > 0) {
            let index = items.findIndex(el => el.classList.contains('selected'));
            if (index === -1) index = 0;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                items[index].classList.remove('selected');
                index = (index + 1) % items.length;
                items[index].classList.add('selected');
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                items[index].classList.remove('selected');
                index = (index - 1 + items.length) % items.length;
                items[index].classList.add('selected');
            } else if (e.key === 'Enter') {
                items[index].click();
            }
        }
    }

    keys[e.code] = true;
    if (e.code === 'Space' && gameState === 'PLAYING') {
        e.preventDefault(); 
        attack();
    }
});

window.addEventListener('keyup', e => keys[e.code] = false);

// ==========================================
// 4. UI & STATE MANAGEMENT
// ==========================================

function showScreen(id) {
    document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    gameState = id.toUpperCase();
}

function startGame(job) {
    isGameStarted = true;
    player.job = job;
    player.hp = player.maxHp;
    enemy.hp = enemy.maxHp;
    enemy.alive = true;
    
    // Reset Inventory dan Spawn Item di Map
    player.inventory.items = [];
    player.weapon = null;
    player.armor = null;
    droppedItems = [
        { obj: new Weapon('w1', 'Iron Sword', 15), x: 600, y: 150, size: 20 },
        { obj: new Armor('a1', 'Steel Shield', 10), x: 100, y: 450, size: 20 },
        { obj: new Consumable('c1', 'Health Potion', 40), x: 400, y: 500, size: 20 }
    ];
    
    document.getElementById('job-val').innerText = job;
    document.getElementById('hud').style.display = 'block';
    updateHUD();
    
    document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
    gameState = 'PLAYING';
    requestAnimationFrame(gameLoop);
}

function updateHUD() {
    document.getElementById('hp-val').innerText = Math.ceil(player.hp);
    document.getElementById('hp-fill').style.width = ((player.hp / player.maxHp) * 100) + '%';
}

function openSettings() { showScreen('settings-menu'); }
function closeSettings() { resumeGame(); }
function backToMainMenu() { isGameStarted = false; document.getElementById('hud').style.display = 'none'; showScreen('main-menu'); }

// UI Inventory Handler
function openInventory() {
    updateInventoryUI();
    showScreen('inventory-menu');
}

function closeInventory() {
    document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
    gameState = 'PLAYING';
    requestAnimationFrame(gameLoop);
}

function updateInventoryUI() {
    document.getElementById('stat-atk').innerText = player.atk;
    document.getElementById('stat-def').innerText = player.def;
    document.getElementById('eq-wpn').innerText = player.weapon ? player.weapon.name : 'None';
    document.getElementById('eq-arm').innerText = player.armor ? player.armor.name : 'None';

    const grid = document.getElementById('inv-grid');
    grid.innerHTML = '';
    
    player.inventory.items.forEach((item, index) => {
        let div = document.createElement('div');
        div.style.background = item.color;
        div.style.padding = '10px 5px';
        div.style.textAlign = 'center';
        div.style.borderRadius = '5px';
        div.style.cursor = 'pointer';
        div.style.fontSize = '12px';
        div.style.fontWeight = 'bold';
        div.style.color = '#fff';
        div.style.border = '2px solid rgba(0,0,0,0.3)';
        div.innerText = item.name;
        
        // Event saat item di klik di inventory
        div.onclick = () => {
            item.use(player); // Polimorfisme dipanggil di sini
            if (item.type === 'Consumable') {
                player.inventory.removeItem(index); // Consumable hancur setelah dipakai
            }
            updateInventoryUI(); // Refresh UI
        };
        grid.appendChild(div);
    });
}

// ==========================================
// 5. ENGINE & BATTLE LOGIC
// ==========================================

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.size && rect1.x + rect1.size > rect2.x &&
           rect1.y < rect2.y + rect2.size && rect1.y + rect1.size > rect2.y;
}

function attack() {
    if (player.isAttacking) return;
    player.isAttacking = true;
    
    let attackBox = { x: player.x - 20, y: player.y - 20, size: player.size + 40 };

    if (enemy.alive && checkCollision(attackBox, enemy)) {
        // Kalkulasi Damage berdasarkan Stat ATK Player
        enemy.hp -= player.atk;
        if (enemy.hp <= 0) enemy.alive = false;
        updateHUD();
    }

    setTimeout(() => { player.isAttacking = false; }, 150);
}

function gameLoop() {
    if (gameState === 'PLAYING') {
        // Gerak
        if ((keys['ArrowUp'] || keys['KeyW']) && player.y > 0) player.y -= player.speed;
        if ((keys['ArrowDown'] || keys['KeyS']) && player.y < canvas.height - player.size) player.y += player.speed;
        if ((keys['ArrowLeft'] || keys['KeyA']) && player.x > 0) player.x -= player.speed;
        if ((keys['ArrowRight'] || keys['KeyD']) && player.x < canvas.width - player.size) player.x += player.speed;

        // Player menerima Hit
        if (enemy.alive && checkCollision(player, enemy)) {
            // Kalkulasi Defense: Mengurangi damage musuh
            let dmgTaken = Math.max(0.1, (enemy.atk * 0.05) - (player.def * 0.01));
            player.hp -= dmgTaken;
            if (player.hp < 0) player.hp = 0;
            updateHUD();
        }

        // Cek Interaksi dengan Item Jatuh di Map
        for (let i = droppedItems.length - 1; i >= 0; i--) {
            let drop = droppedItems[i];
            if (checkCollision(player, drop)) {
                if (player.inventory.addItem(drop.obj)) {
                    droppedItems.splice(i, 1); // Hilang dari map jika berhasil masuk inventory
                }
            }
        }

        // RENDER KANVAS
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Render Dropped Items
        droppedItems.forEach(drop => {
            ctx.fillStyle = drop.obj.color;
            ctx.fillRect(drop.x, drop.y, drop.size, drop.size);
            ctx.fillStyle = 'white';
            ctx.font = '10px sans-serif';
            ctx.fillText(drop.obj.name, drop.x - 10, drop.y - 5);
        });

        // Render Enemy
        if (enemy.alive) {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
            ctx.fillStyle = 'white';
            ctx.font = "14px sans-serif";
            ctx.fillText("HP: " + Math.ceil(enemy.hp), enemy.x, enemy.y - 10);
        }

        // Render Player
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);
        
        if (player.isAttacking) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.strokeRect(player.x - 10, player.y - 10, player.size + 20, player.size + 20);
        }
        
        requestAnimationFrame(gameLoop);
    }
}