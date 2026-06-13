package game.model;

public class Slime extends Enemy {
    public Slime(int x, int y) {
        // Memakai skin "slime" agar terhubung dengan JS
        super("slime", 50, 10, x, y);
        setDropItem(new Potion(20));
    }

    @Override
    public String getAIAction() {
        return "Goblin/Slime attacks aggressively!";
    }
}