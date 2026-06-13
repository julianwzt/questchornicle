package game.system;

import java.sql.*;
import game.model.Hero;

public class SaveManager {
    private final String URL = "jdbc:mysql://localhost:3306/quest_db?useSSL=false&allowPublicKeyRetrieval=true";
    private final String USER = "root";
    private final String PASS = ""; 

    public SaveManager() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("Driver JDBC tidak ditemukan! Pastikan file connector .jar ada di web/WEB-INF/lib/");
            e.printStackTrace();
        }
    }

    public void save(Hero hero, int slotId) {
        String sql = "INSERT INTO player_save (slot_id, nama, hp, max_hp, x, y, job) VALUES (?, ?, ?, ?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE nama=?, hp=?, max_hp=?, x=?, y=?, job=?";
        try (Connection conn = DriverManager.getConnection(URL, USER, PASS);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, slotId);
            ps.setString(2, hero.getNama());
            ps.setInt(3, hero.getHp());
            ps.setInt(4, hero.getMaxHp());
            ps.setInt(5, hero.getX());
            ps.setInt(6, hero.getY());
            ps.setString(7, hero.job);
            
            ps.setString(8, hero.getNama());
            ps.setInt(9, hero.getHp());
            ps.setInt(10, hero.getMaxHp());
            ps.setInt(11, hero.getX());
            ps.setInt(12, hero.getY());
            ps.setString(13, hero.job);
            
            ps.executeUpdate();
        } catch (SQLException e) { e.printStackTrace(); }
    }

    public Hero load(int slotId) {
    String sql = "SELECT * FROM player_save WHERE slot_id = ?";
    try (Connection conn = DriverManager.getConnection(URL, USER, PASS);
         PreparedStatement ps = conn.prepareStatement(sql)) {
        ps.setInt(1, slotId);
        try (ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                String job = rs.getString("job");
                int hp = rs.getInt("hp");
                
                if (job == null || job.isEmpty() || hp <= 0) {
                    return null;
                }
                
                Hero hero = new Hero(rs.getString("nama"));
                hero.job = job;
                hero.setHp(hp);
                hero.setMaxHp(rs.getInt("max_hp"));
                hero.setX(rs.getInt("x"));
                hero.setY(rs.getInt("y"));
                return hero;
            }
        }
    } catch (SQLException e) { e.printStackTrace(); }
    return null;
}
}