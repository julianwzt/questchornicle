package game.controller;

import game.engine.GameEngine;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "GameServlet", urlPatterns = {"/GameServlet"})
public class GameServlet extends HttpServlet {

    private GameEngine engine;

    @Override
    public void init() throws ServletException {
        engine = new GameEngine();
        engine.spawnEntities();
    }

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        
        try (PrintWriter out = response.getWriter()) {
            String action = request.getParameter("action");
            
            if (action == null) {
                out.print(engine.getGameStateAsJson());
                return;
            }
            
            if ("new_game".equals(action)) {
                String job = request.getParameter("job");
                String username = request.getParameter("username"); 
                
                if (job == null) job = "Warrior";
                if (username == null || username.trim().isEmpty() || username.equals("null")) {
                    username = "Player";
                }
                
                engine.getHero().setNama(username);
                engine.getHero().resetForNewGame(job);
                engine.spawnEntities();
                out.print(engine.getGameStateAsJson());
            } 
            else if ("move".equals(action)) {
                int x = (int) Math.round(Double.parseDouble(request.getParameter("x")));
                int y = (int) Math.round(Double.parseDouble(request.getParameter("y")));
                engine.getHero().setX(x);
                engine.getHero().setY(y);
                out.print("{\"status\":\"moved\"}");
            } 
            else if ("attack_enemy".equals(action)) {
                int enemyId = Integer.parseInt(request.getParameter("enemy_id"));
                if (enemyId >= 0 && enemyId < engine.getActiveEnemies().size()) {
                    game.model.Enemy target = engine.getActiveEnemies().get(enemyId);
                    if (target.getHp() > 0) {
                        engine.getHero().attack(target);
                        if (target.getHp() <= 0) {
                            engine.getHero().gainExp(target.getDropExp());
                        }
                    }
                }
                out.print(engine.getGameStateAsJson());
            } 
            else if ("take_damage".equals(action)) {
                int dmg = (int) Math.round(Double.parseDouble(request.getParameter("damage")));
                engine.getHero().takeDamage(dmg);
                out.print(engine.getGameStateAsJson());
            } 
            else if ("open_chest".equals(action)) {
                int chestId = Integer.parseInt(request.getParameter("chest_id"));
                engine.openChest(chestId);
                out.print(engine.getGameStateAsJson());
            } 
            else if ("use_potion".equals(action)) {
                if (engine.getHero() != null) engine.getHero().usePotion();
                out.print(engine.getGameStateAsJson());
            }
            else if ("use_key".equals(action)) {
                if (engine.getHero() != null && engine.getHero().getKeyCount() > 0) {
                    engine.getHero().setKeyCount(engine.getHero().getKeyCount() - 1);
                }
                out.print(engine.getGameStateAsJson());
            }
            else if ("enter_dungeon".equals(action)) {
                engine.spawnDungeonEntities();
                if (engine.getHero() != null) {
                    int spawnX = 240; 
                    int spawnY = 240; 
                    try {
                        spawnX = (int) Math.round(Double.parseDouble(request.getParameter("spawnX")));
                        spawnY = (int) Math.round(Double.parseDouble(request.getParameter("spawnY")));
                    } catch (Exception e) {}
                    
                    engine.getHero().setX(spawnX);
                    engine.getHero().setY(spawnY);
                }
                out.print(engine.getGameStateAsJson());
            }
            else if ("exit_dungeon".equals(action)) {
                engine.spawnEntities(); 
                if (engine.getHero() != null) {
                    int spawnX = 240; 
                    int spawnY = 240; 
                    try {
                        spawnX = (int) Math.round(Double.parseDouble(request.getParameter("spawnX")));
                        spawnY = (int) Math.round(Double.parseDouble(request.getParameter("spawnY")));
                    } catch (Exception e) {}
                    
                    engine.getHero().setX(spawnX);
                    engine.getHero().setY(spawnY);
                }
                out.print(engine.getGameStateAsJson());
            }
            else if ("use_skill".equals(action)) {
                int skillNum = Integer.parseInt(request.getParameter("skill_num"));
                String effect = engine.getHero().useSkill(skillNum);
                
                String jsonState = engine.getGameStateAsJson();
                String responseJson = jsonState.substring(0, jsonState.length() - 1) + ", \"skill_effect\": \"" + effect + "\"}";
                out.print(responseJson);
            } 
            else if ("save".equals(action)) {
                int slot = Integer.parseInt(request.getParameter("slot_id"));
                
                engine.getHero().setX((int) Math.round(Double.parseDouble(request.getParameter("x"))));
                engine.getHero().setY((int) Math.round(Double.parseDouble(request.getParameter("y"))));
                engine.getHero().setHp((int) Math.round(Double.parseDouble(request.getParameter("hp"))));
                engine.getHero().job = request.getParameter("job");
                
                boolean isSaved = engine.saveGame(slot); 
                if (isSaved) {
                    out.print("{\"status\":\"saved\"}");
                } else {
                    out.print("{\"status\":\"error\"}");
                }
            } 
            else if ("load".equals(action)) {
                int slot = Integer.parseInt(request.getParameter("slot_id"));
                boolean success = engine.loadGame(slot);
                if (success) {
                    engine.spawnEntities();
                    out.print(engine.getGameStateAsJson());
                } else {
                    out.print("{\"status\":\"empty\"}");
                }
            } 
            else {
                out.print(engine.getGameStateAsJson());
            }
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }
}