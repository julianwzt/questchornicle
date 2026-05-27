/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package game.model;

/**
 *
 * @author GU605MV
 */
import java.util.ArrayList;
import java.util.List;

public class Inventory {
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
