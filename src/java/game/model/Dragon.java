/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package game.model;

/**
 *
 * @author HP
 */
public class Dragon extends Enemy {

    public Dragon(int x, int y) {
        super("Dragon", 400, 40, x, y);
        setDropItem(
            new Item() {
                @Override
                public void use(Character target) {

                    target.heal(100);
                }
                @Override
                public String getEffect() {
                    return "Restore 100 HP";
                }
            }
        );
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
