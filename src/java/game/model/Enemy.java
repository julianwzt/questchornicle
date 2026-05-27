/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package game.model;

/**
 *
 * @author GU605MV
 */
public class Enemy extends Character {
    private int dropExp;
    private Item dropItem;

    public Enemy(String nama, int hp, int atk) {
        this.nama = nama;
        this.hp = hp;
        this.maxHp = hp;
        this.atk = atk;
    }

    public Item dropLoot() { return dropItem; }
    public String getAIAction() { return "attack"; }
    
    public void attack(Character target) { target.takeDamage(calculateDamage()); }
    @Override public int calculateDamage() { return this.atk; }
    @Override public void gainExp(int amount) { /* Musuh tidak gainExp */ }
    @Override public void levelUp() { /* Musuh statik */ }
    @Override public String getDescription() { return "Enemy: " + nama; }
}
