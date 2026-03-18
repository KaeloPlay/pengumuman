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
}

function addWhenClicked() {
    const prItems = document.querySelectorAll('.pr li');

    prItems.forEach(pr => {
        pr.addEventListener('click', () => {
            pr.classList.toggle('done');
        });
    });
}
        
getData();