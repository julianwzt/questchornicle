package game.model;

public abstract class Character implements Attackable, Levelable, java.io.Serializable {
    protected String nama;
    protected int hp;
    protected int maxHp;
    protected int atk;
    protected int def;
    protected int level;
    protected int exp;

    public void takeDamage(int dmg) {
        this.hp -= dmg;
        if (this.hp < 0) this.hp = 0;
    }

    public boolean isAlive() {
        return this.hp > 0;
    }

    public abstract String getDescription();

    // Getters wajib untuk output JSON di GameEngine
    public String getNama() {
        return nama; 
    }
    
    public int getHp() {
        return hp; 
    }
    
    public int getMaxHp() {
        return maxHp; 
    }
    
    public int getLevel() {
        return level; 
    }
    
    public void setHp(int hp) {
        this.hp = hp; 
    }
    
    void heal(int i) {
        throw new UnsupportedOperationException("Not supported yet."); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/GeneratedMethodBody
    }
}
