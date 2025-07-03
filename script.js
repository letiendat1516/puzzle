// Main JavaScript for Puzzle Game
class PuzzleGame {
    constructor() {
        this.isLoading = false;
        this.lastSubmissionTime = 0;
        this.state = {
            isCompleted: false,
            winner: null,
            completedAt: null
        };
        
        this.init();
    }

    async init() {
        // Validate configuration first
        if (!ConfigHelper.isValid()) {
            this.showError("Cấu hình ứng dụng chưa đúng. Vui lòng kiểm tra lại.");
            return;
        }

        // Load puzzle question
        this.loadPuzzleQuestion();
        
        // Check state from localStorage first (for quick loading)
        this.loadCachedState();
        
        // Then check from GitHub Gist
        await this.checkGameState();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Hide loading overlay
        this.hideLoading();
    }

    loadPuzzleQuestion() {
        const questionElement = document.getElementById('puzzle-question');
        const prizeElement = document.getElementById('prize-amount');
        const winnerPrizeElement = document.getElementById('winner-prize');
        
        if (questionElement) {
            questionElement.textContent = CONFIG.puzzle.question;
        }
        
        if (prizeElement) {
            prizeElement.textContent = `Phần thưởng: ${CONFIG.puzzle.prizeAmount}`;
        }
        
        if (winnerPrizeElement) {
            winnerPrizeElement.textContent = `Phần thưởng: ${CONFIG.puzzle.prizeAmount}`;
        }
    }

    loadCachedState() {
        try {
            const cached = localStorage.getItem('puzzleGameState');
            if (cached) {
                this.state = JSON.parse(cached);
                this.updateUI();
            }
        } catch (e) {
            console.warn('Failed to load cached state:', e);
        }
    }

    async checkGameState() {
        try {
            this.isLoading = true;
            const response = await this.fetchWithRetry(ConfigHelper.getGistUrl());
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const gistData = await response.json();
            const fileContent = gistData.files[CONFIG.github.filename];
            
            if (fileContent && fileContent.content) {
                const gameState = JSON.parse(fileContent.content);
                this.state = gameState;
                
                // Cache the state
                localStorage.setItem('puzzleGameState', JSON.stringify(gameState));
            }
            
            this.updateUI();
        } catch (error) {
            console.error('Failed to check game state:', error);
            this.showError("Không thể kiểm tra trạng thái game. Vui lòng thử lại.");
        } finally {
            this.isLoading = false;
        }
    }

    async fetchWithRetry(url, options = {}, retries = CONFIG.github.maxRetries) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                return response;
            } catch (error) {
                if (i === retries - 1) throw error;
                await this.delay(CONFIG.github.retryDelay * (i + 1));
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateUI() {
        const openStatus = document.getElementById('open-status');
        const closedStatus = document.getElementById('closed-status');
        const puzzleSection = document.getElementById('puzzle-section');
        const winnerSection = document.getElementById('winner-section');
        const congratsSection = document.getElementById('congratulations-section');

        if (this.state.isCompleted && this.state.winner) {
            // Game is completed
            openStatus.style.display = 'none';
            closedStatus.style.display = 'block';
            puzzleSection.style.display = 'none';
            winnerSection.style.display = 'block';
            congratsSection.style.display = 'none';
            
            this.displayWinnerInfo();
        } else {
            // Game is still open
            openStatus.style.display = 'block';
            closedStatus.style.display = 'none';
            puzzleSection.style.display = 'block';
            winnerSection.style.display = 'none';
            congratsSection.style.display = 'none';
        }
    }

    displayWinnerInfo() {
        const winnerNameElement = document.getElementById('winner-name');
        const winnerTimeElement = document.getElementById('winner-time');
        
        if (this.state.winner && winnerNameElement && winnerTimeElement) {
            winnerNameElement.textContent = this.state.winner.name;
            
            const completedDate = new Date(this.state.completedAt);
            const formattedTime = completedDate.toLocaleString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            winnerTimeElement.textContent = `Giải đúng vào: ${formattedTime}`;
        }
    }

    setupEventListeners() {
        const form = document.getElementById('answer-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Input validation
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateInput(input));
            input.addEventListener('blur', () => this.validateInput(input));
        });
    }

    validateInput(input) {
        const value = input.value.trim();
        input.classList.remove('error');
        
        switch (input.id) {
            case 'player-name':
                if (!ConfigHelper.isValidName(value)) {
                    input.classList.add('error');
                }
                break;
            case 'player-email':
                if (!ConfigHelper.isValidEmail(value)) {
                    input.classList.add('error');
                }
                break;
            case 'player-answer':
                if (!ConfigHelper.isValidAnswer(value)) {
                    input.classList.add('error');
                }
                break;
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        // Check submission cooldown
        const now = Date.now();
        if (now - this.lastSubmissionTime < CONFIG.security.submissionCooldown) {
            this.showError("Vui lòng chờ một chút trước khi gửi lại.");
            return;
        }
        
        if (this.isLoading) {
            return;
        }

        // Get form data
        const formData = new FormData(event.target);
        const name = ConfigHelper.sanitizeInput(formData.get('name'));
        const email = ConfigHelper.sanitizeInput(formData.get('email'));
        const answer = ConfigHelper.sanitizeInput(formData.get('answer'));

        // Validate inputs
        if (!ConfigHelper.isValidName(name)) {
            this.showError("Tên không hợp lệ. Vui lòng nhập từ 2-50 ký tự.");
            return;
        }

        if (!ConfigHelper.isValidEmail(email)) {
            this.showError("Email không hợp lệ.");
            return;
        }

        if (!ConfigHelper.isValidAnswer(answer)) {
            this.showError("Đáp án không hợp lệ.");
            return;
        }

        // Check if answer is correct
        const correctAnswer = ConfigHelper.getCorrectAnswer();
        if (!correctAnswer) {
            this.showError("Lỗi hệ thống. Vui lòng thử lại.");
            return;
        }

        if (answer.toLowerCase().trim() !== correctAnswer.toLowerCase().trim()) {
            this.showError("Đáp án không chính xác. Hãy thử lại!");
            this.lastSubmissionTime = now;
            return;
        }

        // Answer is correct, try to submit
        await this.submitWinner(name, email);
        this.lastSubmissionTime = now;
    }

    async submitWinner(name, email) {
        try {
            this.isLoading = true;
            this.showLoading("Đang kiểm tra và gửi kết quả...");

            // Check current state first
            await this.checkGameState();

            if (this.state.isCompleted) {
                this.hideLoading();
                this.showError("Rất tiếc! Đã có người giải đúng trước bạn.");
                this.updateUI();
                return;
            }

            // Prepare winner data
            const winnerData = {
                isCompleted: true,
                winner: {
                    name: name,
                    email: email
                },
                completedAt: new Date().toISOString()
            };

            // Update Gist
            const updateResponse = await this.updateGist(winnerData);
            
            if (updateResponse.ok) {
                this.state = winnerData;
                localStorage.setItem('puzzleGameState', JSON.stringify(winnerData));
                
                this.hideLoading();
                this.showCongratulations();
            } else {
                throw new Error('Failed to update Gist');
            }

        } catch (error) {
            console.error('Failed to submit winner:', error);
            this.hideLoading();
            this.showError("Có lỗi xảy ra khi gửi kết quả. Vui lòng thử lại.");
        } finally {
            this.isLoading = false;
        }
    }

    async updateGist(data) {
        const payload = {
            files: {
                [CONFIG.github.filename]: {
                    content: JSON.stringify(data, null, 2)
                }
            }
        };

        return await this.fetchWithRetry(ConfigHelper.getGistUrl(), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
    }

    showCongratulations() {
        const congratsSection = document.getElementById('congratulations-section');
        const puzzleSection = document.getElementById('puzzle-section');
        const openStatus = document.getElementById('open-status');
        
        if (congratsSection && puzzleSection && openStatus) {
            puzzleSection.style.display = 'none';
            openStatus.style.display = 'none';
            congratsSection.style.display = 'block';
            
            // Auto-refresh to winner view after 5 seconds
            setTimeout(() => {
                this.updateUI();
            }, 5000);
        }
    }

    showLoading(message = "Đang tải...") {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            const text = overlay.querySelector('p');
            if (text) {
                text.textContent = message;
            }
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        const messageEl = document.getElementById(`${type}-message`);
        const textEl = document.getElementById(`${type}-text`);
        
        if (messageEl && textEl) {
            textEl.textContent = message;
            messageEl.style.display = 'flex';
            
            // Auto-hide after timeout
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, CONFIG.ui.messageTimeout);
        }
    }
}

// Global functions for UI interactions
function hideError() {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
        errorEl.style.display = 'none';
    }
}

function hideSuccess() {
    const successEl = document.getElementById('success-message');
    if (successEl) {
        successEl.style.display = 'none';
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PuzzleGame();
});