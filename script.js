class SkullKingGame {
    constructor() {
        this.players = [];
        this.currentRound = 1;
        this.colors = [
            '#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a',
            '#feca57', '#ff6b6b', '#ee5a6f', '#c44569', '#786fa6'
        ];
        
        this.attachEventListeners();
    }

    attachEventListeners() {
        document.getElementById('addPlayer').addEventListener('click', () => this.addPlayer());
        document.getElementById('playerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('nextRound').addEventListener('click', () => this.nextRound());
        document.getElementById('resetGame').addEventListener('click', () => this.resetGame());
    }

    addPlayer() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput.value.trim();

        if (!name) {
            alert('Please enter a player name!');
            return;
        }

        if (this.players.some(p => p.name === name)) {
            alert('Player name already exists!');
            return;
        }

        const player = {
            name: name,
            color: this.colors[this.players.length % this.colors.length],
            rounds: [],
            totalScore: 0
        };

        this.players.push(player);
        this.updatePlayerList();
        nameInput.value = '';
        nameInput.focus();

        if (this.players.length >= 2) {
            document.getElementById('startGame').style.display = 'block';
        }
    }

    removePlayer(index) {
        this.players.splice(index, 1);
        this.updatePlayerList();
        
        if (this.players.length < 2) {
            document.getElementById('startGame').style.display = 'none';
        }
    }

    updatePlayerList() {
        const playerList = document.getElementById('playerList');
        playerList.innerHTML = '';

        this.players.forEach((player, index) => {
            const tag = document.createElement('div');
            tag.className = 'player-tag';
            tag.style.backgroundColor = player.color;
            tag.innerHTML = `
                ${player.name}
                <button onclick="game.removePlayer(${index})">×</button>
            `;
            playerList.appendChild(tag);
        });
    }

    startGame() {
        if (this.players.length < 2) {
            alert('Need at least 2 players to start!');
            return;
        }

        document.getElementById('setupSection').style.display = 'none';
        document.getElementById('gameSection').style.display = 'block';
        
        this.createPlayerInputs();
        this.updateDisplay();
        this.initCanvas();
        this.drawGraph();
    }

    createPlayerInputs() {
        const container = document.getElementById('playerInputs');
        container.innerHTML = '';

        this.players.forEach((player, index) => {
            const card = document.createElement('div');
            card.className = 'player-input-card';
            card.style.borderLeftColor = player.color;
            card.innerHTML = `
                <h4>${player.name}</h4>
                <div class="input-row">
                    <div class="input-group">
                        <label>Bet</label>
                        <input type="number" id="bet-${index}" min="0" max="10" placeholder="0-10">
                    </div>
                    <div class="input-group">
                        <label>Won</label>
                        <input type="number" id="tricks-${index}" min="0" max="10" placeholder="0-10">
                    </div>
                </div>
                <div class="player-score-display" id="score-display-${index}"></div>
            `;
            container.appendChild(card);

            const betInput = document.getElementById(`bet-${index}`);
            const tricksInput = document.getElementById(`tricks-${index}`);
            
            betInput.addEventListener('input', () => this.updateScoreDisplay(index));
            tricksInput.addEventListener('input', () => this.updateScoreDisplay(index));
        });
    }

    updateScoreDisplay(playerIndex) {
        const bet = parseInt(document.getElementById(`bet-${playerIndex}`).value);
        const tricks = parseInt(document.getElementById(`tricks-${playerIndex}`).value);
        const display = document.getElementById(`score-display-${playerIndex}`);

        if (isNaN(bet) || isNaN(tricks)) {
            display.textContent = '';
            return;
        }

        const score = this.calculateScore(bet, tricks);
        const newTotal = this.players[playerIndex].totalScore + score;
        display.textContent = `This round: ${score >= 0 ? '+' : ''}${score} (New total: ${newTotal})`;
        display.style.color = score >= 0 ? '#4caf50' : '#f44336';
    }

    calculateScore(bet, tricks) {
        if (bet === tricks) {
            return bet === 0 ? 10 * this.currentRound : 20 * bet;
        } else {
            return -10 * Math.abs(bet - tricks);
        }
    }

    nextRound() {
        let allValid = true;

        const roundData = this.players.map((player, index) => {
            const bet = parseInt(document.getElementById(`bet-${index}`).value);
            const tricks = parseInt(document.getElementById(`tricks-${index}`).value);

            if (isNaN(bet) || isNaN(tricks) || bet < 0 || tricks < 0 || bet > 10 || tricks > 10) {
                allValid = false;
                return null;
            }

            return { bet, tricks };
        });

        if (!allValid) {
            alert('Please enter valid scores (0-10) for all players!');
            return;
        }

        this.players.forEach((player, index) => {
            const { bet, tricks } = roundData[index];
            const score = this.calculateScore(bet, tricks);
            
            player.rounds.push({
                round: this.currentRound,
                bet,
                tricks,
                score,
            });
            
            player.totalScore += score;
        });

        this.currentRound++;
        this.createPlayerInputs();
        this.updateDisplay();
        this.drawGraph();
    }

    updateDisplay() {
        document.getElementById('currentRound').textContent = this.currentRound;
        document.getElementById('inputRoundNumber').textContent = this.currentRound;
        this.updateLeaderboard();
        this.updateHistory();
    }

    updateLeaderboard() {
        const sortedPlayers = [...this.players].sort((a, b) => b.totalScore - a.totalScore);
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';

        sortedPlayers.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="leaderboard-rank">${this.getRankEmoji(index)}</span>
                <span class="leaderboard-name" style="color: ${player.color};">⬤ ${player.name}</span>
                <span class="leaderboard-score">${player.totalScore}</span>
            `;
            leaderboardList.appendChild(item);
        });
    }

    getRankEmoji(rank) {
        const emojis = ['🥇', '🥈', '🥉'];
        return emojis[rank] || `${rank + 1}.`;
    }

    updateHistory() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';

        if (this.currentRound === 1) {
            historyList.innerHTML = '<p style="text-align: center; color: #999;">No rounds played yet</p>';
            return;
        }

        for (let round = this.currentRound - 1; round >= 1; round--) {
            const roundDiv = document.createElement('div');
            roundDiv.style.marginBottom = '20px';
            roundDiv.innerHTML = `<h4 style="color: #667eea;">Round ${round}</h4>`;

            this.players.forEach(player => {
                const roundData = player.rounds[round - 1];
                if (roundData) {
                    const item = document.createElement('div');
                    item.className = `history-item ${roundData.bet === roundData.tricks ? 'success' : 'fail'}`;
                    item.style.borderLeftColor = player.color;
                    
                    item.innerHTML = `
                        <div>
                            <span style="color: ${player.color}; font-weight: bold;">⬤ ${player.name}</span>
                            <span class="history-details"> - Bet: ${roundData.bet}, Won: ${roundData.tricks}</span>
                        </div>
                        <div>
                            <span class="history-score ${roundData.score >= 0 ? 'positive' : 'negative'}">
                                ${roundData.score >= 0 ? '+' : ''}${roundData.score}
                            </span>
                        </div>
                    `;
                    
                    roundDiv.appendChild(item);
                }
            });

            historyList.appendChild(roundDiv);
        }
    }

    initCanvas() {
        this.canvas = document.getElementById('scoreGraph');
        this.ctx = this.canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    drawGraph() {
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        this.ctx.clearRect(0, 0, width, height);

        if (this.currentRound === 1) {
            this.ctx.fillStyle = '#999';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('No data yet. Complete the first round!', width / 2, height / 2);
            return;
        }

        const padding = 50;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;

        const allScores = this.players.flatMap(player => {
            const scores = [0];
            player.rounds.forEach(round => {
                scores.push(scores[scores.length - 1] + round.score);
            });
            return scores;
        });

        const maxScore = Math.max(...allScores, 50);
        const minScore = Math.min(...allScores, -50);
        const scoreRange = maxScore - minScore || 100;

        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (graphHeight / 5) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(width - padding, y);
            this.ctx.stroke();
        }

        const zeroY = padding + graphHeight * (1 - (0 - minScore) / scoreRange);
        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(padding, zeroY);
        this.ctx.lineTo(width - padding, zeroY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.players.forEach(player => {
            const scores = [0];
            player.rounds.forEach(round => {
                scores.push(scores[scores.length - 1] + round.score);
            });

            this.ctx.strokeStyle = player.color;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();

            scores.forEach((score, index) => {
                const x = padding + (graphWidth / (this.currentRound - 1)) * index;
                const y = padding + graphHeight * (1 - (score - minScore) / scoreRange);

                if (index === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            });

            this.ctx.stroke();

            scores.forEach((score, index) => {
                const x = padding + (graphWidth / (this.currentRound - 1)) * index;
                const y = padding + graphHeight * (1 - (score - minScore) / scoreRange);

                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 5, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.strokeStyle = player.color;
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            });
        });

        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        for (let i = 0; i < this.currentRound; i++) {
            const x = padding + (graphWidth / (this.currentRound - 1)) * i;
            this.ctx.fillText(`R${i}`, x, height - padding + 20);
        }
    }

    resetGame() {
        if (!confirm('Start a new game? This will reset all scores.')) {
            return;
        }

        this.players = [];
        this.currentRound = 1;
        
        document.getElementById('setupSection').style.display = 'block';
        document.getElementById('gameSection').style.display = 'none';
        document.getElementById('startGame').style.display = 'none';
        document.getElementById('playerName').value = '';
        this.updatePlayerList();
    }
}

window.addEventListener('resize', () => {
    if (game && game.canvas) {
        game.initCanvas();
        game.drawGraph();
    }
});

const game = new SkullKingGame();
