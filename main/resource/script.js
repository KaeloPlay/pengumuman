let data = {};
let tanggal;
let mapel = [];
let pr = [];
let piket = [];
let note = [];
let checkedPR = {};

document.addEventListener('visibilitychange', () => {
    if (end) return;
    
    if (document.visibilityState === 'visible') {
        hideAll();
        getData();
    }
});

async function getData() {
    try {
        const res = await fetch('https://viic-pengumuman.vercel.app/api/pengumuman');
        data = await res.json();
        console.log('Data fetched:', data);

        tanggal = data.tanggal_besok;
        mapel = data.mapel.split(',').map(item => item.trim());
        pr = data.pr.split('$').map(item => item.trim());
        piket = data.piket.split(',').map(item => item.trim());
        note = data.note;

        console.log('Tanggal:', tanggal);
        console.log('Mapel:', mapel);
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
    }
}

function renderData() {
    const tanggalEl = document.querySelector('#date');
    const mapelCard = document.querySelector('.mapel ul');
    const prCard = document.querySelector('.pr ul');
    const piketCard = document.querySelector('.piket ul');
    const noteCard = document.querySelector('.note p');

    mapelCard.innerHTML = '';
    prCard.innerHTML = '';
    piketCard.innerHTML = '';

    tanggalEl.textContent = (`( ${tanggal} )`);

    mapel.forEach(mapelItem => {
        const li = document.createElement('li');
        li.textContent = mapelItem;
        mapelCard.appendChild(li);
    });

    pr.forEach((prItem, index) => {
        const li = document.createElement('li');
        li.textContent = prItem;

        li.dataset.index = index;

        if (checkedPR[index]) {
            li.classList.add('done');
        }

        prCard.appendChild(li);
    });

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
        pr.addEventListener('click', () => {
            navigator.vibrate(40);
            pr.classList.toggle('done');

            const index = pr.dataset.index;
            checkedPR[index] = pr.classList.contains('done');
            localStorage.setItem('checkedPR', JSON.stringify(checkedPR));
            localStorage.setItem('current_uuid', JSON.stringify(data.uuid));
        });
    });
};

function showAll() {
    const headerEl = document.querySelector('.header');
    const cardEls = document.querySelectorAll('.card')
    const subinfoEl = document.querySelector('.subinfo');

    headerEl.classList.remove('hidden')
    headerEl.classList.add('show');

    cardEls.forEach((card, index) => {
        setTimeout(() => {
            card.classList.remove('hidden');
            card.classList.add('show');
        }, index * 100);
    });

    subinfoEl.classList.remove('hidden')
    subinfoEl.classList.add('show');

};

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

};

getData();


const container = document.querySelector('#container');
const side = document.querySelector('.side');
const left = document.querySelector('.left');
const leftP = left.querySelector('p');
const right = document.querySelector('.right');
const rightP = right.querySelector('p');

const memoryBgm = document.querySelector('#memory-bgm')

let startX = 0;
let startY = 0;
let currentX = 0;
let isDragging = false;
let vibrate = false;
let isHorizontal = null;
let openLeft = false;
let holdTimeout = null;
let end = false;

container.addEventListener('pointerdown', (e) => {
    if (end) return;

    isDragging = true;
    vibrate = true
    startX = e.clientX;
    startY = e.clientY;
    isHorizontal = null;
    container.style.transition = 'none';
});

window.addEventListener('pointermove', (e) => {
    if (end || !isDragging) return;

    currentX = (e.clientX - startX) * 0.5;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (isHorizontal === null) {
        isHorizontal = Math.abs(dx) > Math.abs(dy);
    }

    if (!isHorizontal) return;

    if (currentX > 100) {
        currentX = 100;

        if (vibrate) {
            navigator.vibrate(20);
            vibrate = false;
        }

        if (!openLeft && !holdTimeout) {
            holdTimeout = setTimeout(() => {
                if (isDragging) {
                    openLeft = true 
                    navigator.vibrate([30, 20, 30])
                    console.log('lock')
                }
                holdTimeout = null;
            }, 1500);
        }
    }

    if (currentX < -100) {
        if (vibrate) {
            navigator.vibrate(20);
            vibrate = false;
        }
        currentX = -100;
    }
    
    container.style.transform = `translateX(${currentX}px)`;
    left.style.opacity = currentX > 0 ? currentX / 100 : 0;
    right.style.opacity = currentX < 0 ? -currentX / 100 : 0;
});

window.addEventListener('pointerup', () => {
    if (end) return;
    
    if (holdTimeout) {
        clearTimeout(holdTimeout);
        holdTimeout = null;
    }

    if (currentX === 100) {
        if (openLeft) {
            end = true;
            isDragging = false;
            container.style.transition = 'transform 0.75s ease';
            container.style.transform = `translateX(100vw)`;
            
            setTimeout(() => {
                container.style.display = 'none'; 
            }, 750);

            leftP.style.opacity = 0;

            setTimeout(() => {
                // memoryBgm.play();
                left.style.transition = 'box-shadow 4s ease';
                left.style.boxShadow = 'inset 0px 0px 20vw 10px rgba(0, 0, 0, 0.2)';
                left.style.width = '100%';

                side.style.flexDirection = 'column';
                side.style.zIndex = '2';

                const overlay = document.querySelector('.nst-overlay');
                overlay.classList.remove('hidden');
                overlay.classList.add('show');

                setTimeout(() => {
                    const memoriesEl = document.querySelector('.memories');
                    const imgs = memoriesEl.querySelectorAll('img');
                    const vids = memoriesEl.querySelectorAll('video');
                    const medias = [...imgs, ...vids];

                    medias.forEach(media => {
                        media.style.animationName = 'fadeMemory';
                        media.style.animationDuration = '3s';
                        media.style.animationTimingFunction = 'ease';
                        media.style.animationFillMode = 'forwards';
                        
                        if (media.matches('img:nth-child(1)')) {
                            media.style.animationDelay = '0.2s';
                        } else if (media.matches('img:nth-child(2)')) {
                            media.style.animationDelay = '0.5s';
                        }
                    });
                }, 1800);
            }, 2500);
        }
    } else {
        openLeft = false;
    }
    
    if (!isDragging) return;
    isDragging = false;

    container.style.transition = 'transform 0.3s ease';
    container.style.transform = `translateX(0px)`;

    left.style.opacity = 0;
    right.style.opacity = 0;
});