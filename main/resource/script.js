let data = {};
let tanggal;
let mapel = [];
let ulangan = [];
let pr = [];
let piket = [];
let note = [];
let checkedPR = {};

document.addEventListener('visibilitychange', () => {
    if (end) return;
    if (document.visibilityState === 'visible') {
        if (checkVersion()) {
            hideAll();
            getData();
        }
    }
});

async function checkVersion() {
    try {
        const res = await fetch('https://viic-pengumuman.vercel.app/api/api/build-version');
        const data = await res.json();

        CURRENT_VERSION = __APP_VERSION__;
        console.log('Current version:', CURRENT_VERSION);
        document.querySelector('#version').textContent = `Versi: ${data.version}`;

        if (data.version !== CURRENT_VERSION) {
            localStorage.setItem('app_version', JSON.stringify(data.version));
            window.location.reload();

            return false;
        } else {
            return true
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
        mapel = data.mapel.split(',').map(item => item.trim());
        ulangan = data.ulangan.split('$').map(item => item.trim());
        pr = data.pr.split('$').map(item => item.trim());
        piket = data.piket.split(',').map(item => item.trim());
        note = data.note;

        console.log('Tanggal:', tanggal);
        console.log('Mapel:', mapel);
        console.log('Ulangan:', ulangan);
        console.log('PR:', pr);
        console.log('Piket:', piket);
        console.log('Note:', note);

        const lastUUID = JSON.parse(localStorage.getItem('current_uuid')) || 0;

        if (data.uuid === lastUUID) {
            checkedPR = JSON.parse(localStorage.getItem('checkedPR')) || {};
        } else {
            checkedPR = {};
        }

        renderData();
        addWhenClicked();
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Roror error T_T, Error fetching data:', error);
    }
}

function renderData() {
    const tanggalEl = document.querySelector('#date');
    const ulanganCard = document.querySelector('.ulangan ul');
    const mapelCard = document.querySelector('.mapel ul');
    const prCard = document.querySelector('.pr ul');
    const piketCard = document.querySelector('.piket ul');
    const noteCard = document.querySelector('.note p');

    mapelCard.innerHTML = '';
    ulanganCard.innerHTML = '';
    prCard.innerHTML = '';
    piketCard.innerHTML = '';

    tanggalEl.textContent = (`( ${tanggal} )`);

    mapel.forEach(mapelItem => {
        const li = document.createElement('li');
        li.textContent = mapelItem;
        mapelCard.appendChild(li);
    });

    const ulanganParent = document.querySelector('.ulangan');
    ulangan.forEach((ulanganItem, index) => {
        if (ulangan.join('').trim() !== "") {
            ulanganParent.classList.remove('empty');

            const li = document.createElement('li');

            li.textContent = ulanganItem;
            li.dataset.index = index;

            ulanganCard.appendChild(li);
        } else {
            ulanganParent.classList.add('empty');
        }
    });

    const prParent = document.querySelector('.pr');
    pr.forEach((prItem, index) => {
        if (pr.join('').trim() !== "") {
            prParent.classList.remove('empty');

            const li = document.createElement('li');

            if (prItem.includes('#')) {
                li.classList.add('placeholder');
                prItem = prItem.replace('#', '').trim();
            }

            li.textContent = prItem;
            li.dataset.index = index;

            if (checkedPR[index]) li.classList.add('done');
            prCard.appendChild(li);
        } else {
            prParent.classList.add('empty');
            document.querySelectorAll('.two-row .card').forEach(card => card.style.maxWidth = '100%');
        }
    })

    piket.forEach(piketItem => {
        const li = document.createElement('li');
        li.textContent = piketItem;
        piketCard.appendChild(li);
    });

    noteCard.textContent = note;

    showAll();
}

function addWhenClicked() {
    const prItems = document.querySelectorAll('.pr li');

    prItems.forEach(pr => {
        if (pr.classList.contains('placeholder')) return;

        pr.addEventListener('click', () => {
            navigator.vibrate(40);
            pr.classList.toggle('done');

            const index = pr.dataset.index;
            checkedPR[index] = pr.classList.contains('done');
            localStorage.setItem('checkedPR', JSON.stringify(checkedPR));
            localStorage.setItem('current_uuid', JSON.stringify(data.uuid));
        });
    });
}

function showAll() {
    const headerEl = document.querySelector('.header');
    const cardEls = document.querySelectorAll('.card');
    const subinfoEls = document.querySelectorAll('.subinfo');

    headerEl.classList.remove('hidden');
    headerEl.classList.add('show');

    const visibleCards = Array.from(cardEls)
    .filter(card => !card.classList.contains('empty'));

    visibleCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.remove('hidden');
            card.classList.add('show');
        }, index * 100);
    });

    subinfoEls.forEach(subinfo => {
        subinfo.classList.remove('hidden');
        subinfo.classList.add('show');
    });
}

function hideAll() {
    const headerEl = document.querySelector('.header');
    const cardEls = document.querySelectorAll('.card')
    const subinfoEl = document.querySelector('.subinfo');
    
    
    headerEl.classList.remove('show')
    headerEl.classList.add('hidden');
    
    cardEls.forEach((card, index) => {
        setTimeout(() => {
            card.classList.remove('show');
            card.classList.add('hidden');
        }, index * 100);
    });

    subinfoEl.classList.remove('show')
    subinfoEl.classList.add('hidden');
    
}

getData();


let startX = 0;
let startY = 0;
let currentX = 0;
let isDragging = false;
let isHorizontal = null;
let end = false;
let currentPage = 0;
let prevPage = 0;
let pageWidth;

container.addEventListener('pointerdown', (e) => {
    if (end) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    isHorizontal = null;
    container.style.transition = 'none';
});

window.addEventListener('pointermove', (e) => {
    if (end || !isDragging) return;

    const dx = e.clientX - startX;
    const dy = Math.abs(e.clientY - startY); 

    if (isHorizontal === null) {
        if (Math.abs(dx) > 15 && Math.abs(dx) > dy) {
            isHorizontal = true;
        } else if (dy > 15) {
            isHorizontal = false;
        }
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
    if (end || !isDragging) return;
    isDragging = false;

    const dx = e.clientX - startX;
    const threshold = window.innerWidth * 0.25;

    container.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

    if (isHorizontal) {
        if (dx < -threshold && currentPage === 0) {
            currentPage = 1;
        } else if (dx > threshold && currentPage === 1) {
            currentPage = 0;
        }
    }
    
    container.style.transform = `translateX(${-currentPage * pageWidth}px)`;

    if (currentPage !== prevPage) {
        prevPage = currentPage;

        setTimeout(() => {
        document.querySelector('html').scrollIntoView();
        }, 500);
    }
});


const prCard = document.querySelector('#pr-section');
const piketCard = document.querySelector('#piket-section');

prCard.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'li') return;

    navigator.vibrate(30);
    piketCard.style.opacity = 0;
    prCard.classList.toggle('stretch');
    setTimeout(() => {
        piketCard.style.opacity = 1;
    }, 500);
});