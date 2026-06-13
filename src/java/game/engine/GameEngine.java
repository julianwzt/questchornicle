package game.engine;

import game.model.Enemy;
import game.model.Hero;
import game.system.SaveManager;
import java.util.ArrayList;
import java.util.List;

public class GameEngine {
    private Hero hero; 
    private final GameMap map;
    private final SaveManager saveManager; 
    private final BattleSystem battleSystem;
    
    private List<Enemy> activeEnemies;
    private List<String> activeChests;

    public GameEngine() {
        this.hero = new Hero("Player 1");
        this.map = new GameMap();
        this.saveManager = new SaveManager(); 
        this.activeEnemies = new ArrayList<>();
        this.activeChests = new ArrayList<>();
        this.battleSystem = new BattleSystem(this.hero, new Enemy("Dummy", 100, 10, 0, 0));
    }

    // [FITUR BARU] Hanya tugas sebar musuh dan peti
    public void spawnEntities() {
        activeEnemies.clear();
        activeChests.clear();
        
        activeEnemies.add(new Enemy("slime", 50, 10, 720, 480));   
        activeEnemies.add(new Enemy("orc", 80, 15, 1680, 720));    
        activeEnemies.add(new Enemy("bat", 40, 5, 480, 1440));     
        activeEnemies.add(new Enemy("slime", 50, 10, 1680, 1920)); 
        activeEnemies.add(new Enemy("orc", 80, 15, 1200, 1920));   
        
        activeChests.add("{\"x\": 384, \"y\": 960, \"item\": \"potion\", \"opened\": false}");
        activeChests.add("{\"x\": 1920, \"y\": 480, \"item\": \"sword\", \"opened\": false}");
        activeChests.add("{\"x\": 960, \"y\": 960, \"item\": \"potion\", \"opened\": false}");
    }

    public boolean openChest(int chestIndex) {
        if (chestIndex >= 0 && chestIndex < activeChests.size()) {
            String chestData = activeChests.get(chestIndex);
            if (!chestData.contains("\"opened\": true")) {
                activeChests.set(chestIndex, chestData.replace("\"opened\": false", "\"opened\": true"));
                return true;
            }
        }
        return false;
    }

    public Hero getHero() { return this.hero; }
    public GameMap getGameMap() { return this.map; }
    public List<Enemy> getActiveEnemies() { return this.activeEnemies; }
    public BattleSystem getBattleSystem() { return this.battleSystem; }

    public void saveGame(int slotId) {
        if (this.saveManager != null && this.hero != null) this.saveManager.save(this.hero, slotId); 
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

    public String getGameStateAsJson() {
        if (this.hero == null) return "{\"status\": \"empty\"}";

        StringBuilder json = new StringBuilder();
        json.append("{");
        
        json.append(String.format(
            "\"player\": {\"hp\": %d, \"maxHp\": %d, \"mp\": %d, \"maxMp\": %d, \"level\": %d, \"exp\": %d, \"maxExp\": %d, \"x\": %d, \"y\": %d, \"job\": \"%s\"},",
            this.hero.getHp(), this.hero.getMaxHp(), this.hero.getMp(), this.hero.getMaxMp(),
            this.hero.getLevel(), this.hero.getExp(), this.hero.getMaxExp(),
            this.hero.getX(), this.hero.getY(),
            (this.hero.job != null ? this.hero.job : "Warrior")
        ));

        json.append("\"enemies\": [");
        for (int i = 0; i < activeEnemies.size(); i++) {
            Enemy e = activeEnemies.get(i);
            json.append(String.format(
                "{\"skin\": \"%s\", \"hp\": %d, \"maxHp\": %d, \"damage\": %d, \"x\": %d, \"y\": %d, \"alive\": %b, \"state\": \"IDLE\"}",
                e.getNama(), e.getHp(), e.getMaxHp(), e.getDamage(), e.getX(), e.getY(), (e.getHp() > 0)
            ));
            if (i < activeEnemies.size() - 1) json.append(",");
        }
        json.append("],");

        json.append("\"chests\": [");
        for (int i = 0; i < activeChests.size(); i++) {
            json.append(activeChests.get(i));
            if (i < activeChests.size() - 1) json.append(",");
        }
        json.append("],");
        
        json.append("\"inventory\": [{\"name\": \"Red Potion\", \"type\": \"potion\", \"count\": " + (hero.getHp() < 0 ? 0 : 3) + "}]");

        json.append("}");
        return json.toString();
    }
}