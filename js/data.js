// ============================================
// X CODE — Data, Scoring & User Storage
// Created by SHADOW
// ============================================

const XCODE = {
    APP_NAME: 'X Code',
    VERSION: '2.0.0',
    CREATOR: 'SHADOW',

    // Scoring Points
    SCORING: {
        beginner: { base: 10, timeBonus: 5, firstTry: 5 },
        intermediate: { base: 25, timeBonus: 10, firstTry: 15 },
        expert: { base: 50, timeBonus: 25, firstTry: 30 }
    },

    // Rank Thresholds
    RANKS: [
        { name: 'Newbie', minScore: 0, icon: '🌱' },
        { name: 'Beginner', minScore: 100, icon: '📘' },
        { name: 'Coder', minScore: 500, icon: '💻' },
        { name: 'Developer', minScore: 1500, icon: '🔧' },
        { name: 'Pro', minScore: 3500, icon: '⚡' },
        { name: 'Expert', minScore: 7000, icon: '🧠' },
        { name: 'Master', minScore: 15000, icon: '👑' },
        { name: 'Legend', minScore: 25000, icon: '🏆' },
        { name: 'Shadow', minScore: 40000, icon: '🔥' }
    ],

    SOCIAL: {
        GITHUB: 'https://github.com',
        LINKEDIN: 'https://linkedin.com',
        INSTAGRAM: 'https://instagram.com'
    }
};

// ============================================
// USER DATABASE (localStorage based)
// ============================================

const UserDB = {
    // Get all registered users
    getAllUsers() {
        return JSON.parse(localStorage.getItem('xcode_users') || '[]');
    },

    // Save all users
    saveAllUsers(users) {
        localStorage.setItem('xcode_users', JSON.stringify(users));
    },

    // Find user by username
    findByUsername(username) {
        const users = this.getAllUsers();
        return users.find(u => u.username.toLowerCase() === username.toLowerCase());
    },

    // Find user by email
    findByEmail(email) {
        const users = this.getAllUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },

    // Create new user (Sign Up)
    createUser(username, email, password, avatar) {
        const users = this.getAllUsers();

        // Check if username taken
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            return { success: false, message: 'Username already taken!' };
        }

        // Check if email taken
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, message: 'Email already registered!' };
        }

        const newUser = {
            id: Date.now().toString(),
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: password, // Simple storage (no real auth)
            avatar: avatar || this.getRandomAvatar(),
            score: 0,
            rank: 'Newbie',
            rankIcon: '🌱',
            totalSolved: 0,
            solvedQuestions: [], // Array of { questionId, score, solvedAt, attempts, timeSpent }
            solvedByLevel: { beginner: 0, intermediate: 0, expert: 0 },
            solvedByCategory: { HTML: 0, CSS: 0, JavaScript: 0 },
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,
            activeDays: [], // Track which days user was active
            totalAttempts: 0,
            totalSubmissions: 0,
            joinedAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveAllUsers(users);

        return { success: true, message: 'Account created! Welcome to X Code! 🚀', user: newUser };
    },

    // Login user
    loginUser(email, password) {
        const user = this.findByEmail(email);
        if (!user) {
            return { success: false, message: 'No account found with this email.' };
        }
        if (user.password !== password) {
            return { success: false, message: 'Incorrect password.' };
        }

        // Update last login
        this.updateUser(user.id, { lastLogin: new Date().toISOString() });

        return { success: true, message: `Welcome back, ${user.username}! 🎉`, user };
    },

    // Update user data
    updateUser(userId, updates) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index === -1) return false;

        users[index] = { ...users[index], ...updates };
        this.saveAllUsers(users);
        return users[index];
    },

    // Get fresh user data
    getUser(userId) {
        const users = this.getAllUsers();
        return users.find(u => u.id === userId);
    },

    // Delete user
    deleteUser(userId) {
        const users = this.getAllUsers().filter(u => u.id !== userId);
        this.saveAllUsers(users);
    },

    // Random avatar
    getRandomAvatar() {
        const avatars = ['😎', '🚀', '💻', '🔥', '⚡', '🎯', '🧠', '🦊', '🐱', '🐻', '🎮', '🌟', '💜', '🎨', '🦸', '🧙', '🥷', '👾', '🤖', '👽'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }
};

// ============================================
// SESSION MANAGER (Currently logged in user)
// ============================================

const Session = {
    // Set current logged in user
    login(userId) {
        localStorage.setItem('xcode_current_user', userId);
    },

    // Logout
    logout() {
        localStorage.removeItem('xcode_current_user');
    },

    // Get current user ID
    getCurrentUserId() {
        return localStorage.getItem('xcode_current_user');
    },

    // Get current user data (fresh from DB)
    getCurrentUser() {
        const userId = this.getCurrentUserId();
        if (!userId) return null;
        return UserDB.getUser(userId);
    },

    // Check if logged in
    isLoggedIn() {
        return !!this.getCurrentUserId();
    }
};

// ============================================
// SCORING ENGINE
// ============================================

const ScoringEngine = {

    // Calculate score for solving a question
    calculateScore(difficulty, attempts, timeSpentSeconds) {
        const config = XCODE.SCORING[difficulty];
        if (!config) return 0;

        let score = config.base;

        // First try bonus
        if (attempts === 1) {
            score += config.firstTry;
        }

        // Time bonus (if solved within 5 minutes)
        if (timeSpentSeconds < 300) {
            score += config.timeBonus;
        } else if (timeSpentSeconds < 600) {
            score += Math.floor(config.timeBonus / 2);
        }

        // Streak multiplier
        const user = Session.getCurrentUser();
        if (user && user.currentStreak >= 7) {
            score = Math.floor(score * 1.5); // 50% bonus for 7+ streak
        } else if (user && user.currentStreak >= 3) {
            score = Math.floor(score * 1.2); // 20% bonus for 3+ streak
        }

        return score;
    },

    // Get rank for a score
    getRank(score) {
        let rank = XCODE.RANKS[0];
        for (const r of XCODE.RANKS) {
            if (score >= r.minScore) rank = r;
        }
        return rank;
    },

    // Submit a solution and update user score
    submitSolution(questionId, questionTitle, difficulty, category, passed, totalTests, attempts, timeSpent) {
        const user = Session.getCurrentUser();
        if (!user) return { success: false, message: 'Please sign in to submit!' };

        const allPassed = passed === totalTests;
        user.totalSubmissions += 1;
        user.totalAttempts += attempts;

        if (allPassed) {
            // Check if already solved
            const alreadySolved = user.solvedQuestions.find(q => q.questionId === questionId);
            if (alreadySolved) {
                // Already solved — no new score, but track submission
                UserDB.updateUser(user.id, {
                    totalSubmissions: user.totalSubmissions,
                    totalAttempts: user.totalAttempts
                });
                return {
                    success: true,
                    status: 'Accepted',
                    message: 'Correct! (Already solved — no new points)',
                    scoreEarned: 0,
                    totalScore: user.score,
                    isNewSolve: false
                };
            }

            // NEW SOLVE — Calculate score
            const scoreEarned = this.calculateScore(difficulty, attempts, timeSpent);

            // Update streak
            this.updateStreak(user);

            // Update user data
            const newScore = user.score + scoreEarned;
            const newRank = this.getRank(newScore);

            const solvedEntry = {
                questionId,
                questionTitle,
                score: scoreEarned,
                difficulty,
                category,
                solvedAt: new Date().toISOString(),
                attempts,
                timeSpent
            };

            user.solvedQuestions.push(solvedEntry);

            const updates = {
                score: newScore,
                rank: newRank.name,
                rankIcon: newRank.icon,
                totalSolved: user.totalSolved + 1,
                solvedQuestions: user.solvedQuestions,
                solvedByLevel: {
                    ...user.solvedByLevel,
                    [difficulty]: (user.solvedByLevel[difficulty] || 0) + 1
                },
                solvedByCategory: {
                    ...user.solvedByCategory,
                    [category]: (user.solvedByCategory[category] || 0) + 1
                },
                totalSubmissions: user.totalSubmissions,
                totalAttempts: user.totalAttempts,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak,
                lastActiveDate: user.lastActiveDate,
                activeDays: user.activeDays
            };

            UserDB.updateUser(user.id, updates);

            return {
                success: true,
                status: 'Accepted',
                message: `🎉 Correct! You earned ${scoreEarned} points!`,
                scoreEarned,
                totalScore: newScore,
                rank: newRank,
                isNewSolve: true,
                streak: user.currentStreak
            };
        } else {
            // Failed submission
            UserDB.updateUser(user.id, {
                totalSubmissions: user.totalSubmissions,
                totalAttempts: user.totalAttempts
            });

            return {
                success: true,
                status: 'Wrong Answer',
                message: `${passed}/${totalTests} test cases passed. Keep trying!`,
                scoreEarned: 0,
                totalScore: user.score,
                isNewSolve: false
            };
        }
    },

    // Update daily streak
    updateStreak(user) {
        const today = new Date().toDateString();

        if (!user.activeDays) user.activeDays = [];

        if (user.lastActiveDate) {
            const lastDate = new Date(user.lastActiveDate).toDateString();

            if (lastDate === today) {
                // Same day — no change
                return;
            }

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastDate === yesterday.toDateString()) {
                // Consecutive day!
                user.currentStreak += 1;
            } else {
                // Streak broken
                user.currentStreak = 1;
            }
        } else {
            user.currentStreak = 1;
        }

        if (user.currentStreak > user.longestStreak) {
            user.longestStreak = user.currentStreak;
        }

        user.lastActiveDate = new Date().toISOString();

        if (!user.activeDays.includes(today)) {
            user.activeDays.push(today);
        }
    }
};

// ============================================
// LEADERBOARD ENGINE (Real data from all users)
// ============================================

const LeaderboardEngine = {

    // Get ranked leaderboard
    getLeaderboard() {
        const users = UserDB.getAllUsers();
        return users
            .map(u => ({
                id: u.id,
                username: u.username,
                avatar: u.avatar,
                score: u.score,
                rank: u.rank,
                rankIcon: u.rankIcon || '🌱',
                totalSolved: u.totalSolved,
                currentStreak: u.currentStreak,
                longestStreak: u.longestStreak,
                solvedByLevel: u.solvedByLevel,
                joinedAt: u.joinedAt
            }))
            .sort((a, b) => b.score - a.score)
            .map((u, i) => ({ ...u, position: i + 1 }));
    },

    // Get user's rank position
    getUserPosition(userId) {
        const leaderboard = this.getLeaderboard();
        const entry = leaderboard.find(u => u.id === userId);
        return entry ? entry.position : null;
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
        if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
        return new Date(date).toLocaleDateString();
    },

    showToast(message, type = 'info', duration = 3000) {
        const existing = document.querySelectorAll('.xcode-toast');
        existing.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = 'xcode-toast';
        const colors = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b', info: '#8b5cf6' };
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

        toast.style.cssText = `
            position: fixed; bottom: 24px; right: 24px; padding: 14px 22px;
            background: var(--bg-card, #16162a); border: 1px solid ${colors[type]};
            border-left: 4px solid ${colors[type]}; border-radius: 10px;
            color: var(--text-primary, #e4e4e7); font-family: 'Inter', sans-serif;
            font-size: 14px; z-index: 99999; animation: toastIn 0.3s ease;
            box-shadow: 0 8px 30px rgba(0,0,0,0.4); max-width: 420px; display: flex;
            align-items: center; gap: 10px;
        `;
        toast.innerHTML = `<span style="font-size:18px;">${icons[type]}</span> ${message}`;
        document.body.appendChild(toast);

        if (!document.getElementById('toast-anim')) {
            const s = document.createElement('style');
            s.id = 'toast-anim';
            s.textContent = `
                @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes toastOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } }
            `;
            document.head.appendChild(s);
        }

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

console.log(`📊 X Code Data Module v${XCODE.VERSION} | Created by ${XCODE.CREATOR}`);