/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package game.model;

/**
 *
 * @author GU605MV
 */
public interface Attackable {
    void attack(Character target);
    int calculateDamage();
}
