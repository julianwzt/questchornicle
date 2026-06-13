package game.controller;

import game.engine.GameEngine;
import game.engine.GameMap;
import game.model.Enemy;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet(name = "GameServlet", urlPatterns = {"/GameServlet"})
public class GameServlet extends HttpServlet {
    private GameMap gameMap;

    @Override
    public void init() throws ServletException {
        gameMap = new GameMap();
        try {
            InputStream is = getServletContext().getResourceAsStream("/res/maps/world01.txt");
            if (is != null) gameMap.loadMap(is);
        } catch (Exception e) { e.printStackTrace(); }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        GameEngine engine = (GameEngine) session.getAttribute("gameEngine");
        
        if (engine == null) {
            engine = new GameEngine();
            session.setAttribute("gameEngine", engine);
        }

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            String action = request.getParameter("action");
            if (action == null) action = "";

            String slotParam = request.getParameter("slot_id");
            int slotId = 1; 
            if (slotParam != null && !slotParam.isEmpty()) slotId = Integer.parseInt(slotParam);

            // [FITUR BARU] HANCURKAN SESI LAMA AGAR LEVEL RESET KE 1!
            if ("new_game".equals(action)) {
                engine = new GameEngine(); // Buat Ulang Engine dari Nol
                session.setAttribute("gameEngine", engine);
                
                String jobStr = request.getParameter("job");
                if (jobStr == null || jobStr.isEmpty()) jobStr = "Warrior";
                
                engine.getHero().resetForNewGame(jobStr);
                engine.spawnEntities();
                
                out.print(engine.getGameStateAsJson());
            }
            
            else if ("open_chest".equals(action)) {
                int chestId = Integer.parseInt(request.getParameter("chest_id"));
                engine.openChest(chestId);
                out.print(engine.getGameStateAsJson());
            }

            // [PERBAIKAN SKILL] Java mencerna input, lalu mengirim efeknya ke JavaScript
            else if ("use_skill".equals(action)) {
                int skillNum = Integer.parseInt(request.getParameter("skill_num"));
                String effect = "failed";
                
                if (engine.getHero() != null) {
                    effect = engine.getHero().useSkill(skillNum);
                }
                
                // Menyisipkan Status Efek ke dalam JSON balasan dari GameEngine
                String json = engine.getGameStateAsJson();
                json = "{\"skill_effect\": \"" + effect + "\", " + json.substring(1);
                
                out.print(json);
            }
            
            else if ("take_damage".equals(action)) {
                String dmgStr = request.getParameter("damage");
                if (dmgStr != null && engine.getHero() != null) {
                    int dmgTaken = (int) Double.parseDouble(dmgStr);
                    engine.getHero().setHp(engine.getHero().getHp() - dmgTaken);
                    if (engine.getHero().getHp() < 0) engine.getHero().setHp(0);
                }
                out.print(engine.getGameStateAsJson());
            }
            else if ("attack_enemy".equals(action)) {
                String enemyIdStr = request.getParameter("enemy_id");
                if (enemyIdStr != null && !enemyIdStr.isEmpty()) {
                    int enemyIndex = Integer.parseInt(enemyIdStr);
                    if (enemyIndex >= 0 && enemyIndex < engine.getActiveEnemies().size()) {
                        Enemy target = engine.getActiveEnemies().get(enemyIndex);
                        if (target.getHp() > 0) {
                            int damage = engine.getHero().calculateDamage();
                            target.takeDamage(damage);
                            
                            // JIKA MUSUH MATI
                            if (target.getHp() <= 0) {
                                engine.getHero().gainExp(target.getDropExp());
                                
                                // [FITUR BARU] Java Otomatis Menambah Barang ke Inventory!
                                if (target.getDropItem() != null) {
                                    // Anggap Potion masuk sebagai 1 jumlah (count)
                                    // Pastikan Inventory Hero mu dikode dengan benar
                                    System.out.println("Musuh menjatuhkan item: Potion!");
                                    // engine.getHero().inventory.addItem(target.getDropItem()); 
                                }
                            }
                        }
                    }
                }
                out.print(engine.getGameStateAsJson());
            }
            else if ("use_potion".equals(action)) {
                if (engine.getHero() != null) {
                    if (engine.getHero().getHp() < engine.getHero().getMaxHp()) {
                        int newHp = Math.min(engine.getHero().getMaxHp(), engine.getHero().getHp() + 30);
                        engine.getHero().setHp(newHp);
                    }
                }
                out.print(engine.getGameStateAsJson());
            }
            
            // [FITUR BARU] Saat LOAD, posisi Hero tidak ikut ter-reset!
            else if ("load".equals(action)) {
                boolean isLoaded = engine.loadGame(slotId);
                if (isLoaded) { 
                    engine.spawnEntities(); // Hanya memunculkan musuh
                    out.print(engine.getGameStateAsJson()); 
                } 
                else { out.print("{\"status\": \"empty\"}"); }
            } 
            else if ("save".equals(action)) {
                String xStr = request.getParameter("x");
                String yStr = request.getParameter("y");
                if (engine.getHero() != null) {
                    if (xStr != null && !xStr.isEmpty() && !xStr.equals("undefined")) engine.getHero().setX((int) Double.parseDouble(xStr));
                    if (yStr != null && !yStr.isEmpty() && !yStr.equals("undefined")) engine.getHero().setY((int) Double.parseDouble(yStr));
                }
                engine.saveGame(slotId);
                out.print(engine.getGameStateAsJson());
            } 
            else {
                if (engine.getHero() != null) {
                    if ("up".equals(action)) engine.getHero().setY(engine.getHero().getY() - 1);
                    if ("down".equals(action)) engine.getHero().setY(engine.getHero().getY() + 1);
                    if ("left".equals(action)) engine.getHero().setX(engine.getHero().getX() - 1);
                    if ("right".equals(action)) engine.getHero().setX(engine.getHero().getX() + 1);
                    out.print(engine.getGameStateAsJson());
                } else { out.print("{}"); }
            }
            
            
            
            out.flush();
        } catch (Exception e) {
            e.printStackTrace(); 
            out.print("{\"error\": \"Java Server Error\"}"); 
            out.flush();
        }
    }
}