package game.model;

public interface Attackable {
    void attack(Character target);

    int calculateDamage();
}
