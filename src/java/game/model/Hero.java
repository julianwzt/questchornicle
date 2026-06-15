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

    // --- SERVER AUTHORITY: Variabel Stats & Inventory ---
    private int def;
    private int potionCount = 0;
    private int keyCount = 0;
    private boolean hasSword = false;
    private boolean hasShield = false;

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

        // Reset Inventory
        this.potionCount = 0;
        this.keyCount = 0;
        this.hasSword = false;
        this.hasShield = false;

        // Base Stats
        if ("Warrior".equals(jobName)) {
            this.maxHp = 150;
            this.atk = 20;
            this.def = 5;
        } else if ("Mage".equals(jobName)) {
            this.maxHp = 80;
            this.atk = 5;
            this.def = 2;
        } else if ("Archer".equals(jobName)) {
            this.maxHp = 100;
            this.atk = 10;
            this.def = 3;
        } else {
            this.maxHp = 100;
            this.atk = 15;
            this.def = 4;
        }

        this.hp = this.maxHp;
        this.x = 240;
        this.y = 240;
        this.inventory = new Inventory();
    }

    public String useSkill(int skillNum) {
        if ("Warrior".equals(this.job)) {
            if (skillNum == 1 && this.mp >= 30) {
                this.mp -= 30;
                return "warrior_skill_1";
            }
            if (skillNum == 2 && this.mp >= 20) {
                this.mp -= 20;
                return "warrior_skill_2";
            }
        } else if ("Mage".equals(this.job)) {
            if (skillNum == 0 && this.mp >= 2) {
                this.mp -= 2;
                return "mage_basic";
            }
            if (skillNum == 1 && this.mp >= 10) {
                this.mp -= 10;
                return "mage_skill_1";
            }
            if (skillNum == 2) {
                this.mp += 30;
                if (this.mp > this.maxMp)
                    this.mp = this.maxMp;
                return "mage_skill_2";
            }
        } else if ("Archer".equals(this.job)) {
            if (skillNum == 1 && this.mp >= 5) {
                this.mp -= 5;
                return "archer_skill_1";
            }
            if (skillNum == 2 && this.mp >= 10) {
                this.mp -= 10;
                return "archer_skill_2";
            }
        }
        return "failed";
    }

    // --- GETTER SETTER STATS ---
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

    public int getAtk() {
        return this.atk;
    }

    public int getDef() {
        return this.def;
    }

    // --- GETTER SETTER INVENTORY ---
    public int getPotionCount() {
        return potionCount;
    }

    public void setPotionCount(int count) {
        this.potionCount = count;
    }

    public int getKeyCount() {
        return keyCount;
    }

    public void setKeyCount(int count) {
        this.keyCount = count;
    }

    public boolean isHasSword() {
        return hasSword;
    }

    public void setHasSword(boolean hasSword) {
        this.hasSword = hasSword;
    }

    public boolean isHasShield() {
        return hasShield;
    }

    public void setHasShield(boolean hasShield) {
        this.hasShield = hasShield;
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

    public void setMp(int mp) {
        this.mp = mp;
    }

    public void setMaxMp(int maxMp) {
        this.maxMp = maxMp;
    }

    public void setAtk(int atk) {
        this.atk = atk;
    }

    public void setDef(int def) {
        this.def = def;
    }

    public void move(int dx, int dy) {
        this.x += dx;
        this.y += dy;
    }

    public void useItem(Item item) {
        item.use(this);
    }

    public void usePotion() {
        if (this.potionCount > 0 && this.hp < this.maxHp) {
            this.potionCount--;
            this.hp += 30;
            if (this.hp > this.maxHp)
                this.hp = this.maxHp;
        }
    }

    @Override
    public int calculateDamage() {
        return this.atk + (int) (Math.random() * 5);
    }

    public void attack(Character target) {
        int damage = calculateDamage();
        target.takeDamage(damage);
    }

    @Override
    public void gainExp(int amount) {
        this.exp += amount;
        while (this.exp >= this.maxExp) {
            this.exp -= this.maxExp;
            levelUp();
        }
    }

    @Override
    public void levelUp() {
        this.level++;
        this.maxExp += 50;
        this.maxHp += 20;
        this.hp = maxHp;
        this.maxMp += 10;
        this.mp = maxMp;

        int atkBonus = 3;
        int defBonus = 1;
        if ("Warrior".equals(this.job)) {
            atkBonus = 5;
            defBonus = 2;
        } else if ("Archer".equals(this.job)) {
            atkBonus = 4;
            defBonus = 1;
        }

        this.atk += atkBonus;
        this.def += defBonus;
    }

    @Override
    public String getDescription() {
        return "Hero: " + nama;
    }
}