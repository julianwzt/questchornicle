package game.model;

import java.util.ArrayList;
import java.util.List;

public class Inventory implements java.io.Serializable {
    private List<Item> items = new ArrayList<>();
    private int maxCap = 10;

    public boolean addItem(Item i) {
        if (items.size() < maxCap) {
            items.add(i);
            return true;
        }
        return false;
    }

    public boolean removeItem(Item i) {
        return items.remove(i);
    }
}
