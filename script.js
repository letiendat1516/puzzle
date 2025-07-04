// Puzzle Game Main Script
class PuzzleGame {
  constructor() {
      this.state = {
          isCompleted: false,  // ✅ Changed from 'solved' to match Gist format
          winner: null,
          completedAt: null    // ✅ Changed from 'solvedAt' to match Gist format
      };
      this.isLoading = false;
      this.lastSubmissionTime = 0;
      this.retryCount = 0;
      
      this.init();
  }

  async init() {
      console.log('🎮 Initializing Puzzle Game...');
      
      // Validate configuration
      if (!ConfigHelper.isValid()) {
          this.showError('Cấu hình game không hợp lệ. Vui lòng kiểm tra lại.');
          return;
      }

      // Load initial state
      await this.checkGameState();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Update UI
      this.updateUI();
      
      console.log('✅ Puzzle Game initialized successfully');
  }

  setupEventListeners() {
      const form = document.getElementById('puzzleForm');
      const submitBtn = document.getElementById('submitBtn');
      const showHintsBtn = document.getElementById('showHints');
      const refreshBtn = document.getElementById('refreshBtn');

      if (form) {
          form.addEventListener('submit', (e) => this.handleSubmit(e));
      }

      if (submitBtn) {
          submitBtn.addEventListener('click', (e) => this.handleSubmit(e));
      }

      if (showHintsBtn) {
          showHintsBtn.addEventListener('click', () => this.toggleHints());
      }

      if (refreshBtn) {
          refreshBtn.addEventListener('click', () => this.refreshGameState());
      }

      // Auto-refresh every 30 seconds
      setInterval(() => this.checkGameState(), 30000);
  }

  async checkGameState() {
      try {
          this.isLoading = true;
          this.showLoading('Đang kiểm tra trạng thái game...');

          const response = await this.fetchWithRetry(ConfigHelper.getGistUrl(), {
              headers: {
                  'Authorization': `Bearer ${CONFIG.github.token}`,
                  'Accept': 'application/vnd.github.v3+json',
                  'X-GitHub-Api-Version': '2022-11-28'
              }
          });

          if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const gistData = await response.json();
          const fileContent = gistData.files[CONFIG.github.filename];

          if (fileContent && fileContent.content) {
              const gistState = JSON.parse(fileContent.content);
              
              // ✅ Updated mapping to match Gist format
              this.state = {
                  isCompleted: gistState.isCompleted || false,
                  winner: gistState.winner,
                  completedAt: gistState.completedAt
              };

              // Cache state locally
              localStorage.setItem('puzzleGameState', JSON.stringify(this.state));
              console.log('✅ Game state loaded:', this.state);
          }

          this.updateUI();
          this.hideLoading();

      } catch (error) {
          console.error('Failed to check game state:', error);
          this.showError("Không thể kiểm tra trạng thái game. Đang sử dụng dữ liệu cache.");
          
          // Try to load from cache
          const cachedState = localStorage.getItem('puzzleGameState');
          if (cachedState) {
              this.state = JSON.parse(cachedState);
              this.updateUI();
          }
          
          this.hideLoading();
      } finally {
          this.isLoading = false;
      }
  }

  async handleSubmit(event) {
      event.preventDefault();

      // Check cooldown
      const now = Date.now();
      if (now - this.lastSubmissionTime < CONFIG.security.submissionCooldown) {
          this.showError('Vui lòng đợi một chút trước khi gửi lại.');
          return;
      }

      // Check if game is already completed
      if (this.state.isCompleted) {
          this.showError('Game đã kết thúc. Không thể gửi thêm câu trả lời.');
          return;
      }

      // Get form data
      const formData = this.getFormData();
      if (!formData) return;

      // Validate answer
      const correctAnswer = ConfigHelper.getCorrectAnswer();
      if (!correctAnswer) {
          this.showError('Lỗi hệ thống: Không thể xác thực câu trả lời.');
          return;
      }

      const isCorrect = formData.answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

      if (isCorrect) {
          await this.handleCorrectAnswer(formData);
      } else {
          this.handleIncorrectAnswer();
      }

      this.lastSubmissionTime = now;
  }

  getFormData() {
      const name = document.getElementById('playerName')?.value || '';
      const email = document.getElementById('playerEmail')?.value || '';
      const answer = document.getElementById('playerAnswer')?.value || '';

      // Sanitize inputs
      const sanitizedData = {
          name: ConfigHelper.sanitizeInput(name),
          email: ConfigHelper.sanitizeInput(email),
          answer: ConfigHelper.sanitizeInput(answer)
      };

      // Validate
      if (!ConfigHelper.isValidName(sanitizedData.name)) {
          this.showError('Tên không hợp lệ. Vui lòng nhập từ 2-50 ký tự.');
          return null;
      }

      if (!ConfigHelper.isValidEmail(sanitizedData.email)) {
          this.showError('Email không hợp lệ.');
          return null;
      }

      if (!ConfigHelper.isValidAnswer(sanitizedData.answer)) {
          this.showError('Câu trả lời không hợp lệ.');
          return null;
      }

      return sanitizedData;
  }

  async handleCorrectAnswer(formData) {
      try {
          this.showLoading('Đang xử lý câu trả lời đúng...');

          const completedAt = new Date().toISOString();
          const winnerInfo = `${formData.name} (${formData.email})`;

          // Update Gist
          await this.updateGist(winnerInfo, completedAt);

          // Update local state
          this.state = {
              isCompleted: true,
              winner: winnerInfo,
              completedAt: completedAt
          };

          // Cache state
          localStorage.setItem('puzzleGameState', JSON.stringify(this.state));

          // Update UI
          this.updateUI();
          this.showSuccess(`🎉 Chúc mừng ${formData.name}! Bạn đã giải đúng câu đố và giành được ${CONFIG.puzzle.prizeAmount}!`);

          // Clear form
          this.clearForm();

      } catch (error) {
          console.error('Failed to handle correct answer:', error);
          this.showError('Có lỗi xảy ra khi xử lý câu trả lời. Vui lòng thử lại.');
      } finally {
          this.hideLoading();
      }
  }

  async updateGist(winner, completedAt) {
      const payload = {
          files: {
              [CONFIG.github.filename]: {
                  content: JSON.stringify({
                      isCompleted: true,     // ✅ Changed from 'solved' to match format
                      winner: winner,
                      completedAt: completedAt // ✅ Changed from 'solvedAt' to match format
                  }, null, 2)
              }
          }
      };

      const response = await this.fetchWithRetry(ConfigHelper.getGistUrl(), {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${CONFIG.github.token}`,
              'Accept': 'application/vnd.github.v3+json',
              'X-GitHub-Api-Version': '2022-11-28'
          },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
          const errorText = await response.text();
          console.error('Gist update failed:', response.status, errorText);
          throw new Error(`Failed to update Gist: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Gist updated successfully:', result.updated_at);
      return result;
  }

  handleIncorrectAnswer() {
      const messages = [
          'Câu trả lời chưa chính xác. Hãy thử lại! 🤔',
          'Sai rồi! Đọc kỹ đề bài và thử lại nhé! 💭',
          'Chưa đúng! Có thể gợi ý sẽ giúp bạn! 💡'
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      this.showError(randomMessage);
  }

  async fetchWithRetry(url, options, maxRetries = CONFIG.github.maxRetries) {
      for (let i = 0; i <= maxRetries; i++) {
          try {
              const response = await fetch(url, options);
              
              if (response.status === 403) {
                  const resetTime = response.headers.get('X-RateLimit-Reset');
                  if (resetTime) {
                      const waitTime = (parseInt(resetTime) * 1000) - Date.now();
                      if (waitTime > 0 && waitTime < 60000) { // Wait max 1 minute
                          console.log(`Rate limited. Waiting ${Math.ceil(waitTime/1000)} seconds...`);
                          await this.sleep(waitTime);
                          continue;
                      }
                  }
              }
              
              return response;
              
          } catch (error) {
              console.error(`Attempt ${i + 1} failed:`, error);
              
              if (i === maxRetries) {
                  throw error;
              }
              
              const delay = CONFIG.github.retryDelay * Math.pow(2, i);
              console.log(`Retrying in ${delay}ms...`);
              await this.sleep(delay);
          }
      }
  }

  sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }

  updateUI() {
      const gameStatus = document.getElementById('gameStatus');
      const submitBtn = document.getElementById('submitBtn');
      const form = document.getElementById('puzzleForm');

      if (this.state.isCompleted) {
          // Game completed
          if (gameStatus) {
              gameStatus.innerHTML = `
                  <div class="alert alert-success">
                      <h4>🏆 Game Đã Kết Thúc!</h4>
                      <p><strong>Người chiến thắng:</strong> ${this.state.winner}</p>
                      <p><strong>Thời gian:</strong> ${new Date(this.state.completedAt).toLocaleString('vi-VN')}</p>
                      <p><strong>Phần thưởng:</strong> ${CONFIG.puzzle.prizeAmount}</p>
                  </div>
              `;
          }

          if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.textContent = 'Game Đã Kết Thúc';
          }

          if (form) {
              const inputs = form.querySelectorAll('input, textarea');
              inputs.forEach(input => input.disabled = true);
          }
      } else {
          // Game active
          if (gameStatus) {
              gameStatus.innerHTML = `
                  <div class="alert alert-info">
                      <h4>🎯 Game Đang Diễn Ra</h4>
                      <p>Hãy trả lời câu đố để giành phần thưởng <strong>${CONFIG.puzzle.prizeAmount}</strong>!</p>
                  </div>
              `;
          }

          if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Gửi Câu Trả Lời';
          }

          if (form) {
              const inputs = form.querySelectorAll('input, textarea');
              inputs.forEach(input => input.disabled = false);
          }
      }
  }

  toggleHints() {
      const hintsContainer = document.getElementById('hintsContainer');
      const showHintsBtn = document.getElementById('showHints');
      
      if (hintsContainer && showHintsBtn) {
          if (hintsContainer.style.display === 'none' || !hintsContainer.style.display) {
              hintsContainer.style.display = 'block';
              showHintsBtn.textContent = 'Ẩn Gợi Ý';
              
              // Populate hints
              const hintsList = hintsContainer.querySelector('.hints-list');
              if (hintsList && CONFIG.puzzle.hints) {
                  hintsList.innerHTML = CONFIG.puzzle.hints
                      .map(hint => `<li>${hint}</li>`)
                      .join('');
              }
          } else {
              hintsContainer.style.display = 'none';
              showHintsBtn.textContent = 'Hiện Gợi Ý';
          }
      }
  }

  async refreshGameState() {
      const refreshBtn = document.getElementById('refreshBtn');
      if (refreshBtn) {
          refreshBtn.disabled = true;
          refreshBtn.textContent = 'Đang Làm Mới...';
      }

      await this.checkGameState();

      if (refreshBtn) {
          refreshBtn.disabled = false;
          refreshBtn.textContent = 'Làm Mới';
      }
  }

  clearForm() {
      const form = document.getElementById('puzzleForm');
      if (form) {
          form.reset();
      }
  }

  showLoading(message = 'Đang xử lý...') {
      const loadingEl = document.getElementById('loadingMessage');
      if (loadingEl) {
          loadingEl.textContent = message;
          loadingEl.style.display = 'block';
      }
  }

  hideLoading() {
      const loadingEl = document.getElementById('loadingMessage');
      if (loadingEl) {
          loadingEl.style.display = 'none';
      }
  }

  showError(message) {
      this.showMessage(message, 'error');
  }

  showSuccess(message) {
      this.showMessage(message, 'success');
  }

  showMessage(message, type = 'info') {
      // Remove existing messages
      const existingMessages = document.querySelectorAll('.game-message');
      existingMessages.forEach(msg => msg.remove());

      // Create new message
      const messageEl = document.createElement('div');
      messageEl.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} game-message`;
      messageEl.textContent = message;
      messageEl.style.position = 'fixed';
      messageEl.style.top = '20px';
      messageEl.style.right = '20px';
      messageEl.style.zIndex = '9999';
      messageEl.style.maxWidth = '400px';

      document.body.appendChild(messageEl);

      // Auto remove after timeout
      setTimeout(() => {
          if (messageEl && messageEl.parentNode) {
              messageEl.remove();
          }
      }, CONFIG.ui.messageTimeout);
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Starting Puzzle Game...');
  
  // Check if required elements exist
  const requiredElements = ['puzzleForm', 'submitBtn', 'gameStatus'];
  const missingElements = requiredElements.filter(id => !document.getElementById(id));
  
  if (missingElements.length > 0) {
      console.error('Missing required elements:', missingElements);
      alert('Lỗi: Không tìm thấy các thành phần cần thiết của game.');
      return;
  }
  
  // Initialize game
  window.puzzleGame = new PuzzleGame();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PuzzleGame;
}
