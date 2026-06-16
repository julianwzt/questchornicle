package game.system;

import java.sql.*;
import game.model.Hero;

public class SaveManager {
    private final String URL = "jdbc:mysql://localhost:3306/quest_db";
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

    public boolean save(Hero hero, int slotId) {
        String sql = "REPLACE INTO player_save (slot_id, nama, job, level, exp, max_exp, hp, max_hp, mp, max_mp, atk, def, x, y, potion, key_count, sword, shield, clue) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                     
        try (Connection conn = DriverManager.getConnection(URL, USER, PASS);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, slotId);
            ps.setString(2, hero.getNama());
            ps.setString(3, hero.job);
            ps.setInt(4, hero.getLevel());
            ps.setInt(5, hero.getExp());
            ps.setInt(6, hero.getMaxExp());
            ps.setInt(7, hero.getHp());
            ps.setInt(8, hero.getMaxHp());
            ps.setInt(9, hero.getMp());
            ps.setInt(10, hero.getMaxMp());
            ps.setInt(11, hero.getAtk());
            ps.setInt(12, hero.getDef());
            ps.setInt(13, hero.getX());
            ps.setInt(14, hero.getY());
            
            ps.setInt(15, hero.getPotionCount());
            ps.setInt(16, hero.getKeyCount());
            ps.setBoolean(17, hero.isHasSword());
            ps.setBoolean(18, hero.isHasShield());
            ps.setBoolean(19, hero.isHasClue());
            
            ps.executeUpdate();
            System.out.println("Berhasil menyimpat data ke MySQL untuk Slot " + slotId);
            return true;
        } catch (SQLException e) { 
            System.err.println("Gagal saat menyimpan data!");
            e.printStackTrace(); 
            return false;
        }
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
                        return null; // Slot kosong
                    }
                    
                    Hero hero = new Hero(rs.getString("nama"));
                    hero.job = job;
                    hero.setLevel(rs.getInt("level"));
                    hero.setExp(rs.getInt("exp"));
                    hero.setMaxExp(rs.getInt("max_exp"));
                    hero.setHp(hp);
                    hero.setMaxHp(rs.getInt("max_hp"));
                    hero.setMp(rs.getInt("mp"));
                    hero.setMaxMp(rs.getInt("max_mp"));
                    hero.setAtk(rs.getInt("atk"));
                    hero.setDef(rs.getInt("def"));
                    hero.setX(rs.getInt("x"));
                    hero.setY(rs.getInt("y"));
                    
                    hero.setPotionCount(rs.getInt("potion"));
                    hero.setKeyCount(rs.getInt("key_count"));
                    hero.setHasSword(rs.getBoolean("sword"));
                    hero.setHasShield(rs.getBoolean("shield"));
                    hero.setHasClue(rs.getBoolean("clue"));
                    
                    System.out.println("Berhasil memuat data dari MySQL Slot " + slotId);
                    return hero;
                }
            }
        } catch (SQLException e) { 
            System.err.println("Gagal saat memuat data!");
            e.printStackTrace(); 
        }
        return null;
    }
}