// ============================================
// X CODE — Code Editor Manager
// Created by SHADOW
// ============================================

class XCodeEditor {
    constructor() {
        this.editors = {
            html: null,
            css: null,
            javascript: null
        };
        this.activeLanguage = 'javascript';
        this.currentEditor = null;
        this.fontSize = 14;
        this.theme = 'dracula';
        this.autoSave = true;
        this.autoSaveTimer = null;
        this.history = {
            html: [],
            css: [],
            javascript: []
        };
        this.historyIndex = {
            html: -1,
            css: -1,
            javascript: -1
        };
        this.maxHistory = 50;
    }

    // ============ INITIALIZATION ============
    init(containerId, language = 'javascript', code = '') {
        const textarea = document.getElementById(containerId);
        if (!textarea) {
            console.error(`Editor container #${containerId} not found`);
            return null;
        }

        // Destroy existing editor
        if (this.currentEditor) {
            this.currentEditor.toTextArea();
        }

        const modeMap = {
            html: 'htmlmixed',
            css: 'css',
            javascript: 'javascript'
        };

        const config = {
            mode: modeMap[language] || 'javascript',
            theme: this.theme,
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            autoCloseTags: true,
            indentUnit: 2,
            tabSize: 2,
            lineWrapping: true,
            foldGutter: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            extraKeys: {
                'Ctrl-Enter': () => this.onRun?.(),
                'Cmd-Enter': () => this.onRun?.(),
                'Ctrl-Shift-Enter': () => this.onSubmit?.(),
                'Cmd-Shift-Enter': () => this.onSubmit?.(),
                'Ctrl-S': (cm) => {
                    event?.preventDefault();
                    this.saveToLocal();
                },
                'Cmd-S': (cm) => {
                    event?.preventDefault();
                    this.saveToLocal();
                },
                'Ctrl-Z': (cm) => cm.undo(),
                'Ctrl-Shift-Z': (cm) => cm.redo(),
                'Ctrl-/': (cm) => this.toggleComment(cm),
                'Ctrl-D': (cm) => this.duplicateLine(cm),
                'Alt-Up': (cm) => this.moveLine(cm, 'up'),
                'Alt-Down': (cm) => this.moveLine(cm, 'down'),
                'Tab': (cm) => {
                    if (cm.somethingSelected()) {
                        cm.indentSelection('add');
                    } else {
                        cm.replaceSelection('  ', 'end');
                    }
                }
            }
        };

        this.currentEditor = CodeMirror.fromTextArea(textarea, config);
        this.currentEditor.setValue(code);
        this.currentEditor.setSize('100%', '100%');
        this.activeLanguage = language;

        // Change listener
        this.currentEditor.on('change', (cm) => {
            this.onCodeChange?.(cm.getValue(), language);
            
            // Auto-save
            if (this.autoSave) {
                clearTimeout(this.autoSaveTimer);
                this.autoSaveTimer = setTimeout(() => this.saveToLocal(), 2000);
            }
        });

        // Cursor activity
        this.currentEditor.on('cursorActivity', (cm) => {
            this.onCursorChange?.(cm.getCursor());
        });

        this.updateFontSize();
        return this.currentEditor;
    }

    // ============ LANGUAGE SWITCHING ============
    switchLanguage(language, code = '') {
        if (!this.currentEditor) return;

        const modeMap = {
            html: 'htmlmixed',
            css: 'css',
            javascript: 'javascript'
        };

        this.activeLanguage = language;
        this.currentEditor.setOption('mode', modeMap[language] || 'javascript');
        this.currentEditor.setValue(code);
        this.currentEditor.focus();
        this.currentEditor.setCursor(this.currentEditor.lineCount(), 0);
    }

    // ============ CODE OPERATIONS ============
    getValue() {
        return this.currentEditor?.getValue() || '';
    }

    setValue(code) {
        this.currentEditor?.setValue(code);
    }

    getSelection() {
        return this.currentEditor?.getSelection() || '';
    }

    replaceSelection(text) {
        this.currentEditor?.replaceSelection(text);
    }

    insertAtCursor(text) {
        const cursor = this.currentEditor?.getCursor();
        if (cursor) {
            this.currentEditor.replaceRange(text, cursor);
        }
    }

    // ============ FORMATTING ============
    format() {
        if (!this.currentEditor) return;
        
        const code = this.currentEditor.getValue();
        let formatted = code;

        try {
            if (this.activeLanguage === 'javascript') {
                // Basic JS formatting
                formatted = this.formatJavaScript(code);
            } else if (this.activeLanguage === 'css') {
                formatted = this.formatCSS(code);
            } else if (this.activeLanguage === 'html') {
                formatted = this.formatHTML(code);
            }

            this.currentEditor.setValue(formatted);
            
            // Auto-indent all lines
            for (let i = 0; i < this.currentEditor.lineCount(); i++) {
                this.currentEditor.indentLine(i);
            }
        } catch (e) {
            console.warn('Format error:', e);
            // Fallback: just auto-indent
            for (let i = 0; i < this.currentEditor.lineCount(); i++) {
                this.currentEditor.indentLine(i);
            }
        }
    }

    formatJavaScript(code) {
        // Basic formatting
        return code
            .replace(/\{(?!\n)/g, '{\n')
            .replace(/(?<!\n)\}/g, '\n}')
            .replace(/;\s*/g, ';\n')
            .replace(/\n\s*\n\s*\n/g, '\n\n');
    }

    formatCSS(code) {
        return code
            .replace(/\{(?!\n)/g, '{\n  ')
            .replace(/;\s*/g, ';\n  ')
            .replace(/\s*\}/g, '\n}')
            .replace(/\n\s*\n\s*\n/g, '\n\n');
    }

    formatHTML(code) {
        let indent = 0;
        const lines = code.replace(/>\s*</g, '>\n<').split('\n');
        return lines.map(line => {
            line = line.trim();
            if (line.match(/^<\/(.*?)>/)) indent--;
            const indented = '  '.repeat(Math.max(0, indent)) + line;
            if (line.match(/^<[^/!].*[^/]>$/) && !line.match(/^<(img|br|hr|input|meta|link)/i)) indent++;
            return indented;
        }).join('\n');
    }

    // ============ LINE OPERATIONS ============
    toggleComment(cm) {
        const selections = cm.listSelections();
        selections.forEach(sel => {
            const from = sel.from().line;
            const to = sel.to().line;
            
            for (let i = from; i <= to; i++) {
                const line = cm.getLine(i);
                if (this.activeLanguage === 'javascript') {
                    if (line.trim().startsWith('//')) {
                        cm.replaceRange(
                            line.replace(/^(\s*)\/\/\s?/, '$1'),
                            { line: i, ch: 0 },
                            { line: i, ch: line.length }
                        );
                    } else {
                        cm.replaceRange(
                            line.replace(/^(\s*)/, '$1// '),
                            { line: i, ch: 0 },
                            { line: i, ch: line.length }
                        );
                    }
                } else if (this.activeLanguage === 'css') {
                    if (line.trim().startsWith('/*')) {
                        cm.replaceRange(
                            line.replace(/\/\*\s?/, '').replace(/\s?\*\//, ''),
                            { line: i, ch: 0 },
                            { line: i, ch: line.length }
                        );
                    } else {
                        cm.replaceRange(
                            `/* ${line.trim()} */`,
                            { line: i, ch: 0 },
                            { line: i, ch: line.length }
                        );
                    }
                } else if (this.activeLanguage === 'html') {
                    if (line.trim().startsWith('<!--')) {
                        cm.replaceRange(
                            line.replace(/<!--\s?/, '').replace(/\s?-->/, ''),
                            { line: i, ch: 0 },
                            { line: i, ch: line.length }
                        );
                    } else {
                        cm.replaceRange(
                            `<!-- ${line.trim()} -->`,
                            { line: i, ch: 0 },
                            { line: i, ch: line.length }
                        );
                    }
                }
            }
        });
    }

    duplicateLine(cm) {
        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        cm.replaceRange('\n' + line, { line: cursor.line, ch: line.length });
        cm.setCursor(cursor.line + 1, cursor.ch);
    }

    moveLine(cm, direction) {
        const cursor = cm.getCursor();
        const line = cursor.line;
        
        if (direction === 'up' && line > 0) {
            const currentLine = cm.getLine(line);
            const prevLine = cm.getLine(line - 1);
            cm.replaceRange(currentLine, { line: line - 1, ch: 0 }, { line: line - 1, ch: prevLine.length });
            cm.replaceRange(prevLine, { line: line, ch: 0 }, { line: line, ch: currentLine.length });
            cm.setCursor(line - 1, cursor.ch);
        } else if (direction === 'down' && line < cm.lineCount() - 1) {
            const currentLine = cm.getLine(line);
            const nextLine = cm.getLine(line + 1);
            cm.replaceRange(nextLine, { line: line, ch: 0 }, { line: line, ch: currentLine.length });
            cm.replaceRange(currentLine, { line: line + 1, ch: 0 }, { line: line + 1, ch: nextLine.length });
            cm.setCursor(line + 1, cursor.ch);
        }
    }

    // ============ THEME & SETTINGS ============
    setTheme(theme) {
        this.theme = theme;
        this.currentEditor?.setOption('theme', theme);
    }

    setFontSize(size) {
        this.fontSize = size;
        this.updateFontSize();
    }

    updateFontSize() {
        const cmEl = document.querySelector('.CodeMirror');
        if (cmEl) {
            cmEl.style.fontSize = this.fontSize + 'px';
            this.currentEditor?.refresh();
        }
    }

    setLineWrapping(wrap) {
        this.currentEditor?.setOption('lineWrapping', wrap);
    }

    setAutoSave(enabled) {
        this.autoSave = enabled;
    }

    // ============ LOCAL STORAGE ============
    saveToLocal() {
        if (!state.currentQuestion) return;
        
        const key = `xcode_code_${state.currentQuestion.id}`;
        const data = {
            html: state.currentCode.html,
            css: state.currentCode.css,
            javascript: state.currentCode.javascript,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify(data));
    }

    loadFromLocal(questionId) {
        const key = `xcode_code_${questionId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    clearLocal(questionId) {
        localStorage.removeItem(`xcode_code_${questionId}`);
    }

    // ============ CODE EXECUTION ============
    execute() {
        const html = state.currentCode.html || '';
        const css = state.currentCode.css || '';
        const js = state.currentCode.javascript || '';

        const fullCode = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Inter', -apple-system, sans-serif; 
                        padding: 20px; 
                        background: #ffffff;
                        color: #1a1a1a;
                        line-height: 1.6;
                    }
                    ${css}
                </style>
            </head>
            <body>
                ${html}
                <script>
                    // Capture console output
                    const __logs = [];
                    const __originalConsole = {
                        log: console.log.bind(console),
                        error: console.error.bind(console),
                        warn: console.warn.bind(console)
                    };
                    
                    console.log = (...args) => {
                        __logs.push({ type: 'log', args: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)) });
                        __originalConsole.log(...args);
                    };
                    console.error = (...args) => {
                        __logs.push({ type: 'error', args: args.map(String) });
                        __originalConsole.error(...args);
                    };
                    console.warn = (...args) => {
                        __logs.push({ type: 'warn', args: args.map(String) });
                        __originalConsole.warn(...args);
                    };

                    try {
                        ${js}
                    } catch(e) {
                        console.error(e.message);
                        document.body.innerHTML += '<div style="color:#ef4444;padding:12px;background:#fef2f2;border-radius:8px;margin-top:12px;font-family:monospace;font-size:13px;border:1px solid #fecaca;"><strong>❌ Error:</strong> ' + e.message + '</div>';
                    }
                    
                    // Send logs to parent
                    window.parent.postMessage({ type: 'console', logs: __logs }, '*');
                </script>
            </body>
            </html>
        `;

        return fullCode;
    }

    // ============ SNIPPETS ============
    insertSnippet(snippetName) {
        const snippets = {
            // HTML Snippets
            'html-boilerplate': '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>',
            'div-container': '<div class="container">\n  \n</div>',
            'nav-bar': '<nav class="navbar">\n  <a href="#" class="logo">Logo</a>\n  <ul class="nav-links">\n    <li><a href="#">Home</a></li>\n    <li><a href="#">About</a></li>\n    <li><a href="#">Contact</a></li>\n  </ul>\n</nav>',
            'card': '<div class="card">\n  <img src="" alt="" class="card-image">\n  <div class="card-body">\n    <h3 class="card-title">Title</h3>\n    <p class="card-text">Description</p>\n    <button class="card-btn">Action</button>\n  </div>\n</div>',
            'form-login': '<form class="login-form">\n  <h2>Login</h2>\n  <div class="form-group">\n    <label for="email">Email</label>\n    <input type="email" id="email" required>\n  </div>\n  <div class="form-group">\n    <label for="password">Password</label>\n    <input type="password" id="password" required>\n  </div>\n  <button type="submit">Login</button>\n</form>',

            // CSS Snippets
            'flex-center': 'display: flex;\njustify-content: center;\nalign-items: center;',
            'grid-3col': 'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 1rem;',
            'responsive-img': 'max-width: 100%;\nheight: auto;\ndisplay: block;',
            'glassmorphism': 'background: rgba(255, 255, 255, 0.15);\nbackdrop-filter: blur(10px);\nborder: 1px solid rgba(255, 255, 255, 0.2);\nborder-radius: 12px;',
            'smooth-shadow': 'box-shadow: 0 1px 2px rgba(0,0,0,0.07),\n  0 2px 4px rgba(0,0,0,0.07),\n  0 4px 8px rgba(0,0,0,0.07),\n  0 8px 16px rgba(0,0,0,0.07);',

            // JS Snippets
            'fetch-get': 'async function fetchData(url) {\n  try {\n    const response = await fetch(url);\n    if (!response.ok) throw new Error(`HTTP ${response.status}`);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error("Fetch error:", error);\n  }\n}',
            'event-listener': 'document.querySelector("#btn").addEventListener("click", (e) => {\n  e.preventDefault();\n  // Handle click\n});',
            'debounce': 'function debounce(fn, delay = 300) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}',
            'class-template': 'class MyClass {\n  #privateField;\n\n  constructor(value) {\n    this.#privateField = value;\n  }\n\n  get value() {\n    return this.#privateField;\n  }\n\n  method() {\n    return this.#privateField;\n  }\n}',
            'dom-create': 'function createElement(tag, attrs = {}, children = []) {\n  const el = document.createElement(tag);\n  Object.entries(attrs).forEach(([key, val]) => {\n    if (key === "class") el.className = val;\n    else if (key === "text") el.textContent = val;\n    else el.setAttribute(key, val);\n  });\n  children.forEach(child => {\n    if (typeof child === "string") el.appendChild(document.createTextNode(child));\n    else el.appendChild(child);\n  });\n  return el;\n}'
        };

        const snippet = snippets[snippetName];
        if (snippet) {
            this.insertAtCursor(snippet);
        }
    }

    // ============ SEARCH & REPLACE ============
    search(query) {
        if (!this.currentEditor) return;
        // Use CodeMirror's search
        const cursor = this.currentEditor.getSearchCursor(query);
        if (cursor.findNext()) {
            this.currentEditor.setSelection(cursor.from(), cursor.to());
        }
    }

    replaceAll(search, replace) {
        if (!this.currentEditor) return;
        const code = this.currentEditor.getValue();
        const newCode = code.split(search).join(replace);
        this.currentEditor.setValue(newCode);
    }

    // ============ INFO ============
    getInfo() {
        if (!this.currentEditor) return {};
        const cursor = this.currentEditor.getCursor();
        const code = this.currentEditor.getValue();
        return {
            language: this.activeLanguage,
            lines: this.currentEditor.lineCount(),
            characters: code.length,
            cursorLine: cursor.line + 1,
            cursorCol: cursor.ch + 1,
            selection: this.currentEditor.getSelection().length,
            theme: this.theme,
            fontSize: this.fontSize
        };
    }

    // ============ CLEANUP ============
    destroy() {
        if (this.currentEditor) {
            this.currentEditor.toTextArea();
            this.currentEditor = null;
        }
        clearTimeout(this.autoSaveTimer);
    }
}

// ============ GLOBAL INSTANCE ============
const xCodeEditor = new XCodeEditor();

// Wire up callbacks
xCodeEditor.onRun = () => {
    if (typeof runCode === 'function') runCode();
};

xCodeEditor.onSubmit = () => {
    if (typeof submitCode === 'function') submitCode();
};

xCodeEditor.onCodeChange = (code, language) => {
    if (typeof state !== 'undefined') {
        state.currentCode[language] = code;
    }
};

console.log('✏️ X Code Editor Manager initialized');