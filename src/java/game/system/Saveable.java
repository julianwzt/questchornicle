package game.system;

public interface Saveable {
    void save(String path);
    void load(String path);
}
