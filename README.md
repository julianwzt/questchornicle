# Quest Chronicle - Tugas Besar PBO

Quest Chronicle adalah game RPG 2D berbasis web yang dibangun menggunakan Java Servlets, JSP, HTML5 Canvas, dan MySQL. Proyek ini dibuat untuk memenuhi Tugas Besar Pemrograman Berbasis Objek (PBO), mendemonstrasikan integrasi arsitektur OOP pada Backend dengan antarmuka Frontend yang interaktif.

## Fitur Utama
- Eksplorasi peta (Dunia luar dan Dungeon).
- Pertarungan real-time dengan monster dan boss.
- Sistem kelas karakter (Warrior, Mage, Archer) dengan skill unik.
- Manajemen inventory (Equipment, Potion, Key Items).
- Sistem Save dan Load data permainan ke database MySQL.

## Kebutuhan Sistem (Prerequisites)
- JDK 11 atau lebih baru
- Apache Tomcat (v9.0 atau lebih baru)
- MySQL / MariaDB (via XAMPP atau sejenisnya)
- NetBeans IDE
- Driver `mysql-connector-java-8.0.x.jar`

## Persiapan Database

Anda harus menyiapkan database bernama `quest_db` di MySQL. Terdapat dua cara untuk menyiapkan tabel database:

### Opsi 1: Menggunakan File Database Bawaan (Import)
1. Buka phpMyAdmin (http://localhost/phpmyadmin/).
2. Buat database baru dengan nama `quest_db`.
3. Pilih database tersebut, lalu klik tab **Import**.
4. Pilih file `.sql` bawaan yang ada di dalam folder Lampiran.
5. Klik **Go** atau **Import**.

### Opsi 2: Membuat Tabel Secara Manual (Query SQL)
1. Buka phpMyAdmin dan buat database bernama `quest_db`.
2. Masuk ke tab **SQL** dan eksekusi query berikut:

```sql
CREATE TABLE IF NOT EXISTS player_save (
    slot_id INT PRIMARY KEY,
    nama VARCHAR(50),
    job VARCHAR(50),
    level INT,
    exp INT,
    max_exp INT,
    hp INT,
    max_hp INT,
    mp INT,
    max_mp INT,
    atk INT,
    def INT,
    x INT,
    y INT,
    potion INT,
    key_count INT,
    sword BOOLEAN,
    shield BOOLEAN,
    clue BOOLEAN
);
```

## Persiapan dan Instalasi Proyek (NetBeans)
- Buka NetBeans IDE dan pilih File > Open Project, arahkan ke folder proyek ini.
- Pastikan library database sudah terpasang. Cek folder fisik proyek Anda: web/WEB-INF/lib/. Pastikan file mysql-connector-java-8.0.x.jar ada di dalam folder tersebut. Jika folder lib belum ada, buat foldernya secara manual dan masukkan file .jar ke sana.
- Klik kanan pada nama proyek di NetBeans, lalu pilih Clean and Build.
- Setelah build sukses, klik kanan pada proyek dan pilih Run.
- Browser akan terbuka otomatis di alamat http://localhost:8080/Questchornicle/.

## Kontrol Permainan
- W, A, S, D / Panah : Menggerakkan karakter.
- Spasi (Space) : Serangan dasar, berinteraksi, membuka peti, atau membuka pintu.
- 1 & 2 : Menggunakan skill khusus (membutuhkan MP).
- I : Membuka / menutup jendela Inventory.
- ESC : Membuka menu Pengaturan dan Save/Load Game.

## Struktur Kode PBO
- Proyek ini mengimplementasikan konsep PBO dasar (Class, Object, Inheritance, Polymorphism, Encapsulation) pada paket Java:
- game.model.*: Struktur data game (Hero, Enemy, Item).
- game.engine.*: Logika utama permainan, memproses interaksi, collision, dan pertarungan.
- game.system.SaveManager: Penghubung JDBC untuk menyimpan dan memuat objek dari MySQL.
- game.controller.GameServlet: Menangani request HTTP dari antarmuka Web menggunakan arsitektur Servlet.
