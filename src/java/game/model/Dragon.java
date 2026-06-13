package game.model;

public class Dragon extends Enemy {

    public Dragon(int x, int y) {
        super("Dragon", 400, 40, x, y);
        setDropItem(new Potion(100));
    }

    @Override
    public int calculateDamage() {

        return super.calculateDamage() + 20;
    }

    @Override
    public String getAIAction() {

        return "Dragon uses FIRE BREATH!";
    }
}
