// ============================================
// X CODE — Questions Manager Module
// Created by SHADOW
// ============================================

class QuestionsManager {
    constructor() {
        this.questions = [];
        this.filtered = [];
        this.solved = JSON.parse(localStorage.getItem('xcode_solved') || '[]');
        this.attempted = JSON.parse(localStorage.getItem('xcode_attempted') || '[]');
        this.bookmarked = JSON.parse(localStorage.getItem('xcode_bookmarked') || '[]');
        this.sortField = 'id';
        this.sortOrder = 'asc';
    }

    // ============ INIT ============
    init(questions) {
        this.questions = questions;
        this.filtered = [...questions];
        this.loadProgress();
        return this;
    }

    // ============ GETTERS ============
    getAll() {
        return this.questions;
    }

    getFiltered() {
        return this.filtered;
    }

    getById(id) {
        return this.questions.find(q => q.id === parseInt(id));
    }

    getByLevel(level) {
        return this.questions.filter(q => q.level === level);
    }

    getByCategory(category) {
        return this.questions.filter(q => q.category === category);
    }

    getRandom(level = null) {
        const pool = level ? this.getByLevel(level) : this.questions;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    getNext(currentId) {
        const index = this.questions.findIndex(q => q.id === currentId);
        return index < this.questions.length - 1 ? this.questions[index + 1] : null;
    }

    getPrevious(currentId) {
        const index = this.questions.findIndex(q => q.id === currentId);
        return index > 0 ? this.questions[index - 1] : null;
    }

    // ============ FILTERING ============
    filter({ search = '', level = '', category = '', status = '', tags = [] } = {}) {
        this.filtered = this.questions.filter(q => {
            // Search
            const matchSearch = !search ||
                q.title.toLowerCase().includes(search.toLowerCase()) ||
                q.category.toLowerCase().includes(search.toLowerCase()) ||
                q.description.toLowerCase().includes(search.toLowerCase()) ||
                q.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

            // Level
            const matchLevel = !level || q.level === level;

            // Category
            const matchCategory = !category || q.category === category;

            // Status
            let matchStatus = true;
            if (status === 'solved') matchStatus = this.isSolved(q.id);
            if (status === 'attempted') matchStatus = this.isAttempted(q.id) && !this.isSolved(q.id);
            if (status === 'unsolved') matchStatus = !this.isSolved(q.id) && !this.isAttempted(q.id);
            if (status === 'bookmarked') matchStatus = this.isBookmarked(q.id);

            // Tags
            const matchTags = tags.length === 0 || tags.some(t => q.tags.includes(t));

            return matchSearch && matchLevel && matchCategory && matchStatus && matchTags;
        });

        this.sort(this.sortField, this.sortOrder);
        return this.filtered;
    }

    // ============ SORTING ============
    sort(field = 'id', order = 'asc') {
        this.sortField = field;
        this.sortOrder = order;

        this.filtered.sort((a, b) => {
            let valA, valB;

            switch (field) {
                case 'id':
                    valA = a.id;
                    valB = b.id;
                    break;
                case 'title':
                    valA = a.title.toLowerCase();
                    valB = b.title.toLowerCase();
                    break;
                case 'level':
                    const levelOrder = { beginner: 1, intermediate: 2, expert: 3 };
                    valA = levelOrder[a.level];
                    valB = levelOrder[b.level];
                    break;
                case 'category':
                    valA = a.category;
                    valB = b.category;
                    break;
                case 'acceptance':
                    valA = parseFloat(a.acceptance);
                    valB = parseFloat(b.acceptance);
                    break;
                case 'submissions':
                    valA = a.submissions;
                    valB = b.submissions;
                    break;
                default:
                    valA = a.id;
                    valB = b.id;
            }

            if (typeof valA === 'string') {
                return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            return order === 'asc' ? valA - valB : valB - valA;
        });

        return this.filtered;
    }

    // ============ PAGINATION ============
    paginate(page = 1, perPage = 20) {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        return {
            items: this.filtered.slice(start, end),
            total: this.filtered.length,
            page,
            perPage,
            totalPages: Math.ceil(this.filtered.length / perPage),
            hasNext: end < this.filtered.length,
            hasPrev: page > 1
        };
    }

    // ============ PROGRESS TRACKING ============
    markSolved(id) {
        if (!this.solved.includes(id)) {
            this.solved.push(id);
            this.saveProgress();
        }
    }

    markAttempted(id) {
        if (!this.attempted.includes(id)) {
            this.attempted.push(id);
            this.saveProgress();
        }
    }

    toggleBookmark(id) {
        const index = this.bookmarked.indexOf(id);
        if (index > -1) {
            this.bookmarked.splice(index, 1);
        } else {
            this.bookmarked.push(id);
        }
        this.saveProgress();
        return this.isBookmarked(id);
    }

    isSolved(id) {
        return this.solved.includes(id);
    }

    isAttempted(id) {
        return this.attempted.includes(id);
    }

    isBookmarked(id) {
        return this.bookmarked.includes(id);
    }

    getStatus(id) {
        if (this.isSolved(id)) return 'solved';
        if (this.isAttempted(id)) return 'attempted';
        return 'unsolved';
    }

    // ============ STATISTICS ============
    getStats() {
        const total = this.questions.length;
        const solved = this.solved.length;
        const attempted = this.attempted.length;

        const byLevel = {
            beginner: { total: 0, solved: 0 },
            intermediate: { total: 0, solved: 0 },
            expert: { total: 0, solved: 0 }
        };

        const byCategory = {
            HTML: { total: 0, solved: 0 },
            CSS: { total: 0, solved: 0 },
            JavaScript: { total: 0, solved: 0 }
        };

        this.questions.forEach(q => {
            if (byLevel[q.level]) {
                byLevel[q.level].total++;
                if (this.isSolved(q.id)) byLevel[q.level].solved++;
            }
            if (byCategory[q.category]) {
                byCategory[q.category].total++;
                if (this.isSolved(q.id)) byCategory[q.category].solved++;
            }
        });

        return {
            total,
            solved,
            attempted,
            unsolved: total - solved,
            percentage: ((solved / total) * 100).toFixed(1),
            byLevel,
            byCategory,
            bookmarked: this.bookmarked.length
        };
    }

    // ============ DAILY CHALLENGE ============
    getDailyChallenge() {
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        const index = seed % this.questions.length;
        return this.questions[index];
    }

    // ============ RECOMMENDATIONS ============
    getRecommendations(count = 5) {
        // Get unsolved questions, preferring ones near user's level
        const unsolved = this.questions.filter(q => !this.isSolved(q.id));
        if (unsolved.length === 0) return [];

        // Determine user's level based on solve ratio
        const stats = this.getStats();
        let targetLevel = 'beginner';
        if (stats.byLevel.beginner.solved > 150) targetLevel = 'intermediate';
        if (stats.byLevel.intermediate.solved > 130) targetLevel = 'expert';

        const prioritized = unsolved.sort((a, b) => {
            const aMatch = a.level === targetLevel ? 0 : 1;
            const bMatch = b.level === targetLevel ? 0 : 1;
            return aMatch - bMatch;
        });

        return prioritized.slice(0, count);
    }

    // ============ SEARCH SUGGESTIONS ============
    getSuggestions(query, limit = 10) {
        if (!query || query.length < 2) return [];

        const q = query.toLowerCase();
        return this.questions
            .filter(item =>
                item.title.toLowerCase().includes(q) ||
                item.tags.some(t => t.toLowerCase().includes(q))
            )
            .slice(0, limit)
            .map(item => ({
                id: item.id,
                title: item.title,
                level: item.level,
                category: item.category
            }));
    }

    // ============ PERSISTENCE ============
    saveProgress() {
        localStorage.setItem('xcode_solved', JSON.stringify(this.solved));
        localStorage.setItem('xcode_attempted', JSON.stringify(this.attempted));
        localStorage.setItem('xcode_bookmarked', JSON.stringify(this.bookmarked));
    }

    loadProgress() {
        this.solved = JSON.parse(localStorage.getItem('xcode_solved') || '[]');
        this.attempted = JSON.parse(localStorage.getItem('xcode_attempted') || '[]');
        this.bookmarked = JSON.parse(localStorage.getItem('xcode_bookmarked') || '[]');
    }

    resetProgress() {
        if (confirm('⚠️ This will reset ALL your progress. Are you sure?')) {
            this.solved = [];
            this.attempted = [];
            this.bookmarked = [];
            this.saveProgress();
            return true;
        }
        return false;
    }

    // ============ EXPORT/IMPORT ============
    exportProgress() {
        return JSON.stringify({
            solved: this.solved,
            attempted: this.attempted,
            bookmarked: this.bookmarked,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        }, null, 2);
    }

    importProgress(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.solved) this.solved = data.solved;
            if (data.attempted) this.attempted = data.attempted;
            if (data.bookmarked) this.bookmarked = data.bookmarked;
            this.saveProgress();
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }
}

// ============ GLOBAL INSTANCE ============
const questionsManager = new QuestionsManager();

console.log('📚 X Code Questions Manager initialized');