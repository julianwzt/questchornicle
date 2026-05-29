/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package game.controller;

import game.engine.GameEngine;
import java.io.IOException;
import java.io.PrintWriter;
// Perubahan krusial di sini: menggunakan jakarta.servlet
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet(name = "GameServlet", urlPatterns = {"/GameServlet"})
public class GameServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        HttpSession session = request.getSession(true);
        if (session.getAttribute("gameEngine") == null) {
            session.setAttribute("gameEngine", new GameEngine());
        }
        request.getRequestDispatcher("index.jsp").forward(request, response);
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

        String action = request.getParameter("action");
        
        if (action != null) {
            switch (action) {
                case "attack":
                    engine.processAction("attack");
                    break;
                case "save":
                    engine.saveGame();
                    break;
                case "load":
                    engine.loadGame();
                    break;
            }
        }

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        try (PrintWriter out = response.getWriter()) {
            out.print(engine.getGameStateAsJson());
            out.flush();
        }
    }
}