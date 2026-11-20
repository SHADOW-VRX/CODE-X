// ============================================
// X CODE — Client-Side Router
// Created by SHADOW
// ============================================

class XCodeRouter {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.history = [];
        this.beforeHooks = [];
        this.afterHooks = [];
        this.init();
    }

    // ============ INIT ============
    init() {
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.navigate(e.state.page, false);
            }
        });

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || 'home';
            this.navigate(hash, false);
        });

        // Initial route
        const initialRoute = window.location.hash.slice(1) || 'home';
        this.navigate(initialRoute, true);
    }

    // ============ REGISTER ROUTES ============
    register(path, config) {
        this.routes[path] = {
            title: config.title || 'X Code',
            onEnter: config.onEnter || null,
            onLeave: config.onLeave || null,
            requiresAuth: config.requiresAuth || false,
            ...config
        };
        return this;
    }

    // ============ NAVIGATION ============
    navigate(page, pushState = true) {
        // Before hooks
        for (const hook of this.beforeHooks) {
            const result = hook(this.currentRoute, page);
            if (result === false) return; // Navigation cancelled
        }

        // Leave current route
        if (this.currentRoute && this.routes[this.currentRoute]?.onLeave) {
            this.routes[this.currentRoute].onLeave();
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

        // Show target page
        const pageEl = document.getElementById(`page-${page}`);
        if (pageEl) {
            pageEl.classList.add('active');
        } else {
            // Fallback to home
            const homeEl = document.getElementById('page-home');
            if (homeEl) homeEl.classList.add('active');
            page = 'home';
        }

        // Update nav link
        const navLink = document.querySelector(`.nav-link[data-page="${page}"]`);
        if (navLink) navLink.classList.add('active');

        // Update browser history
        if (pushState) {
            window.history.pushState({ page }, '', `#${page}`);
        }

        // Update document title
        const route = this.routes[page];
        if (route && route.title) {
            document.title = `${route.title} | X Code`;
        } else {
            document.title = `X Code — Web Developer Challenges`;
        }

        // Track history
        this.history.push(page);
        const previousRoute = this.currentRoute;
        this.currentRoute = page;

        // Enter new route
        if (route?.onEnter) {
            route.onEnter({ from: previousRoute, to: page });
        }

        // After hooks
        for (const hook of this.afterHooks) {
            hook(previousRoute, page);
        }

        // Scroll to top for non-editor pages
        if (page !== 'editor') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // ============ HOOKS ============
    beforeEach(hook) {
        this.beforeHooks.push(hook);
        return this;
    }

    afterEach(hook) {
        this.afterHooks.push(hook);
        return this;
    }

    // ============ HELPERS ============
    back() {
        if (this.history.length > 1) {
            this.history.pop(); // Remove current
            const previous = this.history[this.history.length - 1];
            this.navigate(previous);
        } else {
            this.navigate('home');
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    getHistory() {
        return [...this.history];
    }

    isRoute(page) {
        return this.currentRoute === page;
    }
}

// ============ INITIALIZE ROUTER ============
const router = new XCodeRouter();

// Register all routes
router
    .register('home', {
        title: 'Home',
        onEnter: () => {
            // Re-animate counters if needed
            animateCounters();
        }
    })
    .register('problems', {
        title: 'Problems',
        onEnter: () => {
            renderProblems();
        }
    })
    .register('editor', {
        title: 'Editor',
        onEnter: () => {
            if (state.currentQuestion) {
                setTimeout(() => initCodeEditor(), 150);
            }
        },
        onLeave: () => {
            // Save current code state
            if (state.editor) {
                state.currentCode[state.currentLanguage] = state.editor.getValue();
            }
        }
    })
    .register('leaderboard', {
        title: 'Leaderboard',
        onEnter: () => {
            initLeaderboard();
        }
    })
    .register('about', {
        title: 'About'
    });

// Track page views
router.afterEach((from, to) => {
    console.log(`📍 Route: ${from || 'init'} → ${to}`);
    
    // Update state
    if (typeof state !== 'undefined') {
        state.currentPage = to;
    }
    
    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
    }
});

// ============ GLOBAL NAVIGATE FUNCTION ============
// Override the global navigateTo to use router
function navigateTo(page) {
    router.navigate(page);
}

// ============ URL PARAMETER HANDLING ============
function getURLParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        question: params.get('q'),
        level: params.get('level'),
        category: params.get('category')
    };
}

function setURLParams(params) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.replaceState({}, '', url);
}

// Handle direct URL with question ID
function handleDirectURL() {
    const params = getURLParams();
    if (params.question) {
        const qId = parseInt(params.question);
        if (qId > 0 && qId <= 500) {
            setTimeout(() => openProblem(qId), 500);
        }
    }
    if (params.level) {
        setTimeout(() => filterByLevel(params.level), 500);
    }
}

// Run on load
document.addEventListener('DOMContentLoaded', handleDirectURL);

console.log('🛣️ X Code Router initialized');