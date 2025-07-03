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
        // You need to create a public Gist and put its ID here
        // Example: https://gist.github.com/username/abc123def456 -> gistId is "abc123def456"
        gistId: "cf16e4873c813f9a5763b834d7ab6061", // Replace with your actual Gist ID
        filename: "puzzle_state.json", // Filename in the Gist
        
        // GitHub API endpoints
        apiBase: "https://api.github.com",
        
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

    // Get Gist API URL
    getGistUrl() {
        return `${CONFIG.github.apiBase}/gists/${CONFIG.github.gistId}`;
    },

    // Validate configuration
    isValid() {
        const errors = [];
        
        if (!CONFIG.github.gistId || CONFIG.github.gistId === "YOUR_GIST_ID_HERE") {
            errors.push("GitHub Gist ID is not configured");
        }
        
        if (!CONFIG.puzzle.question || CONFIG.puzzle.question.trim() === "") {
            errors.push("Puzzle question is empty");
        }
        
        if (!CONFIG.puzzle.encodedAnswer || CONFIG.puzzle.encodedAnswer.trim() === "") {
            errors.push("Puzzle answer is not configured");
        }
        
        if (errors.length > 0) {
            console.error("Configuration errors:", errors);
            return false;
        }
        
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
    }
};

// Export configuration for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ConfigHelper };
}
