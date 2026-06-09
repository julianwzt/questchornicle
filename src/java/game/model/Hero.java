/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package game.model;

/**
 *
 * @author GU605MV
 */
public class Hero extends Character {

    public int gold;
    public Inventory inventory;
    private int x;
    private int y;
    public String job;

    public Hero(String nama) {

        this.nama = nama;
        this.hp = 100;
        this.maxHp = 100;
        this.level = 1;
        this.atk = 15;
        this.inventory = new Inventory();
        this.x = 100;
        this.y = 100;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }
    @Override
    public void setHp(int hp) {
        this.hp = hp; 
    }
    
    public void setMaxHp(int maxHp) {
        this.maxHp = maxHp; 
    }
    
    public void setX(int x) {
        this.x = x; 
    }
    
    public void setY(int y) {
        this.y = y; 
    }
    
    public void move(int dx, int dy) {

        this.x += dx;
        this.y += dy;
    }

    public void useItem(Item item) {

        item.use(this);
    }

    @Override
    public int calculateDamage() {

        return this.atk + (int)(Math.random() * 5);
    }

    public void attack(Character target) {

        int damage = calculateDamage();

        target.takeDamage(damage);

        System.out.println(
                nama + " attacks for " + damage
        );
    }

    @Override
    public void gainExp(int amount) {

        this.exp += amount;
    }

    @Override
    public void levelUp() {

        this.level++;

        this.maxHp += 20;

        this.hp = maxHp;

        this.atk += 5;
    }

    @Override
    public String getDescription() {

        return "Hero: " + nama;
    }
}
