package game.model;

public class Potion extends Item {
    private final int healAmount;
    
    public Potion(int healAmount) {
        this.healAmount = healAmount;
    }

    @Override
    public void use(Character target) {
        int newHp = target.getHp() + healAmount;
        if (newHp > target.getMaxHp()) {
            newHp = target.getMaxHp();
        }
        target.setHp(newHp);
    }

    @Override
    public String getEffect() {
        return "Restore " + healAmount + " HP";
    }
}