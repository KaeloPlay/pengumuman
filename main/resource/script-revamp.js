// # CODE RE-ORGANIZED BY GPT

// =====================
// STATE
// =====================
let data = {};
let tanggal;
let mapel = [];
let ulangan = [];
let pr = [];
let piket = [];
let note = '';
let checkedPR = {};

let lowMode = false;
let frameCount = 0;
let lastSampleTime = performance.now();

let startX = 0;
let startY = 0;
let currentX = 0;
let isDragging = false;
let isHorizontal = null;
let currentPage = 0;
let prevPage = 0;
let pageWidth;


// =====================
// CONFIG
// =====================
const LOW_FPS_ON = 30;
const LOW_FPS_OFF = 50;
const SAMPLE_RATE = 1000;


// =====================
// DOM CACHE
// =====================
const el = {
    header: document.querySelector('.header'),
    cards: document.querySelectorAll('.card'),
    subinfoAll: document.querySelectorAll('.subinfo'),
    subinfo: document.querySelector('.subinfo'),

    tanggal: document.querySelector('#date'),
    version: document.querySelector('#version'),

    mapelList: document.querySelector('.mapel ul'),
    ulanganList: document.querySelector('.ulangan ul'),
    prList: document.querySelector('.pr ul'),
    piketList: document.querySelector('.piket ul'),
    note: document.querySelector('.note p'),

    ulanganParent: document.querySelector('.ulangan'),
    prParent: document.querySelector('.pr'),
    piketParent: document.querySelector('.piket'),
    twoRow: document.querySelector('.two-row'),

    pageIndicator: document.querySelector('#page-indicator'),
    indicators: document.querySelector('#page-indicator').querySelectorAll('li'),

    prSection: document.querySelector('#pr-section'),
    piketSection: document.querySelector('#piket-section'),
};


// =====================
// FPS MONITOR
// =====================
function checkFPS(now) {
    frameCount++;
    const elapsed = now - lastSampleTime;

    if (elapsed > SAMPLE_RATE * 2) {
        lastSampleTime = now;
        frameCount = 0;
        requestAnimationFrame(checkFPS);
        return;
    }

    if (elapsed >= SAMPLE_RATE) {
        const fps = Math.round((frameCount * 1000) / elapsed);

        if (!lowMode && fps < LOW_FPS_ON) {
            lowMode = true;
            document.body.classList.add('low-mode');
            console.warn(`Low FPS: ${fps}. Low mode enabled.`);
        } else if (lowMode && fps >= LOW_FPS_OFF) {
            lowMode = false;
            document.body.classList.remove('low-mode');
            console.log(`FPS recovered: ${fps}. Low mode disabled.`);
        }

        frameCount = 0;
        lastSampleTime = now;
    }

    requestAnimationFrame(checkFPS);
}


// =====================
// API
// =====================
async function checkVersion() {
    try {
        const res = await fetch('https://viic-pengumuman.vercel.app/api/build-version');
        const data = await res.json();

        CURRENT_VERSION = JSON.parse(localStorage.getItem('app_version')) || null;
        console.log('Current version:', CURRENT_VERSION);

        el.version.textContent = `Build: ${data.version}`;

        if (data.version !== CURRENT_VERSION) {
            localStorage.setItem('app_version', JSON.stringify(data.version));
            window.location.reload();
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error('Error checking version:', error);
    }
}

async function getData() {
    checkVersion();

    try {
        const res = await fetch('https://viic-pengumuman.vercel.app/api/pengumuman');
        data = await res.json();

        console.log('Data fetched:', data);

        tanggal = data.tanggal_besok;
        mapel = data.mapel.split(',').map(i => i.trim());
        ulangan = data.ulangan.split('$').map(i => i.trim());
        pr = data.pr.split('$').map(i => i.trim());
        piket = data.piket.split(',').map(i => i.trim());
        note = data.note;

        const lastUUID = JSON.parse(localStorage.getItem('current_uuid')) || 0;

        checkedPR = (data.uuid === lastUUID)
            ? JSON.parse(localStorage.getItem('checkedPR')) || {}
            : {};

        renderData();
        addWhenClicked();

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Sepertinya terjadi error: (Error fetching data:', error, ')');
    }
}


// =====================
// RENDER
// =====================
function renderData() {
    el.mapelList.innerHTML = '';
    el.ulanganList.innerHTML = '';
    el.prList.innerHTML = '';
    el.piketList.innerHTML = '';

    el.tanggal.textContent = `( ${tanggal} )`;

    renderMapel();
    renderUlangan();
    renderPR();
    renderPiket();
    renderNote();
    renderLayout();

    showAll();
}

function renderMapel() {
    mapel.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        el.mapelList.appendChild(li);
    });
}

function renderUlangan() {
    ulangan.forEach((item, index) => {
        if (ulangan.join('').trim() !== "") {
            el.ulanganParent.classList.remove('empty');

            const li = document.createElement('li');
            li.textContent = item;
            li.dataset.index = index;

            el.ulanganList.appendChild(li);
        } else {
            el.ulanganParent.classList.add('empty');
        }
    });
}

function renderPR() {
    pr.forEach((item, index) => {
        if (pr.join('').trim() !== "") {
            el.prParent.classList.remove('empty');

            const li = document.createElement('li');

            if (item.includes('#')) {
                li.classList.add('placeholder');
                item = item.replace('#', '').trim();
            }

            li.textContent = item;
            li.dataset.index = index;

            if (checkedPR[index]) li.classList.add('done');

            el.prList.appendChild(li);

        } else {
            el.prParent.classList.add('empty');
            document.querySelectorAll('.two-row .card')
                .forEach(card => card.style.maxWidth = '100%');
        }
    });
}

function renderPiket() {
    piket.forEach(item => {
        if (piket.join('').trim() !== "") {
            el.piketParent.classList.remove('empty', 'stretch', 'fix');

            const li = document.createElement('li');
            li.textContent = item;
            el.piketList.appendChild(li);
        } else {
            el.piketParent.classList.add('empty', 'stretch', 'fix');
        }
    });
}

function renderNote() {
    if (note.includes('@')) {
        note = note.replace('@', '');
        el.note.classList.add('center');
    } else {
        el.note.classList.remove('center');
    }

    el.note.textContent = note;
}

function renderLayout() {
    if (pr.join('').trim() === "" && piket.join('').trim() === "") {
        el.twoRow.classList.add('empty');
    } else {
        el.twoRow.classList.remove('empty');
    }
}


// =====================
// EVENTS
// =====================
function addWhenClicked() {
    const prItems = document.querySelectorAll('.pr li');

    prItems.forEach(item => {
        if (item.classList.contains('placeholder')) return;

        item.addEventListener('click', () => {
            navigator.vibrate(40);
            item.classList.toggle('done');

            const index = item.dataset.index;
            checkedPR[index] = item.classList.contains('done');

            localStorage.setItem('checkedPR', JSON.stringify(checkedPR));
            localStorage.setItem('current_uuid', JSON.stringify(data.uuid));
        });
    });
}

function setupSwipe() {
    container.addEventListener('pointerdown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        isHorizontal = null;
        container.style.transition = 'none';
    });

    window.addEventListener('pointermove', (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = Math.abs(e.clientY - startY);

        if (isHorizontal === null) {
            if (Math.abs(dx) > 15 && Math.abs(dx) > dy) isHorizontal = true;
            else if (dy > 15) isHorizontal = false;
        }

        if (isHorizontal) {
            e.preventDefault();

            pageWidth = document.querySelector('.page').clientWidth;
            let moveX = (-currentPage * pageWidth) + dx;

            if (moveX > 60) moveX = 60;
            if (moveX < -(window.innerWidth + 60)) moveX = -(window.innerWidth + 60);

            container.style.transform = `translateX(${moveX}px)`;
        }
    });

    window.addEventListener('pointerup', (e) => {
        if (!isDragging) return;
        isDragging = false;

        const dx = e.clientX - startX;
        const threshold = window.innerWidth * 0.25;

        container.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

        if (isHorizontal) {
            if (dx < -threshold && currentPage === 0) currentPage = 1;
            else if (dx > threshold && currentPage === 1) currentPage = 0;

            updatePageIndicator();
        }

        container.style.transform = `translateX(${-currentPage * pageWidth}px)`;

        if (currentPage !== prevPage) {
            prevPage = currentPage;

            setTimeout(() => {
                document.querySelector('html').scrollIntoView({ scrollBehavior: 'smooth' });
            }, 500);
        }
    });
}

function setupVisibility() {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            if (checkVersion()) {
                hideAll();
                getData();
            }
        }
    });
}

function setupPRStretch() {
    el.prSection.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'li' || el.prSection.classList.contains('fix')) return;

        navigator.vibrate(30);
        el.piketSection.style.opacity = 0;

        el.prSection.classList.toggle('stretch');

        setTimeout(() => {
            el.piketSection.style.opacity = 1;
        }, 500);
    });
}


// =====================
// UI CONTROL
// =====================
function showAll() {
    el.header.classList.remove('hidden');
    el.header.classList.add('show');

    const visibleCards = Array.from(el.cards)
        .filter(card => !card.classList.contains('empty'));

    visibleCards.forEach((card, i) => {
        setTimeout(() => {
            card.classList.remove('hidden');
            card.classList.add('show');
        }, i * 100);
    });

    el.subinfoAll.forEach(s => {
        s.classList.remove('hidden');
        s.classList.add('show');
    });

    el.pageIndicator.classList.remove('hidden');
    el.pageIndicator.classList.add('show');

    setTimeout(updatePageIndicator, 500);
}

function hideAll() {
    el.header.classList.remove('show');
    el.header.classList.add('hidden');

    el.cards.forEach((card, i) => {
        setTimeout(() => {
            card.classList.remove('show');
            card.classList.add('hidden');
        }, i * 100);
    });

    el.subinfo.classList.remove('show');
    el.subinfo.classList.add('hidden');
}

function updatePageIndicator() {
    el.indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentPage);
    });
}


// =====================
// INIT
// =====================
function init() {
    requestAnimationFrame(checkFPS);
    setupVisibility();
    setupSwipe();
    setupPRStretch();
    getData();
}

init();