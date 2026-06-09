package game.engine;

import game.model.Enemy;
import game.model.Hero;
import game.system.SaveManager;

public class GameEngine {
    private Hero hero; 
    private final GameMap map;
    private final SaveManager saveManager; 
    private final BattleSystem battleSystem;

    public GameEngine() {
        this.hero = new Hero("Player 1");
        this.hero.job = "Warrior"; // Job bawaan agar tidak null
        Enemy firstEnemy = new Enemy("Goblin", 200, 10);
        this.battleSystem = new BattleSystem(this.hero, firstEnemy);
        this.map = new GameMap();
        this.saveManager = new SaveManager(); 
    }

    public Hero getHero() {
        return this.hero;
    }

    public void startGame() {}
    
    public void saveGame(int slotId) {
        if (this.saveManager != null && this.hero != null) {
            this.saveManager.save(this.hero, slotId); 
        }
    }
    
    public boolean loadGame(int slotId) {
        if (this.saveManager != null) {
            Hero loadedHero = this.saveManager.load(slotId);
            if (loadedHero != null) {
                this.hero = loadedHero;
                return true;
            }
        }
        return false;
    }

    public BattleSystem getBattleSystem() {
        return this.battleSystem;
    }

    public void processAction(String action) {
        battleSystem.processBattle(action);
    }

    public String getGameStateAsJson() {
        if (this.hero != null) {
            String playerJson = String.format(
                "\"player\": {\"hp\": %d, \"maxHp\": %d, \"x\": %d, \"y\": %d, \"job\": \"%s\"}",
                this.hero.getHp(), 
                this.hero.getMaxHp(), 
                this.hero.getX(), 
                this.hero.getY(),
                this.hero.job != null ? this.hero.job : "Warrior"
            );

            String enemyJson = "\"enemy\": {\"hp\": 200, \"maxHp\": 200, \"damage\": 10, \"speed\": 1.2}";
            if (this.battleSystem != null && this.battleSystem.getEnemy() != null) {
                Enemy e = this.battleSystem.getEnemy();
                enemyJson = String.format(
                    "\"enemy\": {\"hp\": %d, \"maxHp\": %d, \"damage\": %d, \"speed\": 1.2}",
                    e.getHp(), e.getHp(), e.getDamage()
                );
            }

            String inventoryJson = "\"inventory\": []";

            return "{" + playerJson + ", " + enemyJson + ", " + inventoryJson + "}";
        }
        return "{\"status\": \"empty\"}";
    }
}