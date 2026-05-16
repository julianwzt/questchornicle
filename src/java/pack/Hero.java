/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pack;

/**
 *
 * @author GU605MV
 */
public class Hero extends Character {
    public int gold;
    public Inventory inventory;

    public Hero(String nama) {
        this.nama = nama;
        this.hp = 100;
        this.maxHp = 100;
        this.level = 1;
        this.atk = 15;
        this.inventory = new Inventory();
    }

    public void useItem(Item item) { item.use(this); }
    // Implementasi method abstract
    public void attack(Character target) { target.takeDamage(calculateDamage()); }
    @Override public int calculateDamage() { return this.atk; }
    @Override public void gainExp(int amount) { this.exp += amount; }
    @Override public void levelUp() { this.level++; this.maxHp += 20; this.hp = maxHp; }
    @Override public String getDescription() { return "Hero: " + nama; }
}
