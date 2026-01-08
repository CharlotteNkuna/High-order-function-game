/**
 * PRG ENGINE _ HIGH ORDER FUNCTIONS MINI GAME
 */

//----1.THE FORGE (HOF: REruns a Function)

const createStance =(multiplier)=> {
    return (basePower)=> basePower * multiplier
}

const berserkerStance = createStance(3); //Deals 30 damage points
const holyStance = createStance(-2) //Deals -20 Damage --- restore
const stealthStance = createStance(0.5) //Deals 5 damage

//-----2 HEAD STATE (HOF: Closure/ state Management)
//This "remembers" the level variable inside its own private scope.

const createHero = (name)=>{
    let level = 1;
    return ()=>{
        level ++;
        return level
    }
}

const levelUp = createHero("Knight")

//-----3 THE DATA
let monsters = [
    {name:"Slime", hp:20},
    {name:"Goblin", hp: 50},
    {name:"Mermaid", hp: 150}
]

//-----4 THE UI UPDATER
//Simple function to sync our js data with the HTML tags
const updateUI =(totalHP,message)=>{
    document.getElementById("monster-hp").innerText = `Total Enemy HP: ${totalHP}`;
    document.getElementById("game-message").innerText = message;
}

//Modify UI to perform turn to use our UI update
const performTurn = (stanceCallBack,messageText)=>{
    const basePower = 10;
    //First HOF .MAP Transform the data
    monsters = monsters.map(m=>{
        const change  = stanceCallBack(basePower);
        return{...m,hp:Math.max(0,m.hp - change)}
    })

    //Second HOF .REDUCE: Calculate the state
    const currentTotalHP = monsters.reduce((sum, m)=>sum + m.hp, 0);

    //Third UI CALLBACK: Update the screen
    if (currentTotalHP<=0) {
        updateUI(0,"🏆 Victory! You sent the mermaid back to Limpopo")       
    }
    console.table(monsters)
}

    //FINALLY Let's wire the keyboard
    window.addEventListener('keydown', (event)=>{
        const key = event.key.toLocaleLowerCase();
        if (key==='a') {
            performTurn(berserkerStance, "⚔️ You swung your blade");
        } else if (key==='h') {
            performTurn(holyStance, "✨ Healing powers of Gogo maweni taking effect")   
        }
        else if (key==='l') {
            const newLevel = levelUp();
            updateUI(monsters.reduce((s,m)=> s + m.hp,0),  `🌟 Level up! You are now level ${newLevel}`)   
        }

    }) 

