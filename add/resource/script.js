const addPR = document.querySelector('#add-pr');
const dropMapelPR = document.querySelector('#pr-mapel-drop');
const prItemsTemp = document.querySelector('#pr-items-template')
const prContainer = document.querySelector('.pr-container');

const addUlangan = document.querySelector('#add-ulangan');
const dropMapelUl = document.querySelector('#ulangan-mapel-drop');
const ulanganItemsTemp = document.querySelector('#ulangan-items-template')
const ulanganContainer = document.querySelector('.ulangan-container');

const sendInput = document.querySelector('#sendInput');
let isScrolling;

window.addEventListener('scroll', () => {
    sendInput.classList.add('is-scrolling');
    window.clearTimeout(isScrolling);

    isScrolling = setTimeout(() => {
        sendInput.classList.remove('is-scrolling');
    }, 200);
});

addPR.addEventListener('click', () => {
    addPR.classList.add('disabled');
    dropMapelPR.classList.remove('disabled');
});

addUlangan.addEventListener('click', () => {
    addUlangan.classList.add('disabled');
    dropMapelUl.classList.remove('disabled');
});

dropMapelPR.addEventListener('change', () => {
    const clone = prItemsTemp.content.cloneNode(true);
    const mapelEl = clone.querySelector('.pr-items-mapel')
    mapelEl.textContent = dropMapelPR.value + ':';
    prContainer.appendChild(clone);

    addPR.classList.remove('disabled')
    dropMapelPR.classList.add('disabled')

    const option = dropMapelPR.querySelector(`option[value='${dropMapelPR.value}']`);
    option.disabled = true;
    dropMapelPR.selectedIndex = 0;
});

dropMapelUl.addEventListener('change', () => {
    const clone = ulanganItemsTemp.content.cloneNode(true);
    const mapelEl = clone.querySelector('.ulangan-items-mapel')
    mapelEl.textContent = dropMapelUl.value + ':';
    ulanganContainer.appendChild(clone);

    addUlangan.classList.remove('disabled')
    dropMapelUl.classList.add('disabled')

    const option = dropMapelUl.querySelector(`option[value='${dropMapelUl.value}']`);
    option.disabled = true;
    dropMapelUl.selectedIndex = 0;
});

prContainer.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('pr-details-input')) {
        if (e.key === 'Backspace' && e.target.value === '') {
            e.preventDefault();

            const li = e.target.closest('li');
            const mapel = li.querySelector('.pr-items-mapel').textContent.replace(':', '');

            const option = dropMapelPR.querySelector(`option[value='${mapel}']`);
            if (option) option.disabled = false;
            
           li.remove();
        };
    };
});

ulanganContainer.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('ulangan-details-input')) {
        if (e.key === 'Backspace' && e.target.value === '') {
            e.preventDefault();

            const li = e.target.closest('li');
            const mapel = li.querySelector('.ulangan-items-mapel').textContent.replace(':', '');

            const option = dropMapelUl.querySelector(`option[value='${mapel}']`);
            if (option) option.disabled = false;
            
           li.remove();
        };
    };
});

sendInput.addEventListener('click', () => {
    const allPR = Array.from(document.querySelectorAll('.pr-items'))
    .map(item => {
        const mapel = item.querySelector('.pr-items-mapel').textContent;
        const value = item.querySelector('.pr-details-input').value;

        return `${mapel} ${value}`;
    });

    const allUlangan = Array.from(document.querySelectorAll('.ulangan-items'))
    .map(item => {
        const mapel = item.querySelector('.ulangan-items-mapel').textContent;
        const value = item.querySelector('.ulangan-details-input').value;

        return `${mapel} ${value}`;
    });

    let ulangan = allUlangan.join('$ ');
    let pr = allPR.join('$ ');
    let tambahan = document.querySelector('#tambahanInput').value;
    if (tambahan === '') tambahan = 'Tidak ada informasi tambahan untuk esok hari.';
    
    postData(ulangan, pr, tambahan);
});

async function getData() {
    try {
        const res = await fetch('https://viic-pengumuman.vercel.app/api/pengumuman');
        const { mapel, piket } = await res.json();

        console.log('Data fetched:', { mapel, piket });

        const mapelInput = document.querySelector('#mapelInput');
        const piketInput = document.querySelector('#piketInput');

        mapelInput.value = mapel;
        piketInput.value = piket;

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Ada error nih, tapi gapapa mungkin bisa lanjut:', error);
    }

    document.body.classList.add('show');
    document.body.classList.remove('hidden');
}

async function postData(ulangan, pr, tambahan) {
    console.log('Posting data:', { ulangan, pr, tambahan });
    try {
        const res = await fetch('https://viic-pengumuman.vercel.app/api/pengumuman', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ulangan: ulangan,
                pr: pr,
                note: tambahan,
                key: 'viic'
            })
        });

        
        alert('Makasii sekle kecayangan kelas🥰');
        // location.reload();
    } catch (err) {
        console.error('Failed to post:', err);
        alert('Gagal aish, koling koling kaelo:', err);
    }
};

getData();