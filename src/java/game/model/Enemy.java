package game.model;

import java.util.Random;
public class Enemy extends Character {
    private String nama;
    private int hp;
    private int damage;
    private int dropExp;
    private int x;
    private int y;
    private Item dropItem;

    public Enemy(String goblin, int i, int i0) {
        this.nama = nama;
        this.hp = hp;
        this.damage = damage;
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
    @Override
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

    public String getNama() {
        return nama;
    }

    public int getHp() {
        return hp;
    }

    public int getDamage() {
        return damage;
    }

    public int getDropExp() {
        return dropExp;
    }

    public Item getDropItem() {
        return dropItem;
    }
    
}
