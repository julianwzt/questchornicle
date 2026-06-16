package game.model;

public class Boss extends Enemy {

    public Boss(int x, int y) {
        super("Skeleton Boss", 400, 40, x, y);
        setDropItem(new Potion(100));
        setDropExp(500);
    }

    @Override
    public boolean isBoss() {
        return true;
    }

    @Override
    public int calculateDamage() {
        return super.calculateDamage() + 20;
    }

    @Override
    public String getAIAction() {
        return "Skeleton Lord casts a deadly attack!";
    }
}