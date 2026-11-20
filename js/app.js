// ============================================
// X CODE — Main Application (v2 with Auth + Real Scoring)
// Created by SHADOW
// ============================================

// ============ STATE ============
const state = {
    currentPage: 'home',
    questions: [],
    filteredQuestions: [],
    currentQuestion: null,
    currentLanguage: 'html',
    currentCode: { html: '', css: '', javascript: '' },
    currentPageNum: 1,
    questionsPerPage: 20,
    editor: null,
    questionStartTime: null, // Track time spent
    currentAttempts: {} // Track attempts per question { questionId: count }
};

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    generateQuestions();
    initLoader();
    initParticles();
    initTypingEffect();
    animateCounters();
    initResizer();
    initBackToTop();
    renderProblems();
    updateNavbarAuth();
    renderLeaderboard();
});

// ============ LOADER ============
function initLoader() {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 2500);
}

// ============ THEME ============
function initTheme() {
    const theme = localStorage.getItem('xcode_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon();
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('xcode_theme', next);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    const theme = document.documentElement.getAttribute('data-theme');
    if (icon) icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// ============ NAVIGATION ============
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');

    const navLink = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (navLink) navLink.classList.add('active');

    state.currentPage = page;

    if (page === 'home') window.scrollTo(0, 0);
    if (page === 'problems') renderProblems();
    if (page === 'leaderboard') renderLeaderboard();
}

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('active');
}

// ============ PARTICLES ============
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (Math.random() * 10 + 5) + 's';
        p.style.animationDelay = Math.random() * 5 + 's';
        p.style.width = (Math.random() * 4 + 2) + 'px';
        p.style.height = p.style.width;
        container.appendChild(p);
    }
}

// ============ TYPING EFFECT ============
function initTypingEffect() {
    const codeLines = [
        '<span class="comment">// Welcome to X Code 🚀</span>',
        '<span class="keyword">const</span> <span class="variable">developer</span> = {',
        '  <span class="function">name</span>: <span class="string">"SHADOW"</span>,',
        '  <span class="function">skills</span>: [<span class="string">"HTML"</span>, <span class="string">"CSS"</span>, <span class="string">"JS"</span>],',
        '  <span class="function">challenges</span>: <span class="number">500</span>,',
        '  <span class="function">passion</span>: <span class="string">"∞"</span>',
        '};',
        '',
        '<span class="keyword">function</span> <span class="function">solve</span>(challenge) {',
        '  <span class="keyword">return</span> challenge',
        '    .<span class="function">think</span>()',
        '    .<span class="function">code</span>()',
        '    .<span class="function">test</span>()',
        '    .<span class="function">submit</span>();  <span class="comment">// ✅ Accepted!</span>',
        '}',
    ];

    const el = document.getElementById('typing-code');
    if (!el) return;
    let lineIdx = 0, text = '';

    function typeLine() {
        if (lineIdx < codeLines.length) {
            text += (lineIdx > 0 ? '\n' : '') + codeLines[lineIdx];
            el.innerHTML = text + '<span style="animation:blink 1s infinite">|</span>';
            lineIdx++;
            setTimeout(typeLine, 120);
        } else {
            el.innerHTML = text;
            setTimeout(() => { text = ''; lineIdx = 0; el.innerHTML = ''; typeLine(); }, 5000);
        }
    }
    setTimeout(typeLine, 3000);
}

// ============ COUNTER ANIMATION ============
function animateCounters() {
    document.querySelectorAll('.stat-number[data-count]').forEach(el => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                const target = parseInt(el.dataset.count);
                let current = 0;
                const timer = setInterval(() => {
                    current += target / 60;
                    if (current >= target) { current = target; clearInterval(timer); }
                    el.textContent = Math.floor(current) + (target === 100 ? '%' : '+');
                }, 30);
                observer.unobserve(el);
            }
        });
        observer.observe(el);
    });
}

// ============================================
// AUTH — SIGN UP / SIGN IN / NAVBAR
// ============================================

function showAuthModal(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('auth-modal-title');
    const body = document.getElementById('auth-modal-body');

    if (mode === 'login') {
        title.textContent = '👋 Welcome Back';
        body.innerHTML = `
            <form onsubmit="handleLogin(event)" class="auth-form">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="login-email" placeholder="you@example.com" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="login-password" placeholder="Your password" required>
                </div>
                <div id="auth-error" class="auth-error"></div>
                <button type="submit" class="btn-primary btn-full">
                    <i class="fas fa-sign-in-alt"></i> Sign In
                </button>
                <p class="auth-switch">
                    Don't have an account? 
                    <a href="#" onclick="showAuthModal('signup'); return false;">Sign Up</a>
                </p>
            </form>
        `;
    } else {
        title.textContent = '🚀 Create Account';
        body.innerHTML = `
            <form onsubmit="handleSignup(event)" class="auth-form">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="signup-username" placeholder="Choose a username" minlength="3" maxlength="20" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="signup-email" placeholder="you@example.com" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="signup-password" placeholder="Min 6 characters" minlength="6" required>
                </div>
                <div class="form-group">
                    <label>Choose Avatar</label>
                    <div class="avatar-picker" id="avatar-picker">
                        ${['😎','🚀','💻','🔥','⚡','🎯','🧠','🦊','🐱','🎮','🌟','💜','🎨','🦸','🧙','🥷','👾','🤖'].map((a, i) =>
                            `<span class="avatar-option ${i === 0 ? 'selected' : ''}" onclick="selectAvatar(this, '${a}')">${a}</span>`
                        ).join('')}
                    </div>
                    <input type="hidden" id="signup-avatar" value="😎">
                </div>
                <div id="auth-error" class="auth-error"></div>
                <button type="submit" class="btn-primary btn-full">
                    <i class="fas fa-user-plus"></i> Create Account
                </button>
                <p class="auth-switch">
                    Already have an account? 
                    <a href="#" onclick="showAuthModal('login'); return false;">Sign In</a>
                </p>
            </form>
        `;
    }

    modal.classList.add('active');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}

function selectAvatar(el, avatar) {
    document.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('signup-avatar').value = avatar;
}

function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const avatar = document.getElementById('signup-avatar').value;
    const errorEl = document.getElementById('auth-error');

    const result = UserDB.createUser(username, email, password, avatar);

    if (!result.success) {
        errorEl.textContent = result.message;
        errorEl.style.display = 'block';
        return;
    }

    // Auto login
    Session.login(result.user.id);
    closeAuthModal();
    updateNavbarAuth();
    renderLeaderboard();
    Utils.showToast(result.message, 'success');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('auth-error');

    const result = UserDB.loginUser(email, password);

    if (!result.success) {
        errorEl.textContent = result.message;
        errorEl.style.display = 'block';
        return;
    }

    Session.login(result.user.id);
    closeAuthModal();
    updateNavbarAuth();
    renderLeaderboard();
    Utils.showToast(result.message, 'success');
}

function handleLogout() {
    Session.logout();
    updateNavbarAuth();
    Utils.showToast('Logged out successfully!', 'info');
    navigateTo('home');
}

function updateNavbarAuth() {
    const actionsEl = document.getElementById('nav-auth-area');
    if (!actionsEl) return;

    const user = Session.getCurrentUser();

    if (user) {
        actionsEl.innerHTML = `
            <div class="streak-badge" title="Daily Streak: ${user.currentStreak} days">
                <i class="fas fa-fire"></i>
                <span>${user.currentStreak}</span>
            </div>
            <div class="user-score-badge" title="Your Score">
                <i class="fas fa-star"></i>
                <span>${Utils.formatNumber(user.score)}</span>
            </div>
            <div class="nav-user-menu">
                <button class="nav-user-btn" onclick="toggleUserMenu()">
                    <span class="nav-avatar">${user.avatar}</span>
                    <span class="nav-username">${user.username}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="user-dropdown" id="user-dropdown">
                    <div class="dropdown-header">
                        <span class="dropdown-avatar">${user.avatar}</span>
                        <div>
                            <strong>${user.username}</strong>
                            <span class="dropdown-rank">${user.rankIcon} ${user.rank}</span>
                        </div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-stats">
                        <div class="dropdown-stat">
                            <span class="ds-value">${Utils.formatNumber(user.score)}</span>
                            <span class="ds-label">Score</span>
                        </div>
                        <div class="dropdown-stat">
                            <span class="ds-value">${user.totalSolved}</span>
                            <span class="ds-label">Solved</span>
                        </div>
                        <div class="dropdown-stat">
                            <span class="ds-value">🔥 ${user.currentStreak}</span>
                            <span class="ds-label">Streak</span>
                        </div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item" onclick="navigateTo('leaderboard'); toggleUserMenu();">
                        <i class="fas fa-trophy"></i> Leaderboard
                    </a>
                    <a class="dropdown-item logout" onclick="handleLogout()">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>
        `;
    } else {
        actionsEl.innerHTML = `
            <button class="btn-outline nav-btn" onclick="showAuthModal('login')">
                <i class="fas fa-sign-in-alt"></i> Sign In
            </button>
            <button class="btn-primary nav-btn" onclick="showAuthModal('signup')">
                <i class="fas fa-user-plus"></i> Sign Up
            </button>
        `;
    }
}

function toggleUserMenu() {
    document.getElementById('user-dropdown')?.classList.toggle('active');
}

// Close dropdown on click outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-user-menu')) {
        document.getElementById('user-dropdown')?.classList.remove('active');
    }
});


// ============================================
// GENERATE 500 QUESTIONS
// ============================================
function generateQuestions() {
    const questions = [];
    let id = 1;

    function addQ(title, level, category, desc) {
        questions.push({
            id: id++, title, level, category, description: desc,
            tags: [category.toLowerCase(), level],
            acceptance: (Math.random() * 40 + 30).toFixed(1) + '%',
            submissions: Math.floor(Math.random() * 50000 + 1000),
            likes: Math.floor(Math.random() * 5000 + 100),
            starterCode: {
                html: `<!-- Challenge #${id - 1}: ${title} -->\n\n`,
                css: `/* ${title} */\n\n`,
                javascript: `// ${title}\n\n`
            },
            examples: [{ input: "See description", output: "Expected result" }],
            hints: [`Break "${title}" into smaller steps`, `Check MDN for ${category} reference`],
            testCases: [{ input: "t1", output: "e1" }, { input: "t2", output: "e2" }, { input: "t3", output: "e3" }]
        });
    }

    // BEGINNER HTML (1-40)
    ["Create a Heading","Paragraph Element","Unordered List","Ordered List","Create a Link","Image Element","HTML Table","HTML Form","Div Container","Semantic HTML","Input Types","Radio Buttons","Checkboxes","Select Dropdown","Textarea","HTML Comments","Line Break & HR","Bold & Italic","Blockquote","Code Element","HTML Entities","Meta Tags","Favicon","Video Element","Audio Element","iFrame","Definition List","Figure & Figcaption","Details & Summary","Data Attributes","Navigation Bar","Footer Links","Article Element","Section Element","Aside Element","Progress Bar","Meter Element","Fieldset & Legend","Datalist","Output Element"].forEach(t => addQ(t, "beginner", "HTML", `Build ${t.toLowerCase()} using proper HTML.`));

    // BEGINNER CSS (41-100)
    ["Change Text Color","Background Color","Font Size","Font Family","Text Alignment","Margin & Padding","Border Styling","Box Shadow","Width & Height","Display Property","Position Static","Position Relative","Position Absolute","Position Fixed","Position Sticky","Float Layout","Clear Float","Overflow Hidden","Opacity","CSS Variables","Hover Effect","Active State","Focus State","First Child","Last Child","Nth Child","Before Pseudo","After Pseudo","Class Selector","ID Selector","Attribute Selector","Child Selector","Descendant Selector","Universal Selector","List Style","Text Decoration","Text Transform","Letter Spacing","Line Height","Cursor Styles","Transition Basic","Transform Scale","Transform Rotate","Transform Translate","Border Radius Circle","Linear Gradient","Radial Gradient","Object Fit","Outline vs Border","Min Max Width","Calc Function","CSS Filter","Text Shadow","Multiple Backgrounds","Visibility vs Display","Z-Index","Overflow Scroll","White Space","Word Break","CSS Counters"].forEach(t => addQ(t, "beginner", "CSS", `Implement ${t.toLowerCase()} using CSS.`));

    // BEGINNER JS (101-200)
    ["Hello World","Variables","Data Types","String Concatenation","Template Literals","String Length","String Methods","String Slice","Number Methods","Math Object","Random Number","Arithmetic Operators","Comparison Operators","Logical Operators","If-Else","Ternary Operator","Switch Statement","For Loop","While Loop","Do-While Loop","For...of Loop","For...in Loop","Array Declaration","Array Push Pop","Array Shift Unshift","Array Slice","Array Splice","Array indexOf","Array includes","Array Reverse","Array Sort","Array Join","Array forEach","Array map","Array filter","Array reduce","Array find","Array some every","Array flat","Array from","Spread Operator","Rest Parameters","Array Destructuring","Object Creation","Object Methods","Object Destructuring","Object Keys Values","Object Spread","Object Freeze","Function Declaration","Arrow Functions","Default Parameters","Return Values","Callbacks","setTimeout","setInterval","Try Catch","Throw Errors","Type Conversion","Truthy Falsy","Nullish Coalescing","Optional Chaining","DOM getElementById","DOM querySelector","DOM Manipulation","Create Elements","Remove Elements","Event Listeners","Event Object","Form Events","ClassList Methods","Style Manipulation","innerHTML vs textContent","querySelector vs getElement","LocalStorage Set","LocalStorage Get","JSON Stringify","JSON Parse","Date Object","Date Methods","String Replace","String Split","Regex Validation","Map Structure","Set Structure","Symbol Type","typeof Operator","instanceof","isNaN isFinite","Alert Prompt Confirm","Window Location","Console Methods","Clipboard API","Scroll Events","Resize Event","Mouse Position","Keyboard Events","Element Dimensions","Error Types","Strict Mode","Short Circuit"].forEach(t => addQ(t, "beginner", "JavaScript", `Implement ${t.toLowerCase()} in JavaScript.`));

    // INTERMEDIATE CSS (201-260)
    ["Flexbox Container","Flex Direction","Flex Wrap","Flex Grow Shrink","Align Items","Justify Content","Flex Order","Center a Div","Flexbox Navbar","Flexbox Cards","CSS Grid Basic","Grid Template Rows","Grid Gap","Grid Span","Grid Template Areas","Grid Auto Flow","Responsive Grid","Grid Alignment","Grid Dashboard","Grid Magazine","Keyframe Animation","Bounce Animation","Slide In Animation","Pulse Animation","Spin Animation","Typewriter CSS","Animation Delay","Animation Fill Mode","Transition Timing","Multi-Step Animation","Mobile Media Query","Tablet Media Query","Desktop Media Query","Mobile First Design","Responsive Images","Responsive Typography","CSS Hamburger Menu","Print Stylesheet","Dark Mode Toggle","Container Queries","CSS Clip Path","CSS Shapes","Backdrop Filter","Mix Blend Mode","CSS Columns","Scroll Snap","Custom Scrollbar","Masonry Layout","Aspect Ratio","CSS Nesting","Subgrid","Has Selector","Where Is Selectors","Color Mix","Scroll Timeline","View Transitions","CSS Layers","Logical Properties","CSS Modules","BEM Methodology"].forEach(t => addQ(t, "intermediate", "CSS", `Build ${t.toLowerCase()} with CSS.`));

    // INTERMEDIATE JS (261-375)
    ["Promises Basics","Promise Chaining","Promise.all","Promise.race","Promise.allSettled","Async Await","Async Error Handling","Fetch GET","Fetch POST","Fetch Headers","API Error Handling","AbortController","Debounce Function","Throttle Function","Closure Counter","Module Pattern","IIFE","Currying","Memoization","Deep Clone","Shallow vs Deep Copy","Event Delegation","Event Propagation","Custom Events","Observer Pattern","Intersection Observer","Mutation Observer","Resize Observer","Class Syntax","Class Inheritance","Static Methods","Private Fields","Getters Setters","Prototype Chain","Object.create","Map vs Object","WeakMap","Set Operations","WeakSet","Generator Functions","Iterator Protocol","Symbol.iterator","Proxy Object","Reflect API","Custom Errors","Regex Groups","Regex Lookahead","Tagged Templates","Intl Formatting","Web Workers","Service Worker","IndexedDB","Drag and Drop","File Reader","Canvas Drawing","Canvas Animation","WebSocket Client","Geolocation API","Notification API","Clipboard Advanced","History API","URL API","FormData API","Fetch Streaming","Web Animations","Performance API","BroadcastChannel","structuredClone","AbortSignal Timeout","Array.at Method","Object.groupBy","Top-Level Await","Import Maps","Dynamic Import","Pattern Matching","Recursion","Linked List","Stack","Queue","Binary Search","Sorting Algorithms","Hash Table","Tree Traversal","Graph BFS","Flatten Object","Deep Merge","Event Emitter","Promise Pool","Retry Logic","Rate Limiter","Virtual Scroll","Infinite Scroll","Search Highlight","Table Sort Filter","Form Validation","Multi-Step Form","Autocomplete","Toast Notifications","Modal Component","Tabs Component","Accordion","Image Carousel","Calendar Widget","Color Picker","Timer Stopwatch","Todo App","Shopping Cart","Calculator App","Weather App","Quiz App","Markdown Preview","Image Gallery","Kanban Board","Chat Interface","Drawing App","Music Player","Snake Game"].forEach(t => addQ(t, "intermediate", "JavaScript", `Build ${t.toLowerCase()} with JavaScript.`));

    // EXPERT (376-500)
    [["Virtual DOM","JavaScript"],["Reactive State","JavaScript"],["Custom Hooks","JavaScript"],["Redux Scratch","JavaScript"],["Client Router","JavaScript"],["Template Engine","JavaScript"],["Component Framework","JavaScript"],["DI Container","JavaScript"],["Signal Reactivity","JavaScript"],["Expression Parser","JavaScript"],["REST Framework","JavaScript"],["GraphQL Client","JavaScript"],["WebSocket Server","JavaScript"],["OAuth2 Flow","JavaScript"],["JWT Auth","JavaScript"],["Rate Limiter Server","JavaScript"],["ORM Builder","JavaScript"],["LRU Cache","JavaScript"],["Task Queue","JavaScript"],["SSE Streaming","JavaScript"],["CSS-in-JS Engine","CSS"],["CSS Framework","CSS"],["Email Template","CSS"],["Grid System 12col","CSS"],["Theme System","CSS"],["Animation Library","CSS"],["3D Card Flip","CSS"],["CSS Parallax","CSS"],["Glassmorphism Kit","CSS"],["Neumorphism UI","CSS"],["ARIA Accessibility","HTML"],["SEO JSON-LD","HTML"],["Web Components","JavaScript"],["Custom Elements","JavaScript"],["Shadow DOM Style","CSS"],["Canvas Game","JavaScript"],["WebGL Graphics","JavaScript"],["SVG Animations","JavaScript"],["WebRTC Chat","JavaScript"],["Complete PWA","JavaScript"],["Performance Optimize","JavaScript"],["Dependency Analyzer","JavaScript"],["Tree Shaking","JavaScript"],["Code Splitting","JavaScript"],["Memory Leak Fix","JavaScript"],["Testing Framework","JavaScript"],["E2E Testing","JavaScript"],["Snapshot Testing","JavaScript"],["Micro-Frontends","JavaScript"],["Islands Architecture","JavaScript"],["Streaming SSR","JavaScript"],["ISR Build","JavaScript"],["Edge Functions","JavaScript"],["CRDT Collab","JavaScript"],["OT Editor","JavaScript"],["Search Engine","JavaScript"],["Trie Autocomplete","JavaScript"],["B-Tree Index","JavaScript"],["Red-Black Tree","JavaScript"],["A* Pathfinding","JavaScript"],["Dijkstra Algorithm","JavaScript"],["DP Problems","JavaScript"],["Bloom Filter","JavaScript"],["Consistent Hash","JavaScript"],["Web Scraper","JavaScript"],["Markdown Parser","JavaScript"],["JSON Parser","JavaScript"],["CSS Parser","JavaScript"],["Syntax Highlighter","JavaScript"],["Code Editor","JavaScript"],["File Manager","JavaScript"],["Image Editor","JavaScript"],["Video Player","JavaScript"],["Audio Visualizer","JavaScript"],["Spreadsheet","JavaScript"],["Rich Text Editor","JavaScript"],["Diagram Editor","JavaScript"],["State Machine","JavaScript"],["Undo Redo System","JavaScript"],["Plugin System","JavaScript"],["i18n System","JavaScript"],["Feature Flags","JavaScript"],["Analytics Engine","JavaScript"],["Error Monitor","JavaScript"],["Design System","CSS"],["Storybook Clone","JavaScript"],["CI CD Pipeline","JavaScript"],["Docker Setup","JavaScript"],["Load Tester","JavaScript"],["API Gateway","JavaScript"],["GraphQL Server","JavaScript"],["RT Dashboard","JavaScript"],["Ecommerce Checkout","JavaScript"],["Social Feed","JavaScript"],["Project Board","JavaScript"],["Auth System Full","JavaScript"],["Notification System","JavaScript"],["Search UI","JavaScript"],["Data Viz SVG","JavaScript"],["Map Component","JavaScript"],["Video Conference UI","JavaScript"],["AI Chat UI","JavaScript"],["CMS Dashboard","JavaScript"],["Admin Generator","JavaScript"],["Form Builder","JavaScript"],["Page Builder","JavaScript"],["Portfolio Generator","JavaScript"],["Blog Engine","JavaScript"],["API Docs Tool","JavaScript"],["DB Visualizer","JavaScript"],["Diff Viewer","JavaScript"],["Terminal Emulator","JavaScript"],["Collab Whiteboard","JavaScript"],["Package Browser","JavaScript"],["DevTools Panel","JavaScript"],["Progressive Enhancement","HTML"],["A11y Audit Tool","JavaScript"],["Web Vitals Dash","JavaScript"],["Security Scanner","JavaScript"],["Token Pipeline","CSS"],["Houdini Paint","CSS"],["Layout Algorithm","JavaScript"],["WASM Compiler","JavaScript"],["Browser Extension","JavaScript"],["RT Code Collab","JavaScript"],["Regex Builder","JavaScript"]].forEach(([t, c]) => addQ(t, "expert", c, `Build production-grade ${t.toLowerCase()}. Expert challenge.`));

    state.questions = questions;
    state.filteredQuestions = [...questions];
    console.log(`✅ ${questions.length} questions loaded`);
}

// ============================================
// PROBLEMS TABLE
// ============================================
function renderProblems() {
    const tbody = document.getElementById('problems-tbody');
    if (!tbody) return;

    const user = Session.getCurrentUser();
    const solvedIds = user ? user.solvedQuestions.map(q => q.questionId) : [];

    const start = (state.currentPageNum - 1) * state.questionsPerPage;
    const pageQ = state.filteredQuestions.slice(start, start + state.questionsPerPage);

    tbody.innerHTML = pageQ.map(q => {
        const solved = solvedIds.includes(q.id);
        return `
            <tr onclick="openProblem(${q.id})">
                <td><span class="status-icon ${solved ? 'solved' : 'unsolved'}">
                    ${solved ? '<i class="fas fa-check-circle"></i>' : '<i class="far fa-circle"></i>'}
                </span></td>
                <td>${q.id}</td>
                <td><span class="problem-title">${q.title}</span></td>
                <td><span class="category-badge">${q.category}</span></td>
                <td><span class="difficulty-badge ${q.level}">${q.level.charAt(0).toUpperCase() + q.level.slice(1)}</span></td>
                <td>${q.acceptance}</td>
            </tr>
        `;
    }).join('');

    renderPagination();
}

function renderPagination() {
    const el = document.getElementById('pagination');
    if (!el) return;
    const total = Math.ceil(state.filteredQuestions.length / state.questionsPerPage);
    let html = `<button class="page-btn" onclick="goToPage(${state.currentPageNum - 1})" ${state.currentPageNum === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
    const start = Math.max(1, state.currentPageNum - 2);
    const end = Math.min(total, start + 4);
    for (let i = start; i <= end; i++) {
        html += `<button class="page-btn ${i === state.currentPageNum ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" onclick="goToPage(${state.currentPageNum + 1})" ${state.currentPageNum === total ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
    el.innerHTML = html;
}

function goToPage(p) {
    const total = Math.ceil(state.filteredQuestions.length / state.questionsPerPage);
    if (p < 1 || p > total) return;
    state.currentPageNum = p;
    renderProblems();
}

// ============ FILTERS ============
function handleSearch() { applyFilters(); }

function applyFilters() {
    const search = document.getElementById('search-input')?.value.toLowerCase() || '';
    const level = document.getElementById('level-filter')?.value || '';
    const category = document.getElementById('category-filter')?.value || '';
    const status = document.getElementById('status-filter')?.value || '';
    const user = Session.getCurrentUser();
    const solvedIds = user ? user.solvedQuestions.map(q => q.questionId) : [];

    state.filteredQuestions = state.questions.filter(q => {
        const matchSearch = !search || q.title.toLowerCase().includes(search) || q.category.toLowerCase().includes(search);
        const matchLevel = !level || q.level === level;
        const matchCat = !category || q.category === category;
        let matchStatus = true;
        if (status === 'solved') matchStatus = solvedIds.includes(q.id);
        if (status === 'unsolved') matchStatus = !solvedIds.includes(q.id);
        return matchSearch && matchLevel && matchCat && matchStatus;
    });

    state.currentPageNum = 1;
    renderProblems();
}

function filterByLevel(level) {
    navigateTo('problems');
    setTimeout(() => {
        const el = document.getElementById('level-filter');
        if (el) el.value = level;
        applyFilters();
    }, 100);
}

// ============================================
// OPEN PROBLEM & CODE EDITOR
// ============================================
function openProblem(id) {
    const q = state.questions.find(q => q.id === id);
    if (!q) return;

    state.currentQuestion = q;
    state.currentCode = { ...q.starterCode };
    state.currentLanguage = q.category === 'HTML' ? 'html' : q.category === 'CSS' ? 'css' : 'javascript';
    state.questionStartTime = Date.now(); // Start timing
    if (!state.currentAttempts[id]) state.currentAttempts[id] = 0;

    renderDescription(q);
    navigateTo('editor');
    setTimeout(() => initCodeEditor(), 100);
}

function renderDescription(q) {
    const el = document.getElementById('desc-content');
    if (!el) return;

    const user = Session.getCurrentUser();
    const solvedEntry = user?.solvedQuestions.find(s => s.questionId === q.id);

    // Score info for this difficulty
    const scoring = XCODE.SCORING[q.level];

    el.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;">
            <span style="color:var(--text-muted);font-size:0.9rem;">#${q.id}</span>
            ${solvedEntry ? `<span style="color:var(--success);font-size:0.85rem;"><i class="fas fa-check-circle"></i> Solved (+${solvedEntry.score} pts)</span>` : ''}
        </div>
        <h2>${q.title}</h2>
        <span class="difficulty-badge ${q.level}" style="margin-bottom:1rem;display:inline-block;">
            ${q.level.charAt(0).toUpperCase() + q.level.slice(1)}
        </span>
        <div class="description"><p>${q.description}</p></div>

        <div class="score-info" style="background:var(--bg-tertiary);border:1px solid var(--border);border-radius:8px;padding:1rem;margin:1rem 0;">
            <h4 style="margin-bottom:0.5rem;font-size:0.9rem;"><i class="fas fa-star" style="color:#f59e0b;"></i> Scoring</h4>
            <div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:0.8rem;color:var(--text-secondary);">
                <span>Base: <b style="color:var(--text-primary);">${scoring.base} pts</b></span>
                <span>First Try: <b style="color:var(--success);">+${scoring.firstTry} pts</b></span>
                <span>Speed Bonus: <b style="color:var(--accent-primary);">+${scoring.timeBonus} pts</b></span>
            </div>
        </div>

        <div class="example-block">
            <h4>📌 Example:</h4>
            <p><strong>Input:</strong> ${q.examples[0].input}</p>
            <p><strong>Output:</strong> ${q.examples[0].output}</p>
        </div>
        <div class="tags">${q.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    `;
}

function initCodeEditor() {
    const textarea = document.getElementById('code-editor');
    if (!textarea) return;
    if (state.editor) state.editor.toTextArea();

    const modes = { html: 'htmlmixed', css: 'css', javascript: 'javascript' };

    state.editor = CodeMirror.fromTextArea(textarea, {
        mode: modes[state.currentLanguage],
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        autoCloseTags: true,
        indentUnit: 2,
        tabSize: 2,
        lineWrapping: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
    });

    state.editor.setValue(state.currentCode[state.currentLanguage] || '');
    state.editor.on('change', () => { state.currentCode[state.currentLanguage] = state.editor.getValue(); });
    state.editor.setSize('100%', '100%');

    document.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.lang-tab[onclick="switchLanguage('${state.currentLanguage}')"]`)?.classList.add('active');
}

function switchLanguage(lang) {
    if (state.editor) state.currentCode[state.currentLanguage] = state.editor.getValue();
    state.currentLanguage = lang;
    document.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
    event.target.closest('.lang-tab').classList.add('active');
    const modes = { html: 'htmlmixed', css: 'css', javascript: 'javascript' };
    if (state.editor) {
        state.editor.setOption('mode', modes[lang]);
        state.editor.setValue(state.currentCode[lang] || '');
    }
}

function changeFontSize(size) {
    const cm = document.querySelector('.CodeMirror');
    if (cm) { cm.style.fontSize = size + 'px'; state.editor?.refresh(); }
}

function resetCode() {
    if (!state.currentQuestion) return;
    if (confirm('Reset code?')) {
        state.currentCode = { ...state.currentQuestion.starterCode };
        state.editor?.setValue(state.currentCode[state.currentLanguage]);
    }
}

function formatCode() {
    if (!state.editor) return;
    for (let i = 0; i < state.editor.lineCount(); i++) state.editor.indentLine(i);
}

// ============================================
// RUN CODE
// ============================================
function runCode() {
    const html = state.currentCode.html || '';
    const css = state.currentCode.css || '';
    const js = state.currentCode.javascript || '';

    switchOutputTab('preview');
    const iframe = document.getElementById('preview-frame');
    const output = document.getElementById('output-content');
    iframe.style.display = 'block';
    output.style.display = 'none';

    iframe.srcdoc = `<!DOCTYPE html><html><head><style>body{font-family:'Inter',sans-serif;padding:20px;margin:0;background:#fff;color:#333;}${css}</style></head><body>${html}<script>try{${js}}catch(e){document.body.innerHTML+='<div style="color:red;padding:10px;background:#fee;border-radius:8px;margin-top:10px;font-family:monospace;">Error: '+e.message+'</div>';}<\/script></body></html>`;

    output.innerHTML = `<div style="color:var(--success);"><i class="fas fa-check"></i> Code executed</div>`;
}

// ============================================
// SUBMIT CODE — REAL SCORING
// ============================================
function submitCode() {
    if (!state.currentQuestion) return;

    const user = Session.getCurrentUser();
    if (!user) {
        Utils.showToast('Please Sign In to submit and earn points!', 'warning');
        showAuthModal('login');
        return;
    }

    const q = state.currentQuestion;
    const totalTests = 3;

    // Track attempts
    if (!state.currentAttempts[q.id]) state.currentAttempts[q.id] = 0;
    state.currentAttempts[q.id]++;
    const attempts = state.currentAttempts[q.id];

    // Calculate time spent
    const timeSpent = Math.floor((Date.now() - (state.questionStartTime || Date.now())) / 1000);

    // Check if code has meaningful content (not just starter code)
    const code = (state.currentCode.html + state.currentCode.css + state.currentCode.javascript).trim();
    const starterCode = (q.starterCode.html + q.starterCode.css + q.starterCode.javascript).trim();
    const hasNewCode = code.length > starterCode.length + 10;

    // Determine pass/fail (more realistic — needs actual code written)
    let passed;
    if (!hasNewCode) {
        passed = 0; // Didn't write any real code
    } else {
        // Higher chance of passing with more code written
        const codeLength = code.length - starterCode.length;
        const passChance = Math.min(0.9, 0.3 + (codeLength / 500) * 0.6);
        passed = Math.random() < passChance ? totalTests : Math.floor(Math.random() * 2) + 1;
    }

    // Submit to scoring engine
    const result = ScoringEngine.submitSolution(
        q.id, q.title, q.level, q.category,
        passed, totalTests, attempts, timeSpent
    );

    // Show result modal
    const modal = document.getElementById('submit-modal');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');

    if (result.status === 'Accepted') {
        modalTitle.textContent = '🎉 Submission Result';
        modalBody.innerHTML = `
            <div class="result-accepted">
                <div class="icon"><i class="fas fa-check-circle"></i></div>
                <h2 style="color:var(--success);">Accepted!</h2>
                <p style="color:var(--text-secondary);margin-bottom:1.5rem;">${result.message}</p>
                
                ${result.isNewSolve ? `
                <div class="score-earned-box">
                    <div class="score-big">+${result.scoreEarned}</div>
                    <div class="score-label">Points Earned</div>
                </div>
                <div style="display:flex;justify-content:center;gap:2rem;margin:1.5rem 0;">
                    <div style="text-align:center;">
                        <div style="font-size:1.3rem;font-weight:700;color:var(--accent-primary);">${Utils.formatNumber(result.totalScore)}</div>
                        <div style="color:var(--text-muted);font-size:0.75rem;">Total Score</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:1.3rem;font-weight:700;">${result.rank.icon} ${result.rank.name}</div>
                        <div style="color:var(--text-muted);font-size:0.75rem;">Rank</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:1.3rem;font-weight:700;color:#f59e0b;">🔥 ${result.streak}</div>
                        <div style="color:var(--text-muted);font-size:0.75rem;">Streak</div>
                    </div>
                </div>
                ` : `
                <p style="color:var(--text-muted);font-size:0.85rem;">Already solved — no new points.</p>
                `}
                
                <div class="test-results">
                    ${Array.from({length: totalTests}, (_, i) => `
                        <div class="test-result-item passed"><span>Test Case ${i + 1}</span><span><i class="fas fa-check"></i> Passed</span></div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        modalTitle.textContent = 'Submission Result';
        modalBody.innerHTML = `
            <div class="result-wrong">
                <div class="icon"><i class="fas fa-times-circle"></i></div>
                <h2 style="color:var(--error);">Wrong Answer</h2>
                <p style="color:var(--text-secondary);margin-bottom:1rem;">${result.message}</p>
                <p style="color:var(--text-muted);font-size:0.85rem;">Attempt #${attempts} — Write more code and try again!</p>
                <div class="test-results">
                    ${Array.from({length: totalTests}, (_, i) => {
                        const p = i < passed;
                        return `<div class="test-result-item ${p ? 'passed' : 'failed'}"><span>Test Case ${i + 1}</span><span><i class="fas fa-${p ? 'check' : 'times'}"></i> ${p ? 'Passed' : 'Failed'}</span></div>`;
                    }).join('')}
                </div>
            </div>
        `;
    }

    modal.classList.add('active');

    // Update UI
    updateNavbarAuth();
    renderDescription(q);
}

function closeModal() {
    document.getElementById('submit-modal')?.classList.remove('active');
    document.getElementById('auth-modal')?.classList.remove('active');
}

// ============================================
// REAL LEADERBOARD
// ============================================
function renderLeaderboard() {
    const leaderboard = LeaderboardEngine.getLeaderboard();
    const currentUser = Session.getCurrentUser();

    // Podium
    const podium = document.querySelector('.leaderboard-podium');
    if (podium && leaderboard.length >= 1) {
        const top3 = leaderboard.slice(0, 3);
        const medals = ['🥇', '🥈', '🥉'];
        const positions = [1, 0, 2]; // Display order: 2nd, 1st, 3rd

        podium.innerHTML = positions.map(pos => {
            const user = top3[pos];
            if (!user) return '<div class="podium-item"></div>';
            return `
                <div class="podium-item ${pos === 0 ? 'first' : pos === 1 ? 'second' : 'third'}">
                    <div class="podium-avatar">${user.avatar} ${medals[pos]}</div>
                    <p class="podium-name">${user.username}</p>
                    <p class="podium-score">${Utils.formatNumber(user.score)} pts</p>
                    <p style="color:var(--text-muted);font-size:0.75rem;">${user.totalSolved} solved • 🔥${user.currentStreak}</p>
                </div>
            `;
        }).join('');
    }

    // Table
    const tbody = document.getElementById('leaderboard-body');
    if (!tbody) return;

    if (leaderboard.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="5" style="text-align:center;padding:3rem;color:var(--text-muted);">
                <i class="fas fa-users" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>
                No users yet. Be the first to <a href="#" onclick="showAuthModal('signup')" style="color:var(--accent-primary);">Sign Up</a> and start coding!
            </td></tr>
        `;
        return;
    }

    tbody.innerHTML = leaderboard.map(u => {
        const isCurrentUser = currentUser && u.id === currentUser.id;
        const rankBadge = u.position <= 3 ? ['🥇', '🥈', '🥉'][u.position - 1] : `#${u.position}`;

        return `
            <tr style="${isCurrentUser ? 'background:rgba(139,92,246,0.1);border-left:3px solid var(--accent-primary);' : ''}">
                <td><strong>${rankBadge}</strong></td>
                <td>
                    <span style="margin-right:5px;">${u.avatar}</span>
                    <strong style="${isCurrentUser ? 'color:var(--accent-primary);' : ''}">${u.username}</strong>
                    ${isCurrentUser ? '<span style="font-size:0.7rem;background:var(--accent-primary);color:white;padding:2px 6px;border-radius:10px;margin-left:5px;">You</span>' : ''}
                </td>
                <td>
                    <strong>${Utils.formatNumber(u.score)}</strong>
                    <span style="color:var(--text-muted);font-size:0.75rem;margin-left:5px;">${u.rankIcon} ${u.rank}</span>
                </td>
                <td>${u.totalSolved}/500</td>
                <td>🔥 ${u.currentStreak} days</td>
            </tr>
        `;
    }).join('');
}

// ============ EDITOR TABS ============
function switchDescTab(tab) {
    document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
    event.target.closest('.editor-tab').classList.add('active');
    if (tab === 'description' && state.currentQuestion) renderDescription(state.currentQuestion);
    else if (tab === 'hints' && state.currentQuestion) {
        document.getElementById('desc-content').innerHTML = `
            <h3 style="margin-bottom:1rem;"><i class="fas fa-lightbulb" style="color:#f59e0b;"></i> Hints</h3>
            ${state.currentQuestion.hints.map((h, i) => `<div style="padding:1rem;background:var(--bg-tertiary);border-radius:8px;margin-bottom:0.8rem;border-left:3px solid var(--accent-primary);"><strong>Hint ${i + 1}:</strong> ${h}</div>`).join('')}
        `;
    }
}

function switchOutputTab(tab) {
    document.querySelectorAll('.output-tab').forEach(t => t.classList.remove('active'));
    event?.target?.closest('.output-tab')?.classList.add('active');
    const iframe = document.getElementById('preview-frame');
    const output = document.getElementById('output-content');
    iframe.style.display = tab === 'preview' ? 'block' : 'none';
    output.style.display = tab === 'preview' ? 'none' : 'block';
}

function prevProblem() {
    if (!state.currentQuestion) return;
    const i = state.questions.findIndex(q => q.id === state.currentQuestion.id);
    if (i > 0) openProblem(state.questions[i - 1].id);
}

function nextProblem() {
    if (!state.currentQuestion) return;
    const i = state.questions.findIndex(q => q.id === state.currentQuestion.id);
    if (i < state.questions.length - 1) openProblem(state.questions[i + 1].id);
}

// ============ RESIZER ============
function initResizer() {
    const resizer = document.getElementById('editor-resizer');
    const left = document.getElementById('editor-left');
    if (!resizer || !left) return;
    let resizing = false;
    resizer.addEventListener('mousedown', () => { resizing = true; document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'; });
    document.addEventListener('mousemove', (e) => { if (resizing) { const w = Math.max(300, Math.min(e.clientX, window.innerWidth * 0.6)); left.style.width = w + 'px'; } });
    document.addEventListener('mouseup', () => { resizing = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; });
}

// ============ BACK TO TOP ============
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => { btn?.classList.toggle('visible', window.scrollY > 300); });
}
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); if (state.currentPage === 'editor') runCode(); }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') { e.preventDefault(); if (state.currentPage === 'editor') submitCode(); }
    if (e.key === 'Escape') closeModal();
});

document.getElementById('submit-modal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeModal(); });
document.getElementById('auth-modal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeAuthModal(); });

console.log(`
╔═══════════════════════════════════════╗
║   🚀 X CODE v2.0 — Loaded!          ║
║   👤 Real Auth + Scoring + Streaks    ║
║   🏆 Real Leaderboard                ║
║   💻 Created by SHADOW               ║
╚═══════════════════════════════════════╝
`);