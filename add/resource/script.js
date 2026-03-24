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

    let pr = allPR.join(', ');
    if (pr === '') pr = 'Tidak ada PR untuk esok hari.';

    let tambahan = document.querySelector('#tambahanInput').value;
    if (tambahan === '') tambahan = 'Tidak ada informasi tambahan untuk esok hari.';
    
    postData(pr, tambahan);
});

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
