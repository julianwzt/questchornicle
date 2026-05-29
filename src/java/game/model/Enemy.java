/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package game.model;

import java.util.Random;

/**
 *
 * @author GU605MV
 */
public class Enemy extends Character {
    private int dropExp;
    private int x;
    private int y;
    private Item dropItem;

    public Enemy(String goblin, int i, int i0) {
        throw new UnsupportedOperationException("Not supported yet."); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/GeneratedMethodBody
    }
    
    public Item dropLoot() {
        return dropItem;
    }

    public void setDropItem(Item item) {
        this.dropItem = item;
    }
    public Enemy(String nama, int hp, int atk, int x, int y) {

        this.nama = nama;
        this.hp = hp;
        this.maxHp = hp;
        this.atk = atk;

        this.x = x;
        this.y = y;
}
    public String getAIAction() {
        return "attack";
    }

    // AI move toward player
    public void moveToward(Hero hero) {

        if (hero.getX() > x) x += 2;
        if (hero.getX() < x) x -= 2;

        if (hero.getY() > y) y += 2;
        if (hero.getY() < y) y -= 2;
    }

    // enemy attack player
    public void attack(Character target) {

        int damage = calculateDamage();

        target.takeDamage(damage);

        System.out.println(nama + " attacks for " + damage);
    }

    @Override
    public int calculateDamage() {

        Random random = new Random();

        return this.atk + random.nextInt(8);
    }

    @Override
    public void gainExp(int amount) {
    }

    @Override
    public void levelUp() {
    }

    @Override
    public String getDescription() {
        return "Enemy: " + nama;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }
}
