/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package game.model;

/**
 *
 * @author HP
 */
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
