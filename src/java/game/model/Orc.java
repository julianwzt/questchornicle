package game.model;

public class Orc extends Enemy {
    public Orc(int x, int y) {
        super("orc", 150, 20, x, y);
        setDropItem(new Potion(50)); 
    }

    @Override
    public String getAIAction() {
        return "Orc charges toward the player!";
    }
}