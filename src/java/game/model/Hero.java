package game.model;

public class Hero extends Character {
    public int gold;
    public Inventory inventory; 
    private int x;
    private int y;
    public String job;
    
    private int mp;
    private int maxMp;
    private int maxExp;

    public Hero(String nama) {
        this.nama = nama;
        this.inventory = new Inventory();
        resetForNewGame("Warrior"); 
    }

    public void resetForNewGame(String jobName) {
        this.job = jobName;
        this.level = 1;
        this.exp = 0;
        this.maxExp = 100;
        this.mp = 100;
        this.maxMp = 100;
        
        if ("Warrior".equals(jobName)) {
            this.maxHp = 150; this.atk = 20;
        } else if ("Mage".equals(jobName)) {
            this.maxHp = 80; this.atk = 5;
        } else if ("Archer".equals(jobName)) {
            this.maxHp = 100; this.atk = 10;
        } else {
            this.maxHp = 100; this.atk = 15;
        }
        
        this.hp = this.maxHp;
        this.x = 240; 
        this.y = 240; 
        this.inventory = new Inventory();
    }
    
    public String useSkill(int skillNum) {
        if ("Warrior".equals(this.job)) {
            if (skillNum == 1 && this.mp >= 30) { this.mp -= 30; return "warrior_skill_1"; }
            if (skillNum == 2 && this.mp >= 20) { this.mp -= 20; return "warrior_skill_2"; }
        } 
        else if ("Mage".equals(this.job)) {
            // [FITUR BARU] Basic Attack Mage (-2 MP)
            if (skillNum == 0 && this.mp >= 2) { this.mp -= 2; return "mage_basic"; }
            
            if (skillNum == 1 && this.mp >= 10) { this.mp -= 10; return "mage_skill_1"; }
            if (skillNum == 2) { 
                this.mp += 30; 
                if (this.mp > this.maxMp) this.mp = this.maxMp; 
                return "mage_skill_2"; 
            }
        }
        else if ("Archer".equals(this.job)) {
            if (skillNum == 1 && this.mp >= 5) { this.mp -= 5; return "archer_skill_1"; }
            if (skillNum == 2 && this.mp >= 10) { this.mp -= 10; return "archer_skill_2"; }
        }
        return "failed"; // Jika MP tidak cukup atau skill tidak valid
    }
    
    public int getHp() {
        return this.hp; 
    }
    
    public int getMaxHp() {
        return this.maxHp; 
    }
    
    public int getLevel() {
        return this.level; 
    }
    
    public int getExp() {
        return this.exp; 
    }

    public int getX() {
        return x; 
    }
    
    public int getY() {
        return y; 
    }
    
    public int getMp() {
        return mp; 
    }
    
    public int getMaxMp() {
        return maxMp; 
    }
    
    public int getMaxExp() {
        return maxExp; 
    }

    @Override
    public void setHp(int hp) { this.hp = hp; }
    public void setMaxHp(int maxHp) { this.maxHp = maxHp; }
    public void setX(int x) { this.x = x; }
    public void setY(int y) { this.y = y; }
    public void setMp(int mp) { this.mp = mp; }
    public void setMaxMp(int maxMp) { this.maxMp = maxMp; }

    public void move(int dx, int dy) {
        this.x += dx; this.y += dy;
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
    }

    @Override
    public void gainExp(int amount) { 
        this.exp += amount; 
        if (this.exp >= this.maxExp) levelUp();
    }

    @Override
    public void levelUp() {
        this.level++;
        this.exp = 0;
        this.maxExp += 50; 
        this.maxHp += 20;
        this.hp = maxHp;
        this.maxMp += 10;
        this.mp = maxMp;
        this.atk += 5;
    }

    @Override
    public String getDescription() { return "Hero: " + nama; }
}