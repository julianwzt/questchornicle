<%-- 
    Document   : index
    Created on : May 11, 2026, 2:52:13 PM
    Author     : GU605MV
--%>

<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Quest Chronicle - Final Action</title>
    <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>

<div id="game-container">
    <canvas id="gameCanvas" width="800" height="600"></canvas>

    <div id="main-menu" class="overlay active" data-type="menu">
        <h1 class="game-title">QUEST CHRONICLE</h1>
        <div class="menu-btn selected" onclick="showScreen('job-menu')">START GAME</div>
        <div class="menu-btn" onclick="openSettings()">SETTINGS</div>
    </div>

    <div id="job-menu" class="overlay" data-type="menu">
        <h2>SELECT YOUR JOB</h2>
        <div style="display: flex;">
            <div class="job-card selected" onclick="startGame('Warrior')">Warrior</div>
            <div class="job-card" onclick="startGame('Mage')">Mage</div>
            <div class="job-card" onclick="startGame('Archer')">Archer</div>
        </div>
    </div>

    <div id="settings-menu" class="overlay" data-type="menu">
        <div class="settings-box">
            <h2 style="text-align:center; margin-top:0;">SETTINGS</h2>
            <p>Volume Musik: <input type="range" style="width:100%"></p>
            <p>Volume Efek: <input type="range" style="width:100%"></p>
            <hr style="border-color:#555">
            <p style="font-size: 0.85em; color:#ccc;"><b>Kontrol:</b> WASD/Panah untuk gerak, Spasi untuk serang, ESC untuk Pause.</p>
            
            <div style="display:flex; justify-content:center; gap:10px; margin-top: 15px;">
                <div class="menu-btn selected" id="btn-resume" onclick="closeSettings()">KEMBALI</div>
                <div class="menu-btn" id="btn-main-menu" onclick="backToMainMenu()" style="display:none;">MAIN MENU</div>
            </div>
        </div>
    </div>
    
    <div id="inventory-menu" class="overlay" data-type="menu">
        <div class="settings-box" style="width: 450px;">
            <h2 style="text-align:center; margin-top:0; color: #f1c40f;">INVENTORY</h2>
            
            <div id="inv-stats" style="margin-bottom: 10px; font-size: 15px; color: #ecf0f1; text-align: center; font-weight: bold;">
                ATK: <span id="stat-atk">15</span> | DEF: <span id="stat-def">5</span>
            </div>
            <p style="font-size: 12px; text-align: center; margin-top: -5px; color: #bdc3c7;">
                Weapon: <span id="eq-wpn">None</span> | Armor: <span id="eq-arm">None</span>
            </p>
            
            <div id="inv-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; min-height: 120px; background: #1a1a1a; padding: 10px; border-radius: 5px; border: 1px solid #7f8c8d;">
            </div>
            
            <div style="display:flex; justify-content:center; margin-top: 15px;">
                <div class="menu-btn selected" onclick="closeInventory()">TUTUP (I)</div>
            </div>
        </div>
    </div>
    
    <div id="hud">
        <b>[ <span id="job-val">-</span> ]</b>
        <div style="font-size: 13px; margin-top:5px">HP: <span id="hp-val">100</span> / 100</div>
        <div class="hp-bar"><div id="hp-fill"></div></div>
    </div>
</div>

<script src="script.js"></script>
</body>
</html>