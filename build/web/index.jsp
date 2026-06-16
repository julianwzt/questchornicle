<%@ page language="java" contentType="text/html; charset=UTF-8"
pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>Quest Chronicle</title>
    <link rel="stylesheet" type="text/css" href="style.css" />
  </head>
  <body>
    <div id="game-container">
      <canvas id="gameCanvas" width="800" height="600"></canvas>

      <div id="main-menu" class="overlay active" data-type="menu">
        <h1 class="game-title">QUEST CHRONICLE</h1>
        <div class="menu-btn selected" onclick="showScreen('job-menu')">
          START GAME
        </div>
        <div class="menu-btn" onclick="prepareSlot('load')">LOAD GAME</div>
        <div class="menu-btn" onclick="openSettings()">SETTINGS</div>
      </div>

      <div id="job-menu" class="overlay">
            <h1 class="game-title">SELECT YOUR JOB</h1>
            <input type="text" id="username-input" placeholder="Masukkan Username..." autocomplete="off">
            
            <div style="display: flex;">
                <div class="job-card" onclick="startGame('Warrior')">
                    <h2>Warrior</h2>
                    <p>HP: 150 | ATK: 20 | DEF: 5</p>
                </div>
                <div class="job-card" onclick="startGame('Mage')">
                    <h2>Mage</h2>
                    <p>HP: 80 | ATK: 5 | DEF: 2</p>
                </div>
                <div class="job-card" onclick="startGame('Archer')">
                    <h2>Archer</h2>
                    <p>HP: 100 | ATK: 10 | DEF: 3</p>
                </div>
            </div>
            <button class="menu-btn" onclick="showScreen('main-menu')" style="margin-top: 20px;">KEMBALI</button>
        </div>

      <div id="slot-menu" class="overlay" data-type="menu">
        <h2 style="margin-bottom: 20px">PILIH SLOT</h2>
        <div
          style="
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 20px;
          "
        >
          <div class="menu-btn selected" onclick="performSlotAction(1)">
            Slot 1
          </div>
          <div class="menu-btn" onclick="performSlotAction(2)">Slot 2</div>
          <div class="menu-btn" onclick="performSlotAction(3)">Slot 3</div>
        </div>
        <div class="menu-btn" onclick="cancelSlotSelection()">KEMBALI</div>
      </div>

      <div id="settings-menu" class="overlay" data-type="menu">
        <div class="settings-box">
          <h2 style="text-align: center; margin-top: 0; color: #e67e22">
            SETTINGS
          </h2>
          <p>Volume Musik: <input type="range" style="width: 100%" /></p>
          <p>Volume Efek: <input type="range" style="width: 100%" /></p>
          <hr style="border-color: #555" />
          <p style="font-size: 0.85em; color: #ccc">
            <b>Kontrol:</b> WASD/Panah gerak, Spasi serang, 1 & 2 Skill, I
            Inventory.
          </p>
          <hr style="border-color: #555" />
          <p style="font-size: 0.85em; color: #ccc; margin-top: 10px;">
            <b>Music:</b>
          </p>
          <div class="menu-btn" id="bgm-mute-btn" onclick="toggleBGMMute()">
            🔊 MUTE MUSIC
          </div>

          <div
            style="
              display: flex;
              justify-content: center;
              gap: 10px;
              margin-top: 15px;
            "
          >
            <div class="menu-btn selected" onclick="prepareSlot('save')">
              SAVE GAME
            </div>
          </div>

          <div
            style="
              display: flex;
              justify-content: center;
              gap: 10px;
              margin-top: 15px;
            "
          >
            <div class="menu-btn" id="btn-resume" onclick="closeSettings()">
              KEMBALI
            </div>
            <div
              class="menu-btn"
              id="btn-main-menu"
              onclick="backToMainMenu()"
              style="display: none"
            >
              MAIN MENU
            </div>
          </div>
        </div>
      </div>

      <div id="inventory-menu" class="overlay">
        <div class="inventory-container">
          <div class="stats-panel">
                    <h2>Character Status</h2>
                    <div class="char-info">
                        <img id="inv-char-img" src="" alt="avatar">
                        <div>
                            <h3 id="inv-name" style="color: #f1c40f; margin-bottom: 5px;">Player</h3>
                            <p id="inv-level">Lv. 1</p>
                        </div>
                    </div>

                    <div class="stats-list">
                        <p><span>JOB</span> <span id="inv-job-list">Warrior</span></p>
                        <p><span>LEVEL</span> <span id="inv-level-list">1</span></p>
                        <p><span>HP</span> <span id="inv-hp">100 / 100</span></p>
                        <p><span>MP</span> <span id="inv-mp">100 / 100</span></p>
                        <p><span>EXP</span> <span id="inv-exp">0 / 100</span></p>
                        <p><span>ATTACK</span> <span id="inv-atk">0</span></p>
                        <p><span>DEFENSE</span> <span id="inv-def">0</span></p>
                    </div>
                </div>

          <div class="items-panel">
            <h2>Inventory</h2>
            <div id="inventory-list" class="items-grid"></div>
          </div>

          <button class="close-btn" onclick="closeInventory()">
            [X] TUTUP
          </button>
        </div>
      </div>

      <div id="game-over-menu" class="overlay" data-type="menu">
        <h1
          style="
            color: #e74c3c;
            font-size: 4rem;
            margin-bottom: 5px;
            text-shadow: 3px 3px 0 #000;
          "
        >
          GAME OVER
        </h1>
        <p style="margin-bottom: 30px; color: #bdc3c7">
          Karaktermu telah gugur dalam pertempuran.
        </p>
        <div class="menu-btn selected" onclick="backToMainMenu()">
          MENU UTAMA
        </div>
      </div>

      <div id="hud">
        <b><span id="inv-name"></span></b>
        <div style="font-size: 13px; margin-top: 5px">
          HP: <span id="hp-val">100</span> / <span id="max-hp-val">100</span>
        </div>
        <div class="hp-bar"><div id="hp-fill"></div></div>
        <div
          style="
            font-size: 13px;
            margin-top: 5px;
            color: #f1c40f;
            font-weight: bold;
          "
        >
          <span id="res-name">Resource</span>: <span id="res-val">0</span>
        </div>
        <div
          style="
            font-size: 11px;
            margin-top: 8px;
            color: #95a5a6;
            font-style: italic;
          "
        >
          Tekan [I] untuk Inventory
        </div>
      </div>
    </div>

    <script src="script.js"></script>
  </body>
</html>