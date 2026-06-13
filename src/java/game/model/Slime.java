package game.model;

public class Goblin extends Enemy {

    public Goblin(int x, int y) {
        super("Goblin", 80, 12, x, y);
        setDropItem(new Potion(20));
    }

    @Override
    public String getAIAction() {

        return "Goblin attacks aggressively!";
    }
}
