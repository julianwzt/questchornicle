package game.model;

public abstract class Item implements java.io.Serializable {
    protected String id;
    protected String name;
    protected String rarity;

    public abstract void use(Character target);
    public abstract String getEffect();
}
