/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package game.model;

/**
 *
 * @author GU605MV
 */
public abstract class Item {
    protected String id;
    protected String name;
    protected String rarity;

    public abstract void use(Character target);
    public abstract String getEffect();
}
