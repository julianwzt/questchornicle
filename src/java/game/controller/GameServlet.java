package game.controller;

import game.engine.GameEngine;
import game.engine.GameMap;
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
            // Memuat file map saat server pertama kali dijalankan
            InputStream is = getServletContext().getResourceAsStream("/res/maps/world01.txt");
            if (is != null) {
                gameMap.loadMap(is);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        GameEngine engine = (GameEngine) session.getAttribute("gameEngine");
        
        // 1. Pastikan engine diinisialisasi PALING PERTAMA sebelum logic lainnya
        if (engine == null) {
            engine = new GameEngine();
            session.setAttribute("gameEngine", engine);
        }

        // 2. Siapkan wadah respon ke JavaScript (Frontend)
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            String action = request.getParameter("action");
            if (action == null) action = "";

            String slotParam = request.getParameter("slot_id");
            int slotId = 1; // Default Slot 1
            if (slotParam != null && !slotParam.isEmpty()) {
                slotId = Integer.parseInt(slotParam);
            }

            // ==========================================
            // LOGIKA LOAD GAME
            // ==========================================
            if ("load".equals(action)) {
                boolean isLoaded = engine.loadGame(slotId);

                if (isLoaded) {
                    out.print(engine.getGameStateAsJson());
                } else {
                    // Kirim status kosong jika validasi database gagal
                    out.print("{\"status\": \"empty\"}");
                }
            } 
            // ==========================================
            // LOGIKA SAVE GAME
            // ==========================================
            else if ("save".equals(action)) {
                String xStr = request.getParameter("x");
                String yStr = request.getParameter("y");
                String hpStr = request.getParameter("hp");
                String jobStr = request.getParameter("job");

                // Pastikan hero tidak null sebelum mengeset data
                if (engine.getHero() != null) {
                    // Validasi Anti-Crash: Pastikan data tidak kosong sebelum diubah ke angka
                    if (xStr != null && !xStr.isEmpty() && !xStr.equals("undefined")) {
                        engine.getHero().setX((int) Double.parseDouble(xStr));
                    }
                    if (yStr != null && !yStr.isEmpty() && !yStr.equals("undefined")) {
                        engine.getHero().setY((int) Double.parseDouble(yStr));
                    }
                    if (hpStr != null && !hpStr.isEmpty() && !hpStr.equals("undefined")) {
                        engine.getHero().setHp((int) Double.parseDouble(hpStr));
                    }
                    if (jobStr != null && !jobStr.isEmpty() && !jobStr.equals("undefined")) {
                        engine.getHero().job = jobStr;
                    }
                }

                engine.saveGame(slotId);
                // Balasan sukses ke JavaScript
                out.print(engine.getGameStateAsJson());
            } 
            // ==========================================
            // LOGIKA PERGERAKAN KARAKTER
            // ==========================================
            else {
                // Di sinilah memasukkan logic collision (tabrakan) nantinya
                if (engine.getHero() != null) {
                    if ("up".equals(action)) engine.getHero().setY(engine.getHero().getY() - 1);
                    if ("down".equals(action)) engine.getHero().setY(engine.getHero().getY() + 1);
                    if ("left".equals(action)) engine.getHero().setX(engine.getHero().getX() - 1);
                    if ("right".equals(action)) engine.getHero().setX(engine.getHero().getX() + 1);
                    
                    // Mengembalikan koordinat state terbaru dalam format JSON
                    int pX = engine.getHero().getX();
                    int pY = engine.getHero().getY();
                    out.print("{\"playerX\": " + pX + ", \"playerY\": " + pY + "}");
                } else {
                    out.print("{}"); // Fallback jika Hero null
                }
            }

            // Pastikan flush hanya dipanggil satu kali di paling akhir
            out.flush();

        } catch (Exception e) {
            // Jika terjadi error di Server, tangkap dan jangan biarkan game macet!
            e.printStackTrace(); // Error dicatat di output NetBeans
            out.print("{}"); // Kirim JSON kosong agar frontend tidak bengong/error
            out.flush();
        }
    }
}