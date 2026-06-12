package game.engine;

import java.io.*;
import java.util.*;

public class GameMap {
    private int[][] mapData;
    private int rows, cols;

    public void loadMap(InputStream is) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(is));
        List<int[]> tempMap = new ArrayList<>();
        String line;

        while ((line = reader.readLine()) != null) {
            String[] tokens = line.trim().split("\\s+");
            int[] row = new int[tokens.length];
            for (int i = 0; i < tokens.length; i++) {
                row[i] = Integer.parseInt(tokens[i]);
            }
            tempMap.add(row);
            cols = tokens.length;
        }
        rows = tempMap.size();
        mapData = tempMap.toArray(new int[0][]);
        
        // Indikator bahwa map dari .txt berhasil terbaca oleh Java Backend
        System.out.println("Map berhasil dimuat di backend: " + cols + "x" + rows);
    }

    public int getTile(int x, int y) {
        // Mencegah error OutOfBounds
        if(y >= 0 && y < rows && x >= 0 && x < cols) {
            return mapData[y][x];
        }
        return -1; 
    }
    
    // Tambahan: Method untuk mengekspos data map agar bisa divalidasi oleh class lain
    public int[][] getMapData() {
        return mapData;
    }

    public int getRows() {
        return rows;
    }

    public int getCols() {
        return cols;
    }
}