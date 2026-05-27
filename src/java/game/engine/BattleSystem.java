/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package game.engine;

import game.model.Enemy;
import game.model.Hero;

/**
 *
 * @author GU605MV
 */
public class BattleSystem {
    private final Hero hero;
    private final Enemy enemy;

    public BattleSystem(Hero hero, Enemy enemy) {
        this.hero = hero;
        this.enemy = enemy;
    }

    public void startBattle() { /* Inisialisasi status battle */ }
    
    // Ini pengganti processTurn untuk real-time
    public void processBattle(String action) { 
        if(action.equals("attack") && hero.isAlive() && enemy.isAlive()) {
            hero.attack(enemy);
            // AI Musuh merespons langsung
            if(enemy.isAlive()) {
                enemy.attack(hero);
            }
        }
    }

    public boolean checkEnd() { return !hero.isAlive() || !enemy.isAlive(); }
    public Enemy getEnemy() { return enemy; }
}
