// Global Variables
let currentUser = null;
let users = JSON.parse(localStorage.getItem('freeBetUsers')) || {};
let games = [
    { id: 'coinflip', name: 'Coin Flip', icon: '🪙', minBet: 10 },
    { id: 'dice', name: 'Dice Roll', icon: '🎲', minBet: 5 },
    { id: 'crash', name: 'Crash Game', icon: '🚀', minBet: 20 },
    { id: 'mines', name: 'Mines', icon: '💣', minBet: 15 },
    { id: 'slots', name: 'Slots', icon: '🎰', minBet: 10 }
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkVisitBonus();
    loadGames();
    loadLeaderboard();
    updateUI();
});

// Auto Visit Bonus (Har page load pe 50 points)
function checkVisitBonus() {
    const lastVisit = localStorage.getItem('lastVisit');
    const now = Date.now();
    
    if (!lastVisit || (now - lastVisit > 300000)) { // 5 min cooldown
        if (currentUser) {
            users[currentUser].points += 50;
            users[currentUser].totalVisits++;
            saveUsers();
            showNotification('🎉 50 FREE POINTS mile gaye! Welcome bonus!');
        }
        localStorage.setItem('lastVisit', now);
    }
}

// Login/Register
function loginUser() {
    const name = prompt('👤 Apna naam enter karein:');
    if (name && name.trim()) {
        const username = name.trim().toLowerCase().replace(/\s+/g, '_');
        
        if (!users[username]) {
            users[username] = {
                points: 1000, // Starting bonus
                totalVisits: 1,
                totalBets: 0,
                totalWins: 0,
                rank: Object.keys(users).length + 1
            };
        }
        
        currentUser = username;
        saveUsers();
        updateUI();
        showNotification(`✅ Welcome ${name}! 1000 FREE POINTS mile!`);
    }
}

// Save/Load Users
function saveUsers() {
    localStorage.setItem('freeBetUsers', JSON.stringify(users));
}

function loadGames() {
    const grid = document.getElementById('gamesGrid');
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="game-icon">${game.icon}</div>
            <h3>${game.name}</h3>
            <p>Min Bet: ${game.minBet} PTS</p>
            <button class="bet-btn" onclick="playGame('${game.id}', ${game.minBet})">
                Play Now (${game.minBet} PTS)
            </button>
        `;
        grid.appendChild(card);
    });
}

// Play Game
function playGame(gameId, minBet) {
    if (!currentUser) {
        alert('👤 Pehle Login karein!');
        loginUser();
        return;
    }
    
    const points = users[currentUser].points;
    if (points < minBet) {
        alert(`❌ Kam points! Daily bonus claim karein. Aapke paas ${points} PTS hai.`);
        return;
    }
    
    // Deduct bet
    users[currentUser].points -= minBet;
    users[currentUser].totalBets++;
    saveUsers();
    updateUI();
    
    // Show Game Modal
    showGameModal(gameId, minBet);
}

// Game Modal
function showGameModal(gameId, betAmount) {
    const modal = document.getElementById('gameModal');
    const content = document.getElementById('gameContent');
    
    let gameHTML = `
        <h2 id="gameTitle">${getGameName(gameId)}</h2>
        <p>Bet Amount: <strong>${betAmount} PTS</strong></p>
        <div id="gameArea" style="height: 300px; display: flex; align-items: center; justify-content: center;">
            Loading game...
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button onclick="playGameRound('${gameId}', ${betAmount})" 
                    style="padding: 15px 40px; font-size: 18px; background: #4ecdc4; color: white; border: none; border-radius: 25px; cursor: pointer;">
                🎮 PLAY GAME
            </button>
        </div>
    `;
    
    content.innerHTML = gameHTML;
    modal.style.display = 'block';
}

function closeGameModal() {
    document.getElementById('gameModal').style.display = 'none';
}

function getGameName(gameId) {
    const game = games.find(g => g.id === gameId);
    return game ? game.name : 'Game';
}

// Play Game Round
function playGameRound(gameId, betAmount) {
    const gameArea = document.getElementById('gameArea');
    
    // Simulate game result
    setTimeout(() => {
        const winChance = Math.random();
        let won = false;
        let multiplier = 1;
        
        if (gameId === 'coinflip') {
            won = Math.random() > 0.5;
            multiplier = won ? 2 : 0;
        } else if (gameId === 'dice') {
            const roll = Math.floor(Math.random() * 6) + 1;
            gameArea.innerHTML = `<h3>🎲 Rolled: ${roll}</h3>`;
            won = roll >= 4;
            multiplier = won ? 1.8 : 0;
        } else if (gameId === 'crash') {
            const crashPoint = (Math.random() * 5 + 1).toFixed(2);
            gameArea.innerHTML = `<h3>🚀 Crashed at: ${crashPoint}x</h3>`;
            won = Math.random() > 0.3;
            multiplier = won ? parseFloat(crashPoint) : 0;
        }
        
        const winnings = won ? Math.floor(betAmount * multiplier) : 0;
        
        if (won) {
            users[currentUser].points += winnings;
            users[currentUser].totalWins++;
            gameArea.innerHTML += `<h2 style="color: green;">✅ WINNER! +${winnings} PTS</h2>`;
        } else {
            gameArea.innerHTML += `<h2 style="color: red;">❌ Lost ${betAmount} PTS</h2>`;
        }
        
        saveUsers();
        updateUI();
        showNotification(won ? `🎉 You won ${winnings} PTS!` : '😢 Better luck next time!');
        
    }, 2000);
}

// Daily Bonus
function claimDailyBonus() {
    if (!currentUser) {
        alert('👤 Pehle Login karein!');
        return;
    }
    
    const lastBonus = localStorage.getItem(`lastBonus_${currentUser}`);
    const now = Date.now();
    
    if (lastBonus && (now - lastBonus < 86400000)) { // 24 hours
        alert('⏰ Daily bonus 24 hours baad milega!');
        return;
    }
    
    const bonus = 200 + Math.floor(Math.random() * 300);
    users[currentUser].points += bonus;
    localStorage.setItem(`lastBonus_${currentUser}`, now);
    saveUsers();
    updateUI();
    showNotification(`🎁 Daily Bonus: +${bonus} FREE POINTS!`);
}

// Leaderboard
function loadLeaderboard() {
    const sortedUsers = Object.entries(users)
        .sort(([,a], [,b]) => b.points - a.points)
        .slice(0, 10);
    
    const list = document.getElementById('leaderboardList');
    list.innerHTML = sortedUsers.map(([username, data], index) => `
        <div class="leader-item">
            <span>${index + 1}. ${username}</span>
            <span>${data.points} PTS</span>
        </div>
    `).join('');
}

// Update UI
function updateUI() {
    if (currentUser) {
        document.getElementById('username').textContent = currentUser.toUpperCase();
        document.getElementById('points').textContent = `${users[currentUser].points} PTS`;
    }
    loadLeaderboard();
}

// Notification
function showNotification(message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #4ecdc4; 
        color: white; padding: 20px 30px; border-radius: 10px; 
        font-weight: 600; z-index: 10000; transform: translateX(400px);
        transition: transform 0.3s;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notif.remove();
    }, 4000);
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('gameModal');
    if (event.target == modal) {
        closeGameModal();
    }
}