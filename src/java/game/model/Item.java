package game.model;

public abstract class Item implements java.io.Serializable {
    protected String id;
    protected String name;
    protected String rarity;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRarity() {
        return rarity;
    }

    public void setRarity(String rarity) {
        this.rarity = rarity;
    }

    public abstract void use(Character target);
    public abstract String getEffect();
}
