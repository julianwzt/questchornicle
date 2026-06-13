package game.model;

public class Orc extends Enemy {
    public Orc(int x, int y) {
        // Memakai skin "orc" agar JS bisa memuat orc_1.png
        super("orc", 150, 20, x, y);
        // OOP: Orc memiliki drop rate potion spesifik
        setDropItem(new Potion(50)); 
    }

    @Override
    public String getAIAction() {
        return "Orc charges toward the player!";
    }
}