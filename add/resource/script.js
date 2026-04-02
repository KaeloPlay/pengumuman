const addPR = document.querySelector('#add-pr');
const dropMapel = document.querySelector('#pr-mapel-drop');
const prItemsTemp = document.querySelector('#pr-items-template')
const prContainer = document.querySelector('.pr-container');
const sendInput = document.querySelector('#sendInput');

addPR.addEventListener('click', () => {
    addPR.classList.add('disabled');
    dropMapel.classList.remove('disabled');
});

dropMapel.addEventListener('change', () => {
    const clone = prItemsTemp.content.cloneNode(true);
    const mapelEl = clone.querySelector('.pr-items-mapel')
    mapelEl.textContent = dropMapel.value + ':';
    prContainer.appendChild(clone);

    addPR.classList.remove('disabled')
    dropMapel.classList.add('disabled')

    const option = dropMapel.querySelector(`option[value='${dropMapel.value}']`);
    option.disabled = true;
    dropMapel.selectedIndex = 0;
});

prContainer.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('pr-details-input')) {
        if (e.key === 'Backspace' && e.target.value === '') {
            e.preventDefault();

            const li = e.target.closest('li');
            const mapel = li.querySelector('.pr-items-mapel').textContent.replace(':', '');

            const option = dropMapel.querySelector(`option[value='${mapel}']`);
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

    let pr = allPR.join('$ ');
    let tambahan = document.querySelector('#tambahanInput').value;
    
    postData(pr, tambahan);
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

        document.body.classList.add('show');
        document.body.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Ada error nih, tapi gapapa mungkin bisa lanjut:', error);
    }
}

async function postData(pr, tambahan) {
    try {
        const res = await fetch('https://viic-pengumuman.vercel.app/api/pengumuman', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
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