// Configuration for the Puzzle Game
const CONFIG = {
  // Puzzle configuration
  puzzle: {
      question: "Tôi là con số có 3 chữ số. Chữ số hàng trăm gấp đôi chữ số hàng đơn vị. Tổng các chữ số của tôi là 15. Tôi là số nào?",
      // Answer is encoded in base64: "642" -> "NjQy"
      encodedAnswer: "NjQy",
      prizeAmount: "100,000 VNĐ",
      hints: [
          "Số có 3 chữ số",
          "Chữ số hàng trăm = 2 × chữ số hàng đơn vị",
          "Tổng các chữ số = 15"
      ]
  },

  // GitHub Gist configuration
  github: {
      // Current Gist: https://gist.github.com/letiendat1516/cf16e4873c813f9a5763b834d7ab6061
      gistId: "cf16e4873c813f9a5763b834d7ab6061",
      filename: "puzzle_state.json",
      owner: "letiendat1516",
      
      // ✅ Updated GitHub Personal Access Token
      token: "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",
      
      // GitHub API endpoints
      apiBase: "https://api.github.com",
      gistBase: "https://gist.github.com",
      
      // Rate limiting settings
      maxRetries: 3,
      retryDelay: 1000
  },

  // UI configuration
  ui: {
      loadingTimeout: 5000,
      messageTimeout: 5000,
      animationDuration: 300
  },

  // Validation rules
  validation: {
      name: {
          minLength: 2,
          maxLength: 50
      },
      email: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      answer: {
          minLength: 1,
          maxLength: 200
      },
      gistId: {
          pattern: /^[a-f0-9]{32}$/
      }
  },

  // Security settings
  security: {
      allowedChars: /^[a-zA-Z0-9\s\u00C0-\u1EF9@._-]+$/,
      submissionCooldown: 3000
  }
};

// Helper functions for configuration
const ConfigHelper = {
  getCorrectAnswer() {
      try {
          return atob(CONFIG.puzzle.encodedAnswer);
      } catch (e) {
          console.error('Failed to decode answer:', e);
          return null;
      }
  },

  getGistUrl() {
      return `${CONFIG.github.apiBase}/gists/${CONFIG.github.gistId}`;
  },

  getFullGistUrl() {
      return `${CONFIG.github.gistBase}/${CONFIG.github.owner}/${CONFIG.github.gistId}`;
  },

  isValidGistId(gistId) {
      return CONFIG.validation.gistId.pattern.test(gistId);
  },

  isValid() {
      const errors = [];
      
      if (!CONFIG.github.gistId || CONFIG.github.gistId === "YOUR_GIST_ID_HERE") {
          errors.push("GitHub Gist ID is not configured");
      } else if (!this.isValidGistId(CONFIG.github.gistId)) {
          errors.push("GitHub Gist ID format is invalid");
      }
      
      if (!CONFIG.github.owner || CONFIG.github.owner.trim() === "") {
          errors.push("GitHub Gist owner is not configured");
      }
      
      if (!CONFIG.puzzle.question || CONFIG.puzzle.question.trim() === "") {
          errors.push("Puzzle question is empty");
      }
      
      if (!CONFIG.puzzle.encodedAnswer || CONFIG.puzzle.encodedAnswer.trim() === "") {
          errors.push("Puzzle answer is not configured");
      }
      
      if (!CONFIG.github.token || CONFIG.github.token === "YOUR_GITHUB_TOKEN_HERE") {
          errors.push("GitHub token is not configured");
      }
      
      if (errors.length > 0) {
          console.error("Configuration errors:", errors);
          return false;
      }
      
      console.log("Configuration is valid. Gist URL:", this.getFullGistUrl());
      return true;
  },

  sanitizeInput(input) {
      if (typeof input !== 'string') {
          return '';
      }
      
      return input
          .replace(/<[^>]*>/g, '')
          .trim()
          .substring(0, 200);
  },

  isValidEmail(email) {
      return CONFIG.validation.email.pattern.test(email);
  },

  isValidName(name) {
      const sanitized = this.sanitizeInput(name);
      return sanitized.length >= CONFIG.validation.name.minLength && 
             sanitized.length <= CONFIG.validation.name.maxLength;
  },

  isValidAnswer(answer) {
      const sanitized = this.sanitizeInput(answer);
      return sanitized.length >= CONFIG.validation.answer.minLength && 
             sanitized.length <= CONFIG.validation.answer.maxLength;
  },

  getConfigInfo() {
      return {
          gistId: CONFIG.github.gistId,
          gistOwner: CONFIG.github.owner,
          gistApiUrl: this.getGistUrl(),
          gistBrowserUrl: this.getFullGistUrl(),
          filename: CONFIG.github.filename,
          hasToken: !!CONFIG.github.token,
          isValid: this.isValid()
      };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, ConfigHelper };
}

console.log('Puzzle Game Configuration loaded:', ConfigHelper.getConfigInfo());
