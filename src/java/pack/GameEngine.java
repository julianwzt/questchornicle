/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pack;

// GameEngine.java
public class GameEngine {
    private final Hero hero;
    private final GameMap map;
    private final SaveManager save;
    private final BattleSystem battleSystem;

    public GameEngine() {
        // Inisialisasi semua sistem saat engine dijalankan
        this.hero = new Hero("Player 1");
        Enemy firstEnemy = new Enemy("Goblin", 50, 5);
        this.battleSystem = new BattleSystem(this.hero, firstEnemy);
        this.map = new GameMap();
        this.save = new SaveManager();
    }

    public void startGame() {}
    public void saveGame() {}
    public void loadGame() {}

    // Method ini sekarang sudah mengembalikan objek dengan benar
    public BattleSystem getBattleSystem() {
        return this.battleSystem;
    }

    // Method pembungkus jika Servlet ingin memanggil aksi
    public void processAction(String action) {
        battleSystem.processBattle(action);
    }

    // PERBAIKAN: Tidak menggunakan static, tipe data String
    public String getGameStateAsJson() {
        return "{" +
            "\"heroHP\": " + hero.getHp() + "," +
            "\"heroMaxHP\": " + hero.getMaxHp() + "," +
            "\"level\": " + hero.getLevel() + "," +
            "\"enemyHP\": " + battleSystem.getEnemy().getHp() + "," +
            "\"status\": \"In Battle\"" +
        "}";
    }
}