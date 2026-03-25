/*
let data = [];
let tanggal;
let mapel = [];
let pr = [];
let piket = [];
let note;

async function getData() {
    try {
        const res = await fetch('https://api-pengumuman-production.up.railway.app/api/pengumuman');
        data = await res.json();
        console.log('Data fetched:', data);

        tanggal = data.tanggal;
        mapel = data.mapel.split(',').map(item => item.trim());
        pr = data.pr.split(',').map(item => item.trim());
        piket = data.piket.split(',').map(item => item.trim());
        note = data.note;

        console.log('Tanggal:', tanggal);
        console.log('Mapel:', mapel);
        console.log('PR:', pr);
        console.log('Piket:', piket);
        console.log('Note:', note);

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

    pr.forEach(prItem => {
        const li = document.createElement('li');
        li.textContent = prItem;
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
            pr.classList.toggle('done');
        });
    });
};

function showAll() {
    const headerEl = document.querySelector('.header');
    const cardEls = document.querySelectorAll('.card')

    headerEl.classList.remove('hidden')
    headerEl.classList.add('show');

    cardEls.forEach((card, index) => {
        setTimeout(() => {
            card.classList.remove('hidden');
            card.classList.add('show');
        }, index * 100);
    });
};

getData(); */


let data = {};
let tanggal;
let mapel = [];
let pr = [];
let piket = [];
let note = [];
let checkedPR = {};

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        hideAll();
        getData();
    }
});

window.addEventListener('beforeunload', () => {
    hideAll();
});

async function getData() {
    try {
        const res = await fetch('https://viic-pengumuman.vercel.app/api/pengumuman');
        data = await res.json();
        console.log('Data fetched:', data);

        tanggal = data.tanggal_besok;
        mapel = data.mapel.split(',').map(item => item.trim());
        pr = data.pr.split(',').map(item => item.trim());
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