<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Quest Chronicle</title>
    <link rel="stylesheet" type="text/css" href="style.css"> 
</head>
<body>

<div id="game-container">
    <canvas id="gameCanvas" width="800" height="600"></canvas>

    <div id="main-menu" class="overlay active" data-type="menu">
        <h1 class="game-title">QUEST CHRONICLE</h1>
        <div class="menu-btn selected" onclick="showScreen('job-menu')">START GAME</div>
        <div class="menu-btn" onclick="prepareSlot('load')">LOAD GAME</div>
        <div class="menu-btn" onclick="openSettings()">SETTINGS</div>
    </div>

    <div id="job-menu" class="overlay" data-type="menu">
        <h2 style="margin-bottom: 20px;">SELECT YOUR JOB</h2>
        <div style="display: flex; gap: 15px; justify-content: center;">
            <div class="job-card selected" onclick="startGame('Warrior')">Warrior</div>
            <div class="job-card" onclick="startGame('Mage')">Mage</div>
            <div class="job-card" onclick="startGame('Archer')">Archer</div>
        </div>
    </div>

    <div id="slot-menu" class="overlay" data-type="menu">
        <h2 style="margin-bottom: 20px;">PILIH SLOT</h2>
        <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 20px;">
            <div class="menu-btn selected" onclick="performSlotAction(1)">Slot 1</div>
            <div class="menu-btn" onclick="performSlotAction(2)">Slot 2</div>
            <div class="menu-btn" onclick="performSlotAction(3)">Slot 3</div>
        </div>
        <div class="menu-btn" onclick="cancelSlotSelection()">KEMBALI</div>
    </div>

    <div id="settings-menu" class="overlay" data-type="menu">
        <div class="settings-box">
            <h2 style="text-align:center; margin-top:0; color: #e67e22;">SETTINGS</h2>
            <p>Volume Musik: <input type="range" style="width:100%"></p>
            <p>Volume Efek: <input type="range" style="width:100%"></p>
            <hr style="border-color:#555">
            <p style="font-size: 0.85em; color:#ccc;"><b>Kontrol:</b> WASD/Panah gerak, Spasi serang, 1 & 2 Skill.</p>
            
            <div style="display:flex; justify-content:center; gap:10px; margin-top: 15px;">
                <div class="menu-btn selected" onclick="prepareSlot('save')">SAVE GAME</div>
            </div>
            
            <div style="display:flex; justify-content:center; gap:10px; margin-top: 15px;">
                <div class="menu-btn" id="btn-resume" onclick="closeSettings()">KEMBALI</div>
                <div class="menu-btn" id="btn-main-menu" onclick="backToMainMenu()" style="display:none;">MAIN MENU</div>
            </div>
        </div>
    </div>

    <div id="game-over-menu" class="overlay" data-type="menu">
        <h1 style="color: #e74c3c; font-size: 4rem; margin-bottom: 5px; text-shadow: 3px 3px 0 #000;">GAME OVER</h1>
        <p style="margin-bottom: 30px; color: #bdc3c7;">Karaktermu telah gugur dalam pertempuran.</p>
        <div class="menu-btn selected" onclick="backToMainMenu()">MENU UTAMA</div>
    </div>

    <div id="hud">
        <b>[ <span id="job-val">-</span> ]</b>
        <div style="font-size: 13px; margin-top:5px">HP: <span id="hp-val">100</span> / <span id="max-hp-val">100</span></div>
        <div class="hp-bar"><div id="hp-fill"></div></div>
        <div style="font-size: 13px; margin-top:5px; color: #f1c40f; font-weight: bold;">
            <span id="res-name">Resource</span>: <span id="res-val">0</span>
        </div>
    </div>
</div>

<script src="script.js"></script>
</body>
</html>