package game.engine;

import game.model.Enemy;
import game.model.Hero;
import game.system.SaveManager;

public class GameEngine {
    private Hero hero; 
    private final GameMap map;
    private final SaveManager saveManager; // Nama variabel sudah diseragamkan
    private final BattleSystem battleSystem;

    public GameEngine() {
        this.hero = new Hero("Player 1");
        this.hero.job = "Warrior"; // Nilai default agar tidak error
        Enemy firstEnemy = new Enemy("Goblin", 50, 5);
        this.battleSystem = new BattleSystem(this.hero, firstEnemy);
        this.map = new GameMap();
        
        // Inisialisasi Database
        this.saveManager = new SaveManager(); 
    }

    public Hero getHero() {
        return this.hero;
    }

    public void startGame() {}
    
    // Fungsi Save
    public void saveGame(int slotId) {
        if (this.saveManager != null && this.hero != null) {
            this.saveManager.save(this.hero, slotId); 
        }
    }
    
    // Fungsi Load
    public boolean loadGame(int slotId) {
        if (this.saveManager != null) {
            Hero loadedHero = this.saveManager.load(slotId);
            if (loadedHero != null) {
                this.hero = loadedHero;
                return true; // Berhasil menemukan data di database
            }
        }
        return false; // Slot kosong atau data tidak ditemukan
    }

    public BattleSystem getBattleSystem() {
        return this.battleSystem;
    }

    public void processAction(String action) {
        battleSystem.processBattle(action);
    }

    public String getGameStateAsJson() {
        if (this.hero != null) {
            // 1. Ambil Data Player (Fix Error Null menggunakan ternary operator)
            String playerJson = String.format(
                "\"player\": {\"hp\": %d, \"maxHp\": %d, \"x\": %d, \"y\": %d, \"job\": \"%s\"}",
                this.hero.getHp(), 
                this.hero.getMaxHp(), 
                this.hero.getX(), 
                this.hero.getY(),
                this.hero.job != null ? this.hero.job : "Warrior"
            );

            // 2. Ambil Data Enemy (Menghubungkan class Enemy Java ke JSP)
            // Jika suatu saat kamu membuat boss dengan damage 50, JS akan otomatis ikut
            String enemyJson = "\"enemy\": {\"hp\": 200, \"maxHp\": 200, \"damage\": 10, \"speed\": 1.2}";
            if (this.battleSystem != null && this.battleSystem.getEnemy() != null) {
                Enemy e = this.battleSystem.getEnemy();
                enemyJson = String.format(
                    "\"enemy\": {\"hp\": %d, \"maxHp\": %d, \"damage\": %d, \"speed\": 1.2}",
                    e.getHp(), e.getHp(), e.getDamage()
                );
            }

            // 3. Ambil Data Inventory (Format Array List untuk JS)
            // Saat ini kita kirim format array default agar tidak Null di Frontend
            String inventoryJson = "\"inventory\": []";

            // Gabungkan ketiganya agar Frontend (JSP/JS) bisa membaca semuanya
            return "{" + playerJson + ", " + enemyJson + ", " + inventoryJson + "}";
        }
        
        // 6. Fix Error Null: Jika tidak ada data
        return "{\"status\": \"empty\"}";
    }
}