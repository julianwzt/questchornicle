package game.controller;

import game.engine.GameEngine;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet(name = "GameServlet", urlPatterns = {"/GameServlet"})
public class GameServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        GameEngine engine = (GameEngine) session.getAttribute("gameEngine");

        if (engine == null) {
            engine = new GameEngine();
            session.setAttribute("gameEngine", engine);
        }

        try {
            String action = request.getParameter("action");
            String slotParam = request.getParameter("slot_id");
            int slotId = 1; // Default Slot 1
            
            if (slotParam != null && !slotParam.isEmpty()) {
                slotId = Integer.parseInt(slotParam);
            }

            if ("save".equals(action)) {
                String xStr = request.getParameter("x");
                String yStr = request.getParameter("y");
                String hpStr = request.getParameter("hp");
                String jobStr = request.getParameter("job");

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
                
                engine.saveGame(slotId);
                
            } else if ("load".equals(action)) {
                boolean isLoaded = engine.loadGame(slotId);
    
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                PrintWriter out = response.getWriter();

                if (isLoaded) {
                    out.print(engine.getGameStateAsJson());
                } else {
                    // Kirim status kosong jika validasi database gagal
                    out.print("{\"status\": \"empty\"}");
                }
                out.flush();
                return; // Keluar dari method agar tidak melanjutkan eksekusi kode lain
}

            // Balasan sukses ke JavaScript
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            PrintWriter out = response.getWriter();
            out.print(engine.getGameStateAsJson());
            out.flush();

        } catch (Exception e) {
            // Jika terjadi error di Server, tangkap dan jangan biarkan game macet!
            e.printStackTrace(); // Error dicatat di output NetBeans
            response.setContentType("application/json");
            response.getWriter().print("{}"); // Kirim JSON kosong
        }
    }
}