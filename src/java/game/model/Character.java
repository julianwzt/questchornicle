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

    public String getNama() {
        return nama; 
    }

    public int getAtk() {
        return atk;
    }

    public void setAtk(int atk) {
        this.atk = atk;
    }

    public int getDef() {
        return def;
    }

    public void setDef(int def) {
        this.def = def;
    }

    public int getExp() {
        return exp;
    }

    public void setExp(int exp) {
        this.exp = exp;
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
}
