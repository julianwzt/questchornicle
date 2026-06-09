## Persyaratan Sistem
Sebelum menjalankan proyek ini, pastikan sistem kamu sudah terinstal:
1. **Java Development Kit (JDK) 8** atau lebih baru.
2. **IDE NetBeans** (disarankan untuk Java EE / Web Application).
3. **Apache Tomcat Server** (biasanya sudah bawaan NetBeans).
4. **XAMPP** (untuk menjalankan MySQL/MariaDB).
5. **MySQL Connector/J** (`mysql-connector-java.jar`).

## Cara Instalasi & Menjalankan Game

### 1. Persiapan Database (PENTING!)
Sistem Save/Load game ini sangat bergantung pada struktur database yang tepat agar slot tidak tertimpa.
1. Buka XAMPP dan nyalakan modul **Apache** dan **MySQL**.
2. Buka peramban dan akses `http://localhost/phpmyadmin`.
3. Buat database baru dengan nama `quest_db`.
4. Masuk ke tab **SQL** di database tersebut, lalu jalankan perintah berikut untuk membuat tabel:

```sql
CREATE TABLE player_save (
    slot_id INT PRIMARY KEY,
    nama VARCHAR(50),
    hp INT,
    max_hp INT,
    x INT,
    y INT,
    job VARCHAR(20)
);
```

### 2. Menjalankan Proyek
1. Buka (Open Project) Quest Chronicle di NetBeans.
2. Klik kanan pada nama proyek, lalu pilih Clean and Build untuk memastikan semua cache lama terhapus.
3. Klik kanan pada proyek, lalu pilih Run.
4. Game akan otomatis terbuka di peramban (browser) bawaan kamu (disarankan menggunakan resolusi 100% tanpa zoom browser).
