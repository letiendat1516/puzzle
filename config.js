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
        // Gist ID extracted from the URL above
        gistId: "cf16e4873c813f9a5763b834d7ab6061",
        filename: "puzzle_state.json", // Filename in the Gist
        owner: "letiendat1516", // Gist owner for reference
        
        // GitHub API endpoints
        apiBase: "https://api.github.com",
        gistBase: "https://gist.github.com",
        
        // Rate limiting settings
        maxRetries: 3,
        retryDelay: 1000 // milliseconds
    },

    // UI configuration
    ui: {
        loadingTimeout: 5000, // 5 seconds
        messageTimeout: 5000, // 5 seconds
        animationDuration: 300 // milliseconds
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
            // Gist ID should be 32 character hexadecimal string
            pattern: /^[a-f0-9]{32}$/
        }
    },

    // Security settings
    security: {
        // XSS protection - HTML tags will be stripped
        allowedChars: /^[a-zA-Z0-9\s\u00C0-\u1EF9@._-]+$/,
        
        // Rate limiting for submissions
        submissionCooldown: 3000 // 3 seconds between submissions
    }
};

// Helper functions for configuration
const ConfigHelper = {
    // Decode the answer for checking
    getCorrectAnswer() {
        try {
            return atob(CONFIG.puzzle.encodedAnswer);
        } catch (e) {
            console.error('Failed to decode answer:', e);
            return null;
        }
    },

    // Get Gist API URL for API calls
    getGistUrl() {
        return `${CONFIG.github.apiBase}/gists/${CONFIG.github.gistId}`;
    },

    // Get full Gist URL for browser access
    getFullGistUrl() {
        return `${CONFIG.github.gistBase}/${CONFIG.github.owner}/${CONFIG.github.gistId}`;
    },

    // Validate Gist ID format
    isValidGistId(gistId) {
        return CONFIG.validation.gistId.pattern.test(gistId);
    },

    // Validate configuration
    isValid() {
        const errors = [];
        
        if (!CONFIG.github.gistId || CONFIG.github.gistId === "cf16e4873c813f9a5763b834d7ab6061") {
            errors.push("GitHub Gist ID is not configured");
        } else if (!this.isValidGistId(CONFIG.github.gistId)) {
            errors.push("GitHub Gist ID format is invalid (must be 32 character hex string)");
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
        
        if (errors.length > 0) {
            console.error("Configuration errors:", errors);
            console.log("Current Gist URL:", this.getFullGistUrl());
            return false;
        }
        
        console.log("Configuration is valid. Gist URL:", this.getFullGistUrl());
        return true;
    },

    // Sanitize user input
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return '';
        }
        
        // Remove HTML tags and validate characters
        return input
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .trim()
            .substring(0, 200); // Limit length
    },

    // Validate email format
    isValidEmail(email) {
        return CONFIG.validation.email.pattern.test(email);
    },

    // Validate name
    isValidName(name) {
        const sanitized = this.sanitizeInput(name);
        return sanitized.length >= CONFIG.validation.name.minLength && 
               sanitized.length <= CONFIG.validation.name.maxLength;
    },

    // Validate answer
    isValidAnswer(answer) {
        const sanitized = this.sanitizeInput(answer);
        return sanitized.length >= CONFIG.validation.answer.minLength && 
               sanitized.length <= CONFIG.validation.answer.maxLength;
    },

    // Get configuration info for debugging
    getConfigInfo() {
        return {
            gistId: CONFIG.github.gistId,
            gistOwner: CONFIG.github.owner,
            gistApiUrl: this.getGistUrl(),
            gistBrowserUrl: this.getFullGistUrl(),
            filename: CONFIG.github.filename,
            isValid: this.isValid()
        };
    }
};

// Export configuration for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ConfigHelper };
}

// Log configuration status on load
console.log('Puzzle Game Configuration loaded:', ConfigHelper.getConfigInfo());
