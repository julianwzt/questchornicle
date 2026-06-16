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

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }

    public int getMaxCap() {
        return maxCap;
    }

    public void setMaxCap(int maxCap) {
        this.maxCap = maxCap;
    }

    public boolean removeItem(Item i) {
        return items.remove(i);
    }
}
