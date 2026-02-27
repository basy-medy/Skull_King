/**
 * Skull King Score Tracker
 * Brutalist Tech Aesthetic
 */

class SkullKingGame {
    constructor() {
        this.players = [];
        this.currentRound = 1;
        
        /* Brutalist Tech Color Palette
         * High contrast colors for the brutalist aesthetic
         */
        this.colors = [
            '#0A0A0A', // Black
            '#FF4D4D', // Red Coral
            '#50C878', // Green Bright
            '#404040', // Gray 70
            '#D9D936', // Neon Yellow Dark
            '#6b6b6b', // Gray 50
        ];
        
        this.darkColors = [
            '#000000', // Dark Black
            '#cc3d3d', // Dark Red
            '#40a060', // Dark Green
            '#2d2d2d', // Dark Gray
            '#b8b82e', // Dark Yellow
            '#525252', // Dark Gray 50
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
        document.getElementById('closeWinnerModal').addEventListener('click', () => this.resetGame());
    }

    addPlayer() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput.value.trim();

        if (!name) {
            this.showToast('Please enter a player name');
            return;
        }

        if (this.players.some(p => p.name === name)) {
            this.showToast('Player name already exists');
            return;
        }

        const colorIndex = this.players.length % this.colors.length;
        const player = {
            name: name,
            color: this.colors[colorIndex],
            darkColor: this.darkColors[colorIndex],
            rounds: [],
            totalScore: 0
        };

        this.players.push(player);
        this.updatePlayerList();
        nameInput.value = '';
        nameInput.focus();

        if (this.players.length >= 2) {
            const startBtn = document.getElementById('startGame');
            startBtn.style.display = 'inline-flex';
            startBtn.classList.add('animate-in');
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
            tag.innerHTML = `
                <span class="player-tag-color" style="background-color: ${player.color};"></span>
                <span>${player.name}</span>
                <button class="remove-btn" onclick="game.removePlayer(${index})" aria-label="Remove ${player.name}">×</button>
            `;
            playerList.appendChild(tag);
        });
    }

    startGame() {
        if (this.players.length < 2) {
            this.showToast('Need at least 2 players to start');
            return;
        }

        // Animate transition
        const setupSection = document.getElementById('setupSection');
        const gameSection = document.getElementById('gameSection');
        
        setupSection.style.animation = 'fade-out 0.3s ease forwards';
        
        setTimeout(() => {
            setupSection.style.display = 'none';
            gameSection.style.display = 'block';
            gameSection.style.animation = 'fadeIn 0.5s ease-out forwards';
            
            this.createPlayerInputs();
            this.updateDisplay();
            this.initCanvas();
            this.drawGraph();
        }, 300);
    }

    createPlayerInputs() {
        const container = document.getElementById('playerInputs');
        container.innerHTML = '';

        this.players.forEach((player, index) => {
            const card = document.createElement('div');
            card.className = 'score-card';
            card.innerHTML = `
                <div class="score-card-header">
                    <span class="score-card-color" style="background-color: ${player.color};"></span>
                    <span class="score-card-name">${player.name}</span>
                </div>
                <div class="score-inputs">
                    <div class="score-input-group">
                        <label for="bet-${index}">Bet</label>
                        <input type="number" id="bet-${index}" class="score-input" min="0" max="10" placeholder="0">
                    </div>
                    <div class="score-input-group">
                        <label for="tricks-${index}">Won</label>
                        <input type="number" id="tricks-${index}" class="score-input" min="0" max="10" placeholder="0">
                    </div>
                </div>
                <div class="score-preview" id="score-preview-${index}"></div>
            `;
            container.appendChild(card);

            const betInput = document.getElementById(`bet-${index}`);
            const tricksInput = document.getElementById(`tricks-${index}`);
            
            betInput.addEventListener('input', () => this.updateScorePreview(index));
            tricksInput.addEventListener('input', () => this.updateScorePreview(index));
        });
    }

    updateScorePreview(playerIndex) {
        const bet = parseInt(document.getElementById(`bet-${playerIndex}`).value);
        const tricks = parseInt(document.getElementById(`tricks-${playerIndex}`).value);
        const preview = document.getElementById(`score-preview-${playerIndex}`);

        if (isNaN(bet) || isNaN(tricks)) {
            preview.classList.remove('visible');
            return;
        }

        const score = this.calculateScore(bet, tricks);
        const newTotal = this.players[playerIndex].totalScore + score;
        
        preview.textContent = `${score >= 0 ? '+' : ''}${score} → TOTAL: ${newTotal}`;
        preview.className = `score-preview ${score >= 0 ? 'positive' : 'negative'} visible`;
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
            this.showToast('Please enter valid scores (0-10) for all players');
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
        
        if (this.currentRound > 10) {
            this.endGame();
            return;
        }
        
        this.createPlayerInputs();
        this.updateDisplay();
        this.drawGraph();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    endGame() {
        const sortedPlayers = [...this.players].sort((a, b) => b.totalScore - a.totalScore);
        const winner = sortedPlayers[0];
        
        this.showWinnerModal(sortedPlayers, winner);
        this.startConfetti();
        this.playWinningSound();
    }

    showWinnerModal(sortedPlayers, winner) {
        const modal = document.getElementById('winnerModal');
        const winnerNameEl = document.getElementById('winnerName');
        const winnerScoreEl = document.getElementById('winnerScore');
        const rankingsEl = document.getElementById('winnerRankings');
        
        winnerNameEl.textContent = winner.name;
        winnerScoreEl.textContent = `${winner.totalScore} POINTS`;
        
        rankingsEl.innerHTML = '';
        sortedPlayers.forEach((player, index) => {
            const rankItem = document.createElement('div');
            rankItem.className = 'winner-rank-item' + (index === 0 ? ' winner' : '');
            
            const rankDisplay = index === 0 ? '★' : `${index + 1}.`;
            
            rankItem.innerHTML = `
                <span class="winner-rank-position">${rankDisplay}</span>
                <span class="winner-rank-player">${player.name}</span>
                <span class="winner-rank-score">${player.totalScore}</span>
            `;
            rankingsEl.appendChild(rankItem);
        });
        
        modal.classList.add('active');
    }

    startConfetti() {
        const canvas = document.getElementById('confettiCanvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const particleCount = 120;
        
        // Brutalist tech color palette
        const colors = [
            '#F0F040', // Neon Yellow
            '#FF4D4D', // Red Coral
            '#50C878', // Green Bright
            '#0A0A0A', // Black
            '#FFFFFF', // White
        ];
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 2.5 + 1.5,
                speedX: Math.random() * 1.5 - 0.75,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 4 - 2,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.03 + 0.02
            });
        }
        
        let animationId;
        let startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            
            if (elapsed > 6000) {
                cancelAnimationFrame(animationId);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.y += p.speedY;
                p.x += Math.sin(p.wobble) * 0.5 + p.speedX;
                p.rotation += p.rotationSpeed;
                p.wobble += p.wobbleSpeed;
                
                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }
                
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                
                // Draw square (brutalist style - no rounded corners)
                const s = p.size;
                ctx.fillRect(-s/2, -s/2, s, s);
                
                ctx.restore();
            });
            
            animationId = requestAnimationFrame(animate);
        };
        
        animate();
        
        const resizeHandler = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeHandler);
        
        setTimeout(() => {
            window.removeEventListener('resize', resizeHandler);
        }, 6000);
    }

    playWinningSound() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const audioCtx = new AudioContext();
        
        const notes = [
            { freq: 523.25, duration: 120, delay: 0 },
            { freq: 659.25, duration: 120, delay: 120 },
            { freq: 783.99, duration: 120, delay: 240 },
            { freq: 1046.50, duration: 350, delay: 380 },
            { freq: 783.99, duration: 180, delay: 780 },
            { freq: 1046.50, duration: 500, delay: 1000 }
        ];
        
        notes.forEach(note => {
            setTimeout(() => {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.frequency.value = note.freq;
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + note.duration / 1000);
                
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + note.duration / 1000);
            }, note.delay);
        });
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
            
            const rankDisplay = index === 0 ? '★' : `${index + 1}`;
            
            item.innerHTML = `
                <span class="leaderboard-rank">${rankDisplay}</span>
                <div class="leaderboard-player">
                    <span class="leaderboard-color" style="background-color: ${player.color};"></span>
                    <span class="leaderboard-name">${player.name}</span>
                </div>
                <span class="leaderboard-score">${player.totalScore}</span>
            `;
            leaderboardList.appendChild(item);
        });
    }

    updateHistory() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';

        if (this.currentRound === 1) {
            historyList.innerHTML = '<div class="empty-state">NO ROUNDS COMPLETED YET</div>';
            return;
        }

        for (let round = this.currentRound - 1; round >= 1; round--) {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'history-round';
            
            const roundHeader = document.createElement('div');
            roundHeader.className = 'history-round-header';
            roundHeader.innerHTML = `
                <span class="history-round-number">R${round}</span>
                <span class="history-round-title">ROUND ${round}</span>
            `;
            roundDiv.appendChild(roundHeader);
            
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'history-items';
            
            this.players.forEach(player => {
                const roundData = player.rounds[round - 1];
                if (roundData) {
                    const item = document.createElement('div');
                    item.className = `history-item ${roundData.bet === roundData.tricks ? 'success' : 'fail'}`;
                    
                    item.innerHTML = `
                        <div class="history-player">
                            <span class="history-color" style="background-color: ${player.darkColor};"></span>
                            <span class="history-name">${player.name}</span>
                            <span class="history-details">BET ${roundData.bet} · WON ${roundData.tricks}</span>
                        </div>
                        <span class="history-score ${roundData.score >= 0 ? 'positive' : 'negative'}">
                            ${roundData.score >= 0 ? '+' : ''}${roundData.score}
                        </span>
                    `;
                    
                    itemsContainer.appendChild(item);
                }
            });
            
            roundDiv.appendChild(itemsContainer);
            historyList.appendChild(roundDiv);
        }
    }

    initCanvas() {
        this.canvas = document.getElementById('scoreGraph');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }

    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = 320 * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = '320px';
    }

    drawGraph() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const width = rect.width;
        const height = 320;
        
        this.ctx.clearRect(0, 0, width, height);

        if (this.currentRound === 1) {
            this.ctx.fillStyle = '#6b6b6b';
            this.ctx.font = '500 14px "JetBrains Mono", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('SCORE DATA WILL APPEAR AFTER ROUND 1', width / 2, height / 2);
            return;
        }

        const padding = { top: 40, right: 30, bottom: 50, left: 50 };
        const graphWidth = width - padding.left - padding.right;
        const graphHeight = height - padding.top - padding.bottom;

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

        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (graphHeight / 4) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(padding.left, y);
            this.ctx.lineTo(width - padding.right, y);
            this.ctx.stroke();
        }

        // Draw zero line
        const zeroY = padding.top + graphHeight * (1 - (0 - minScore) / scoreRange);
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([6, 6]);
        this.ctx.beginPath();
        this.ctx.moveTo(padding.left, zeroY);
        this.ctx.lineTo(width - padding.right, zeroY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw player lines
        this.players.forEach((player, playerIndex) => {
            const scores = [0];
            player.rounds.forEach(round => {
                scores.push(scores[scores.length - 1] + round.score);
            });

            this.ctx.strokeStyle = player.color;
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'square';
            this.ctx.lineJoin = 'miter';
            this.ctx.beginPath();

            scores.forEach((score, index) => {
                const x = padding.left + (graphWidth / (this.currentRound - 1)) * index;
                const y = padding.top + graphHeight * (1 - (score - minScore) / scoreRange);

                if (index === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            });

            this.ctx.stroke();

            // Draw points
            scores.forEach((score, index) => {
                const x = padding.left + (graphWidth / (this.currentRound - 1)) * index;
                const y = padding.top + graphHeight * (1 - (score - minScore) / scoreRange);

                this.ctx.fillStyle = '#F5F2E8';
                this.ctx.fillRect(x - 6, y - 6, 12, 12);

                this.ctx.strokeStyle = player.color;
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x - 5, y - 5, 10, 10);
            });
        });

        // Draw axis labels
        this.ctx.fillStyle = '#6b6b6b';
        this.ctx.font = '500 12px "JetBrains Mono", monospace';
        this.ctx.textAlign = 'center';
        
        for (let i = 0; i < this.currentRound; i++) {
            const x = padding.left + (graphWidth / (this.currentRound - 1)) * i;
            this.ctx.fillText(`R${i}`, x, height - padding.bottom + 20);
        }

        // Y-axis labels
        this.ctx.textAlign = 'right';
        this.ctx.fillStyle = '#525252';
        for (let i = 0; i <= 4; i++) {
            const value = maxScore - (scoreRange / 4) * i;
            const y = padding.top + (graphHeight / 4) * i;
            this.ctx.fillText(Math.round(value), padding.left - 12, y + 4);
        }
    }

    resetGame() {
        if (this.currentRound <= 10 && this.players.length > 0) {
            if (!confirm('Start a new game? All scores will be reset.')) {
                return;
            }
        }

        this.players = [];
        this.currentRound = 1;
        
        const modal = document.getElementById('winnerModal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        const canvas = document.getElementById('confettiCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        const setupSection = document.getElementById('setupSection');
        const gameSection = document.getElementById('gameSection');
        
        gameSection.style.display = 'none';
        setupSection.style.display = 'block';
        setupSection.style.animation = 'fadeIn 0.4s ease-out';
        
        document.getElementById('startGame').style.display = 'none';
        document.getElementById('playerName').value = '';
        this.updatePlayerList();
    }

    showToast(message) {
        alert(message);
    }
}

// Handle resize
window.addEventListener('resize', () => {
    if (game && game.canvas) {
        game.resizeCanvas();
        game.drawGraph();
    }
});

// Initialize game
const game = new SkullKingGame();

// Add fade-out animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-out {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
    
    .animate-in {
        animation: tagEnter 0.4s var(--ease-spring) forwards;
    }
    
    /* Bar chart decoration for header */
    .bar-chart-deco {
        display: flex;
        align-items: flex-end;
        gap: 4px;
        height: 40px;
    }
    
    .bar-chart-deco .bar {
        background: var(--white);
        width: 8px;
        transition: height 0.3s ease;
    }
    
    .bar-chart-deco .bar:nth-child(1) { height: 60%; }
    .bar-chart-deco .bar:nth-child(2) { height: 80%; }
    .bar-chart-deco .bar:nth-child(3) { height: 40%; }
    .bar-chart-deco .bar:nth-child(4) { height: 100%; }
    .bar-chart-deco .bar:nth-child(5) { height: 70%; }
`;
document.head.appendChild(style);
