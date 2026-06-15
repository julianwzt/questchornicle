package game.engine;

import game.model.Boss;
import game.model.Enemy;
import game.model.Hero;
import game.model.Orc;
import game.model.Slime;
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

    public void spawnEntities() {
        activeEnemies.clear();
        activeChests.clear();

        activeEnemies.add(new Slime(720, 480));
        activeEnemies.add(new Orc(1680, 720));
        activeEnemies.add(new Enemy("bat", 40, 5, 480, 1440));
        activeEnemies.add(new Slime(1680, 1920));
        activeEnemies.add(new Orc(1200, 1920));
        activeEnemies.add(new Orc(500, 500));
        activeEnemies.add(new Enemy("bat", 60, 15, 800, 300));
        activeChests.add("{\"x\": 336, \"y\": 192, \"item\": \"sword\", \"opened\": false}");
        activeChests.add("{\"x\": 432, \"y\": 192, \"item\": \"shield\", \"opened\": false}");
        activeChests.add("{\"x\": 2000, \"y\": 630, \"item\": \"key\", \"opened\": false}");
        activeChests.add("{\"x\": 384, \"y\": 960, \"item\": \"potion\", \"opened\": false}");
    }

    public void spawnDungeonEntities() {
        activeEnemies.clear();
        activeChests.clear();

        activeEnemies.add(new Boss(800, 500)); // Boss muncul di Dungeon
        activeChests.add("{\"x\": 960, \"y\": 960, \"item\": \"potion\", \"opened\": false}");
        activeChests.add("{\"x\": 870, \"y\": 114, \"item\": \"clue\", \"opened\": false}");
    }

    public boolean openChest(int chestIndex) {
        if (chestIndex >= 0 && chestIndex < activeChests.size()) {
            String chestData = activeChests.get(chestIndex);
            if (!chestData.contains("\"opened\": true")) {
                activeChests.set(chestIndex, chestData.replace("\"opened\": false", "\"opened\": true"));

                // --- SERVER AUTHORITY: Menambah Loot ---
                if (chestData.contains("\"item\": \"potion\"")) {
                    hero.setPotionCount(hero.getPotionCount() + 1);
                } else if (chestData.contains("\"item\": \"sword\"") && !hero.isHasSword()) {
                    hero.setHasSword(true);
                    hero.setAtk(hero.getAtk() + 15); // Tambah ATK
                } else if (chestData.contains("\"item\": \"shield\"") && !hero.isHasShield()) {
                    hero.setHasShield(true);
                    hero.setDef(hero.getDef() + 10); // Tambah DEF
                } else if (chestData.contains("\"item\": \"key\"")) {
                    hero.setKeyCount(hero.getKeyCount() + 1); // Dapat Kunci
                } else if (chestData.contains("\"item\": \"clue\"")) {
                    // Petunjuk puzzle, tidak mengubah stat backend
                }

                return true;
            }
        }
        return false;
    }

    public Hero getHero() {
        return this.hero;
    }

    public GameMap getGameMap() {
        return this.map;
    }

    public List<Enemy> getActiveEnemies() {
        return this.activeEnemies;
    }

    public BattleSystem getBattleSystem() {
        return this.battleSystem;
    }

    public void saveGame(int slotId) {
        if (this.saveManager != null && this.hero != null)
            this.saveManager.save(this.hero, slotId);
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
        if (this.hero == null)
            return "{\"status\": \"empty\"}";

        StringBuilder json = new StringBuilder();
        json.append("{");

        json.append(String.format(
                "\"player\": {\"hp\": %d, \"maxHp\": %d, \"mp\": %d, \"maxMp\": %d, \"level\": %d, \"exp\": %d, \"maxExp\": %d, \"x\": %d, \"y\": %d, \"job\": \"%s\", \"atk\": %d, \"def\": %d, \"keys\": %d},",
                this.hero.getHp(), this.hero.getMaxHp(), this.hero.getMp(), this.hero.getMaxMp(),
                this.hero.getLevel(), this.hero.getExp(), this.hero.getMaxExp(),
                this.hero.getX(), this.hero.getY(),
                (this.hero.job != null ? this.hero.job : "Warrior"),
                this.hero.getAtk(), this.hero.getDef(), this.hero.getKeyCount()));

        json.append("\"enemies\": [");
        for (int i = 0; i < activeEnemies.size(); i++) {
            Enemy e = activeEnemies.get(i);
            String skinName = e.isBoss() ? "skeletonlord" : e.getNama().toLowerCase();
            json.append(String.format(
                    "{\"skin\": \"%s\", \"hp\": %d, \"maxHp\": %d, \"damage\": %d, \"x\": %d, \"y\": %d, \"alive\": %b, \"state\": \"IDLE\", \"isBoss\": %b}",
                    skinName, e.getHp(), e.getMaxHp(), e.getDamage(), e.getX(), e.getY(), (e.getHp() > 0), e.isBoss()));
            if (i < activeEnemies.size() - 1)
                json.append(",");
        }
        json.append("],");

        json.append("\"chests\": [");
        for (int i = 0; i < activeChests.size(); i++) {
            json.append(activeChests.get(i));
            if (i < activeChests.size() - 1)
                json.append(",");
        }
        json.append("],");

        // --- Menyusun Inventory ---
        List<String> invItems = new ArrayList<>();
        if (hero.getPotionCount() > 0) {
            invItems.add("{\"name\": \"Red Potion\", \"type\": \"potion\", \"count\": " + hero.getPotionCount() + "}");
        }
        if (hero.getKeyCount() > 0) {
            invItems.add("{\"name\": \"Dungeon Key\", \"type\": \"key\", \"count\": " + hero.getKeyCount() + "}");
        }
        if (hero.isHasSword()) {
            invItems.add("{\"name\": \"Iron Sword\", \"type\": \"sword\", \"count\": 1, \"equipped\": true}");
        }
        if (hero.isHasShield()) {
            invItems.add("{\"name\": \"Wooden Shield\", \"type\": \"shield\", \"count\": 1, \"equipped\": true}");
        }

        json.append("\"inventory\": [");
        json.append(String.join(",", invItems));
        json.append("]");

        json.append("}");
        return json.toString();
    }
}