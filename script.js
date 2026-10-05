// ==========================================
// 1. DATABASE BUAH & MUSUH
// ==========================================
const allFruitsData = {
    "Roket": { name: "Roket", rarity: "rare", priceGold: 500, image: "rocket fruit.png", skills: [ { key: "Z", name: "Roket Launcher", damage: 20, energy: 10, video: "roket launcher.mp4" }, { key: "X", name: "Roket Bomber", damage: 25, energy: 15, video: "roket bomber.mp4" }, { key: "C", name: "Roket Ultimatum", damage: 30, energy: 20, video: "roket ultimatum.mp4" } ] },
    "Flame": { name: "Flame", rarity: "legend", priceGold: 1200, image: "flame fruit.png", skills: [ { key: "Z", name: "Fire Fist", damage: 22, energy: 10, video: "flame_z.mp4" }, { key: "X", name: "Flame Pillar", damage: 28, energy: 15, video: "flame_x.mp4" }, { key: "C", name: "Enkai Sun", damage: 45, energy: 25, video: "flame_c.mp4" } ] },
    "Kitsune": { name: "Kitsune Fruit", rarity: "mythical", priceGold: 5000, image: "kitsune fruit.png", skills: [ { key: "Z", name: "Accursed Enchantment", damage: 25, energy: 15, video: "kitsune_z.mp4" }, { key: "X", name: "Tails of Burning Agony", damage: 35, energy: 20, video: "kitsune_x.mp4" }, { key: "C", name: "Fox Fire Disruption", damage: 60, energy: 35, video: "kitsune_c.mp4" } ] },
    "God Human": { name: "Holy Fruit", rarity: "secret", priceGold: 10000, image: "holy fruit.png", skills: [ { key: "Z", name: "Soaring Fist", damage: 30, energy: 20, video: "godhuman_z.mp4" }, { key: "X", name: "Heavenly Pounce", damage: 40, energy: 25, video: "godhuman_x.mp4" }, { key: "C", name: "Sixth Realm Gun", damage: 70, energy: 40, video: "godhuman_c.mp4" } ] }
};

const enemiesDB = {
    "bandit": { name: "Bandit Lvl. 1", level: 1, health: 100, maxHealth: 100, damage: 5, xp: 50, gold: 25, frag: 20, img: "musuh.png", isBoss: false },
    "boss": { name: "Warewolf Boss", level: 10, health: 800, maxHealth: 800, damage: 25, xp: 500, gold: 300, frag: 200, img: "bos warewolf.png", isBoss: true }
};

let player = {
    fragments: 100000, gold: 5000000, level: 1, xp: 0, maxXp: 100,
    health: 100, maxHealth: 100, energy: 100, maxEnergy: 100,
    statPoints: 5, stats: { melee: 1, defense: 1, sword: 1, soulfruit: 1 },
    activeFruit: "Roket", inventory: { "Roket": 1 } 
};

let currentEnemy = null; // Musuh yang sedang dilawan

// ==========================================
// 2. INISIALISASI & HUD
// ==========================================
const loadingScreen = document.getElementById("loading-screen");
const mainUI = document.getElementById("main-ui");
const battleUI = document.getElementById("battle-ui");

let loadProgress = 0;
const loadingInterval = setInterval(() => {
    loadProgress += Math.floor(Math.random() * 8) + 2; 
    if (loadProgress >= 100) {
        loadProgress = 100; clearInterval(loadingInterval); 
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                mainUI.style.display = 'block';
                updateAllHUD(); renderShop(); renderInventory(); 
            }, 800); 
        }, 600); 
    }
    document.getElementById("loading-bar-fill").style.width = loadProgress + "%";
}, 100);

function updateAllHUD() {
    document.getElementById("money-f").innerText = `F ${player.fragments.toLocaleString()}`;
    document.getElementById("money-gold").innerText = `$ ${player.gold.toLocaleString()}`;
    document.getElementById("level-angka").innerText = player.level;
    document.getElementById("health-text").innerText = `Health ${player.health}/${player.maxHealth}`;
    document.getElementById("energy-text").innerText = `Energy ${player.energy}/${player.maxEnergy}`;
    document.getElementById("xp-text").innerText = `${player.xp} / ${player.maxXp}`;
    document.getElementById("xp-bar-fill").style.width = (player.xp / player.maxXp) * 100 + "%";
    
    document.getElementById("battle-level-angka").innerText = player.level;
    document.getElementById("battle-health-text").innerText = `Health ${player.health}/${player.maxHealth}`;
    document.getElementById("battle-energy-text").innerText = `Energy ${player.energy}/${player.maxEnergy}`;
    document.getElementById("battle-xp-fill").style.width = (player.xp / player.maxXp) * 100 + "%";
    
    if(currentEnemy) {
        document.getElementById("enemy-health-text").innerText = `Health ${currentEnemy.health}/${currentEnemy.maxHealth}`;
        document.getElementById("enemy-hp-fill").style.width = Math.max(0, (currentEnemy.health / currentEnemy.maxHealth) * 100) + "%";
    }

    document.getElementById("stat-points").innerText = player.statPoints;
    document.getElementById("lvl-melee").innerText = player.stats.melee;
    document.getElementById("lvl-defense").innerText = player.stats.defense;
    document.getElementById("lvl-sword").innerText = player.stats.sword;
    document.getElementById("lvl-soulfruit").innerText = player.stats.soulfruit;
}

// ==========================================
// 3. LOGIKA SHOP & INVENTORY
// ==========================================
document.getElementById("btn-items").onclick = () => { document.getElementById("inventory-modal").style.display = "flex"; renderInventory(); };
document.getElementById("close-inventory").onclick = () => document.getElementById("inventory-modal").style.display = "none";
document.getElementById("btn-stats").onclick = () => document.getElementById("stats-modal").style.display = "flex";
document.getElementById("close-stats").onclick = () => document.getElementById("stats-modal").style.display = "none";
document.getElementById("btn-shop").onclick = () => { document.getElementById("shop-modal").style.display = "flex"; renderShop(); };
document.getElementById("close-shop").onclick = () => document.getElementById("shop-modal").style.display = "none";

function changeTab(tabElem, tabName) {
    document.querySelectorAll(".sidebar-tab").forEach(t => t.classList.remove("active"));
    tabElem.classList.add("active");
    if(tabName === 'treasure') renderInventory();
    else document.getElementById("inventory-grid").innerHTML = `<p style="color:white; padding:10px;">Tab ${tabName} is empty.</p>`;
}

function renderShop() {
    const shopContainer = document.getElementById("shop-list-container");
    shopContainer.innerHTML = "";
    Object.keys(allFruitsData).forEach(key => {
        let fruit = allFruitsData[key];
        let btnHTML = `<button class="btn-buy" onclick="buyFruit('${key}')">$ ${fruit.priceGold.toLocaleString()}</button>`;
        shopContainer.innerHTML += `
            <div class="shop-item">
                <div class="shop-item-icon rarity-${fruit.rarity}"><img src="${fruit.image}"></div>
                <div class="shop-item-details">
                    <div class="shop-item-name">${fruit.name} Fruit</div>
                    <div class="shop-item-price">Z, X, C Skills Included</div>
                </div>
                <div class="shop-item-buy">${btnHTML}</div>
            </div>`;
    });
}

window.buyFruit = function(key) {
    let fruit = allFruitsData[key];
    if (player.gold >= fruit.priceGold) {
        player.gold -= fruit.priceGold;
        player.inventory[key] = (player.inventory[key] || 0) + 1;
        alert(`Berhasil membeli Buah ${fruit.name}!`); updateAllHUD();
    } else alert("Gold tidak cukup!");
}

function renderInventory() {
    const grid = document.getElementById("inventory-grid");
    grid.innerHTML = "";
    let ownedKeys = Object.keys(player.inventory).filter(key => player.inventory[key] > 0);
    const weights = { "secret": 4, "mythical": 3, "legend": 2, "rare": 1 };
    
    ownedKeys.sort((a, b) => (weights[allFruitsData[b].rarity] || 0) - (weights[allFruitsData[a].rarity] || 0));
    
    ownedKeys.forEach(key => {
        let count = player.inventory[key]; let fruit = allFruitsData[key];
        grid.innerHTML += `
            <div class="fruit-card rarity-${fruit.rarity}">
                <img src="${fruit.image}" alt="${fruit.name}" class="fruit-png-img">
                <div class="fruit-count">x${count}</div>
                <div class="fruit-card-name">${fruit.name}</div>
                <div class="eat-btn-overlay"><button class="eat-btn" onclick="eatFruit('${key}')">EAT</button></div>
            </div>`;
    });
    if(grid.innerHTML === "") grid.innerHTML = `<p style="color:white; padding:10px;">Kamu tidak punya buah.</p>`;
}

window.eatFruit = function(key) {
    if (player.inventory[key] > 0) {
        player.inventory[key] -= 1; 
        if (player.inventory[key] === 0) delete player.inventory[key];
        player.activeFruit = key; 
        alert(`Kamu telah memakan Buah ${allFruitsData[key].name}!`);
        renderInventory(); buildBattleSkills(); 
    }
}

function addStat(type) {
    if(player.statPoints > 0) {
        player.stats[type] += 1;
        player.statPoints -= 1;
        updateAllHUD();
    }
}

// ==========================================
// 4. SISTEM GACHA ANIMASI DINAMIS (UPDATED)
// ==========================================
window.openGachaModal = function() {
    document.getElementById("gacha-modal").style.display = "flex";
}
window.closeGachaModal = function() {
    if(!document.getElementById("btn-spin-gacha").disabled) {
        document.getElementById("gacha-modal").style.display = "none";
    }
}

function getRandomFruitKey() {
    // 1. Undi kasta rarity-nya
    let r = Math.random() * 100;
    let targetRarity = "rare";       // 60% peluang (40 - 100)
    
    if (r < 1) targetRarity = "secret";        // 1% peluang (0 - 1)
    else if (r < 15) targetRarity = "mythical"; // 14% peluang (1 - 15)
    else if (r < 40) targetRarity = "legend";   // 25% peluang (15 - 40)

    // 2. Kumpulkan semua buah di database yang punya rarity sesuai hasil undian
    let possibleFruits = Object.keys(allFruitsData).filter(key => allFruitsData[key].rarity === targetRarity);

    // 3. Fallback jika kosong (misal belum bikin buah rarity tertentu)
    if (possibleFruits.length === 0) return "Roket";

    // 4. Pilih satu buah secara acak dari daftar kasta tersebut
    let randomIndex = Math.floor(Math.random() * possibleFruits.length);
    return possibleFruits[randomIndex];
}

window.rollGacha = function() {
    if (player.fragments < 1000) { alert("Fragments tidak cukup! Kalahkan Boss untuk mendapatkannya."); return; }
    
    player.fragments -= 1000;
    updateAllHUD();
    
    let btnSpin = document.getElementById("btn-spin-gacha");
    btnSpin.disabled = true;
    btnSpin.innerText = "ROLLING...";

    const track = document.getElementById("gacha-track");
    track.style.transition = "none";
    track.style.transform = "translateX(0px)";
    track.innerHTML = "";

    // Bikin antrian 40 buah acak untuk animasi muter
    let sequence = [];
    for(let i=0; i<40; i++) sequence.push(getRandomFruitKey());
    
    // Buah ke-35 adalah hadiah kemenangannya
    let winIndex = 35;
    let wonFruit = sequence[winIndex];

    sequence.forEach(key => {
        let f = allFruitsData[key];
        track.innerHTML += `<div class="gacha-item rarity-${f.rarity}"><img src="${f.image}"></div>`;
    });

    // Mulai animasi bergeser
    setTimeout(() => {
        let cardWidth = 110; 
        let targetX = -(winIndex * cardWidth) + (600 / 2) - (cardWidth / 2); 
        
        track.style.transition = "transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)";
        track.style.transform = `translateX(${targetX}px)`;
    }, 100);

    // Kasih hadiah saat putaran selesai
    setTimeout(() => {
        player.inventory[wonFruit] = (player.inventory[wonFruit] || 0) + 1;
        alert(`GACHA SELESAI! Kamu mendapatkan ${allFruitsData[wonFruit].name} Fruit!`);
        
        btnSpin.disabled = false;
        btnSpin.innerText = "SPIN (1000 F)";
        renderInventory();
    }, 4500);
}


// ==========================================
// 5. LOGIKA BATTLE & BOSS FIGHT
// ==========================================
window.startBattle = function(type) {
    mainUI.style.display = "none";
    battleUI.style.display = "flex";
    
    currentEnemy = JSON.parse(JSON.stringify(enemiesDB[type]));
    
    document.getElementById("enemy-name-text").innerText = `${currentEnemy.name} [Lvl. ${currentEnemy.level}]`;
    document.getElementById("enemy-img-element").src = currentEnemy.img;
    
    let hpFill = document.getElementById("enemy-hp-fill");
    if(currentEnemy.isBoss) hpFill.classList.add("boss-hp-bar");
    else hpFill.classList.remove("boss-hp-bar");
    
    buildBattleSkills(); 
    updateAllHUD();
}

function buildBattleSkills() {
    const container = document.getElementById("fruit-skills-container");
    const title = document.getElementById("battle-fruit-title");
    
    if(!player.activeFruit || !allFruitsData[player.activeFruit]) { title.innerText = "NO FRUIT"; container.innerHTML = ""; return; }
    
    let currentFruit = allFruitsData[player.activeFruit];
    title.innerText = currentFruit.name.toUpperCase();
    container.innerHTML = "";
    
    currentFruit.skills.forEach(skill => {
        let btn = document.createElement("button"); btn.className = "fruit-skill-btn";
        btn.innerHTML = `<span class="skill-key">[${skill.key}]</span> <span class="skill-name">${skill.name}</span>`;
        btn.onclick = () => playerAttack(skill.damage + (player.stats.soulfruit * 2), skill.energy, skill.video);
        container.appendChild(btn);
    });
}

const playerSprite = document.getElementById("player-sprite");
const enemySprite = document.getElementById("enemy-sprite");
const fruitMenu = document.getElementById("fruit-menu");

function triggerAnim(sprite, animClass) { sprite.classList.add(animClass); setTimeout(() => sprite.classList.remove(animClass), 150); }

function playSkillVideo(videoUrl, onFinished) {
    const vc = document.getElementById("skill-video-container"); const ve = document.getElementById("skill-video");
    document.getElementById("skill-video-source").src = videoUrl; ve.load(); vc.style.display = "flex"; ve.play();
    ve.onended = () => { vc.style.display = "none"; document.getElementById("skill-video-source").src = ""; if (onFinished) onFinished(); };
}

function returnToVillage(isWin) {
    if(isWin) {
        player.xp += currentEnemy.xp; 
        player.gold += currentEnemy.gold;
        player.fragments += currentEnemy.frag;
        
        while(player.xp >= player.maxXp) {
            player.level++; player.xp -= player.maxXp; player.maxXp = Math.floor(player.maxXp * 1.5);
            player.maxHealth += 10; player.maxEnergy += 10; player.statPoints += 3;
        }
        alert(`Menang! +${currentEnemy.xp} XP, +$${currentEnemy.gold}${currentEnemy.frag > 0 ? `, +${currentEnemy.frag} Fragments!` : '.'}`);
    }
    player.health = player.maxHealth; player.energy = player.maxEnergy; 
    currentEnemy = null;
    battleUI.style.display = "none"; mainUI.style.display = "block";
    updateAllHUD();
}

function enemyTurn() {
    if (currentEnemy.health <= 0) return;
    setTimeout(() => {
        triggerAnim(enemySprite, "enemy-attack-anim");
        let dmg = Math.max(1, currentEnemy.damage - player.stats.defense);
        player.health -= dmg;
        if (player.health < 0) player.health = 0;
        updateAllHUD();

        if (player.health === 0) { alert("Kamu Dikalahkan! Kembali ke desa..."); returnToVillage(false); }
    }, 400);
}

function playerAttack(damage, energyCost, videoUrl = null) {
    if (player.health <= 0 || currentEnemy.health <= 0) return;
    if (player.energy < energyCost) { alert("Energy kurang!"); return; }
    
    fruitMenu.style.display = "none"; player.energy -= energyCost; updateAllHUD();

    const doDamage = () => {
        triggerAnim(playerSprite, "player-attack-anim");
        currentEnemy.health -= damage;
        if (currentEnemy.health < 0) currentEnemy.health = 0;
        updateAllHUD();
        if (currentEnemy.health === 0) setTimeout(() => returnToVillage(true), 300); else enemyTurn();
    };

    if (videoUrl) playSkillVideo(videoUrl, doDamage); else doDamage();
}

document.getElementById("btn-punch").onclick = () => playerAttack(10 + (player.stats.melee * 2), 0);
document.getElementById("btn-sword").onclick = () => playerAttack(20 + (player.stats.sword * 2), 10);
document.getElementById("btn-fruit").onclick = () => fruitMenu.style.display = fruitMenu.style.display === "none" ? "flex" : "none";
document.getElementById("btn-regen").onclick = () => {
    if (player.health <= 0 || currentEnemy.health <= 0) return;
    fruitMenu.style.display = "none"; player.energy = Math.min(player.maxEnergy, player.energy + 10); updateAllHUD(); enemyTurn();
};