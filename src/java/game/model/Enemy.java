package game.model;

import java.util.Random;

public class Enemy extends Character {
    private int x;
    private int y;
    private Item dropItem;
    private int dropExp;

    public Enemy(String nama, int hp, int damage, int x, int y) {
        this.nama = nama;       
        this.hp = hp;          
        this.maxHp = hp;
        this.atk = damage;     
        this.x = x;
        this.y = y;
        this.dropExp = 50;     
    }

    // --- GETTER & SETTER KHUSUS ENEMY ---
    public int getX() {
        return x; 
    }
    
    public void setX(int x) {
        this.x = x; 
    }

    public int getY() { return y; }
    public void setY(int y) {
        this.y = y; 
    }

    public int getDamage() {
        return this.atk; 
    }

    public Item getDropItem() {
        return dropItem; 
    }
    
    public void setDropItem(Item dropItem) {
        this.dropItem = dropItem; 
    }

    public int getDropExp() {
        return dropExp; 
    }

    // --- LOGIKA AI & RPG ---
    public String getAIAction() {
        return "attack";
    }

    // AI move toward player (Fitur aslimu)
    public void moveToward(Hero hero) {
        if (hero.getX() > x) x += 2;
        if (hero.getX() < x) x -= 2;

        if (hero.getY() > y) y += 2;
        if (hero.getY() < y) y -= 2;
    }

    @Override
    public void attack(Character target) {
        int finalDamage = calculateDamage();
        target.takeDamage(finalDamage);
        System.out.println(nama + " attacks for " + finalDamage);
    }

    @Override
    public int calculateDamage() {
        // Fitur aslimu: Damage dasar ditambah angka acak 0-7
        Random random = new Random();
        return this.atk + random.nextInt(8);
    }

    @Override
    public void gainExp(int amount) {
        // Musuh tidak perlu mendapatkan exp
    }

    @Override
    public void levelUp() {
        // Musuh tidak perlu naik level
    }

    @Override
    public String getDescription() {
        return "Enemy: " + nama;
    }
}