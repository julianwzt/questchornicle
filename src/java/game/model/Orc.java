/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package game.model;

/**
 *
 * @author HP
 */
public class Orc extends Enemy {
    public Orc(int x, int y) {
        super("Orc", 150, 20, x, y);
        setDropItem(new Potion(50));
    }

    @Override
    public String getAIAction() {

        return "Orc charges toward the player!";
    }
}
