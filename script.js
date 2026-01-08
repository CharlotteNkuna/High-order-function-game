//This script manages the "State" of your game using Higher-Order Functions.


/**
 * RPG ENGINE - MASTER SCRIPT
 */
// --- 1. THE FACTORIES (HOF: Returns Functions) ---
// This allows us to create combat "Stances" easily.
const createStance = (mult) => (base) => base * mult;
const berserkerStance = createStance(3); // Triple damage
const holyStance = createStance(-2);    // Negative damage = Healing


// --- 2. HERO STATE (HOF: Closure + Persistence) ---
const createHero = () => {
    let level = parseInt(localStorage.getItem('rpg_level')) || 1;
    return {
        getLv: () => level,
        up: () => {
            level++;
            localStorage.setItem('rpg_level', level);
            return level;
        },
        reset: () => {
            localStorage.removeItem('rpg_level');
            level = 1;
        }
    };
};
const hero = createHero();


// --- 3. DATA ---
const MAX_HP = 220;
let monsters = [
    { name: "Slime", hp: 20 },
    { name: "Goblin", hp: 50 },
    { name: "Tembisa Mermaid", hp: 150, isBoss: true }
];


// --- 4. THE UI UPDATER (Error-Proofed) ---
const updateUI = (currentHP, message) => {
    // Optional Chaining ?. prevents "null" errors if an ID is missing
    document.getElementById("monster-hp").innerText = `HP: ${currentHP} / ${MAX_HP}`;
    document.getElementById("game-message").innerText = message;
    document.getElementById("hero-lv").innerText = `Level: ${hero.getLv()}`;
    document.getElementById("monster-count").innerText = `Enemies: ${monsters.length}`;
   
    const elBar = document.getElementById("hp-bar");
    if (elBar) {
        const pct = Math.max(0, (currentHP / MAX_HP) * 100);
        elBar.style.width = pct + "%";
        elBar.style.background = pct < 30 ? "#ff4444" : pct < 60 ? "#ffcc00" : "#00ff00";
    }
};


// --- 5. BOSS AI (HOF: setInterval) ---
const bossRegen = setInterval(() => {
    const mermaid = monsters.find(m => m.name === "Tembisa Mermaid");
    const warningEl = document.getElementById("boss-warning");
    if (mermaid) {
        mermaid.hp += 15;
        const total = monsters.reduce((s, m) => s + m.hp, 0);
        if (warningEl) warningEl.innerText = "⚠️ The Mermaid is regenerating!";
        updateUI(total, "The water glows green with magic...");
        setTimeout(() => { if (warningEl) warningEl.innerText = ""; }, 2000);
    } else {
        clearInterval(bossRegen); // Stop timer if boss is dead (.filter removed her)
    }
}, 5000);


// --- 6. THE ENGINE (The Manager HOF) ---
const performTurn = (stanceCallback, messageText) => {
    const basePower = 10 + (hero.getLv() * 5);
   
    // HOF: MAP - Change everyone's health
    monsters = monsters.map(m => ({
        ...m,
        hp: Math.max(0, m.hp - stanceCallback(basePower))
    }));
    // HOF: FILTER - Remove dead objects
    monsters = monsters.filter(m => m.hp > 0);
    // HOF: REDUCE - Calculate global total
    const currentTotalHP = monsters.reduce((sum, m) => sum + m.hp, 0);
    console.clear();
    console.table(monsters);
    if (monsters.length === 0) {
        updateUI(0, "🏆 VICTORY! All monsters defeated.");
    } else {
        updateUI(currentTotalHP, messageText);
    }
};


// --- 7. TARGETING (HOF: Find) ---
const targetSlime = () => {
    const slime = monsters.find(m => m.name === "Slime");
    const total = monsters.reduce((s, m) => s + m.hp, 0);
    if (slime) {
        updateUI(total, `🎯 Target: Slime | Individual HP: ${slime.hp}`);
    } else {
        updateUI(total, "💨 Target lost: Slime is dead!");
    }
};


// --- 8. KEYBOARD LISTENERS ---
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a') performTurn(berserkerStance, "⚔️ You attacked with Berserker Stance!");
    if (key === 'h') performTurn(holyStance, "✨ You healed the monsters!");
    if (key === 's') targetSlime();
    if (key === 'l') {
        hero.up();
        updateUI(monsters.reduce((s, m) => s + m.hp, 0), "⭐ Level Up! Damage increased.");
    }
    if (key === 'r') {
        hero.reset();
        location.reload();
    }
});
// Start initialization
const startHP = monsters.reduce((s, m) => s + m.hp, 0);
updateUI(startHP, "Ready for battle, Hero?");