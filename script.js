// INITIALISATION DE LA BASE DE DONNÉES
let AGENTS_DATABASE = {};

window.onload = () => {
    initTheme();
    loadDatabase();
    checkExistingSession();
    startClock();
    if (localStorage.getItem('sams_sidebar_collapsed') === 'true') {
        document.querySelector('.sidebar').classList.add('collapsed');
    }
};

// --- FONCTIONS SYSTÈME ---
function startClock() {
    setInterval(() => {
        document.getElementById('real-time').innerText = new Date().toLocaleTimeString('fr-FR');
    }, 1000);
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('sams_sidebar_collapsed', sidebar.classList.contains('collapsed'));
}

function initTheme() {
    const savedTheme = localStorage.getItem('sams_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);
}

function toggleTheme() {
    const target = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', target);
    localStorage.setItem('sams_theme', target);
    updateThemeUI(target);
}

function updateThemeUI(theme) {
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    text.innerText = theme === 'dark' ? 'Mode Clair' : 'Mode Sombre';
}

function setProgress(percent) {
    const bar = document.getElementById('top-progress');
    bar.style.opacity = '1'; bar.style.width = percent + '%';
    if(percent >= 100) {
        setTimeout(() => { bar.style.opacity = '0'; }, 400);
        setTimeout(() => { bar.style.width = '0%'; }, 700);
    }
}

// --- AUTHENTIFICATION ---
async function loadDatabase() {
    const status = document.getElementById('load-status');
    try {
        const response = await fetch(SAMS_CONFIG.API_URL);
        AGENTS_DATABASE = await response.json();
        status.innerHTML = '<span style="color:#22c55e">● SYSTÈME SYNCHRONISÉ</span>';
    } catch (e) {
        status.innerHTML = '<span style="color:#ef4444">● MODE HORS-LIGNE</span>';
    }
}

function checkAccess() {
    const code = document.getElementById('passkey').value.trim();
    if (!code) return;
    if (code === SAMS_CONFIG.SECOURS_CODE) finalizeLogin("DIRECTION SAMS");
    else if (AGENTS_DATABASE[code]) finalizeLogin(AGENTS_DATABASE[code]);
    else { alert("MATRICULE INCORRECT"); document.getElementById('passkey').value = ""; }
}

function finalizeLogin(name) {
    localStorage.setItem('sams_active', 'true');
    localStorage.setItem('sams_user', name);
    document.getElementById('login-gate').style.opacity = '0';
    setTimeout(() => { document.getElementById('login-gate').style.display = 'none'; }, 500);
    document.getElementById('display-name').innerText = name.toUpperCase();
}

function checkExistingSession() {
    if (localStorage.getItem('sams_active') === 'true') finalizeLogin(localStorage.getItem('sams_user'));
}

// --- NAVIGATION ---
function loadApp(key, element) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    document.querySelectorAll('.app-container').forEach(c => c.classList.remove('active'));
    const targetApp = document.getElementById('app-' + key);
    const targetIframe = document.getElementById('iframe-' + key);
    if (!targetIframe.src || targetIframe.src === window.location.href) {
        setProgress(30); targetIframe.src = SAMS_CONFIG.URLS[key];
        targetIframe.onload = () => setProgress(100);
    } else setProgress(100);
    targetApp.classList.add('active');
}

function showHome(element) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    document.querySelectorAll('.app-container').forEach(c => c.classList.remove('active'));
    document.getElementById('app-HOME').classList.add('active');
}

function logout() { localStorage.clear(); location.reload(); }