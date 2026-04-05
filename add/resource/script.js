const confetti = new JSConfetti();

const sendInput = document.querySelector('#sendInput');
const fill = sendInput.querySelector('.fill');
const sendText = sendInput.querySelector('.text');

const HOLD_DURATION = 3000;

let isScrolling;
let holdTimer;
let holdProgress = 0;
let isDown = false;
let interval;
let timeout;
let held = false;
let isLibur = false;

sendInput.addEventListener('click', () => {
    if (isDown || held) return;
    navigator.vibrate(40);
    liburToggle();
});

function liburToggle(ignore) {
    sendInput.classList.toggle('active');
    sendInput.style.background = sendInput.classList.contains('active') ? '#6B7280' : 'transparent';
    sendText.style.color = sendInput.classList.contains('active') ? 'white' : '#ccc';
    sendText.textContent = sendInput.classList.contains('active') ? 'Mode libur aktif!' : 'Tahan untuk kirim / Klik untuk mode libur';

    if (ignore) return;
    
    if (!isLibur) {
        isLibur = true;
    } else {
        isLibur = false;
    }

    updateLibur();
}

async function updateLibur() {
    try {
        const res = await fetch('https://viic-pengumuman.vercel.app/api/pengumuman',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                libur: isLibur,
                key: 'viic'
            })
        });

        console.log('Libur status updated:', isLibur);
    } catch (error) {
        console.error('Error updating libur status:', error);
    }
}

sendInput.addEventListener('pointerdown', () => {
    if (held || isLibur) return;
    isDown = true
    pointerDown();
});

function pointerDown()  {
    timeout = setTimeout(() => {
        if (isDown) {
            holdProgress = 0;
            sendInput.classList.add('holding');
            sendText.textContent = 'Tahan...';

            interval = setInterval(() => {
                navigator.vibrate(40);
                holdProgress += 1;
                fill.style.height = `${holdProgress}%`;

                if (holdProgress >= 40) {
                    sendText.style.color = 'white';
                }

                if (holdProgress >= 100) {
                    navigator.vibrate([40, 30, 1800]);
                    held = true
                    clearInterval(interval);
                    isDown = false;

                    confetti.addConfetti();
                    sendText.textContent = 'Terkirim!';
                    sendData();

                    setTimeout(() => {
                        resetFill();
                    }, 3000);
                }
            }, HOLD_DURATION / 100);
        }
    }, 500);
}

sendInput.addEventListener('pointerup', () => {
    isDown = false;
    clearTimeout(timeout);
});

sendInput.addEventListener('pointerleave', () => {
    if (!held || isLibur) {
        clearInterval(interval);
        resetFill();
    }
});

function resetFill() {
    held = false;
    holdProgress = 0;
    fill.style.height = "0%";
    sendInput.classList.remove("holding");
    sendText.style.color = '#ccc';
    sendText.textContent = 'Tahan untuk kirim / Klik untuk mode libur';
}

window.addEventListener('scroll', () => {
    sendInput.classList.add('is-scrolling');
    window.clearTimeout(isScrolling);
    
    isScrolling = setTimeout(() => {
        sendInput.classList.remove('is-scrolling');
    }, 200);
});


const addPR = document.querySelector('#add-pr');
const dropMapelPR = document.querySelector('#pr-mapel-drop');
const prItemsTemp = document.querySelector('#pr-items-template')
const prContainer = document.querySelector('.pr-container');

const addUlangan = document.querySelector('#add-ulangan');
const dropMapelUl = document.querySelector('#ulangan-mapel-drop');
const ulanganItemsTemp = document.querySelector('#ulangan-items-template')
const ulanganContainer = document.querySelector('.ulangan-container');

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

function sendData() {
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
};

async function getData() {
    try {
        const res = await fetch('https://viic-pengumuman.vercel.app/api/pengumuman');
        const { mapel, piket, libur } = await res.json();

        console.log('Data fetched:', { mapel, piket, libur });

        isLibur = libur;
        if (isLibur) {
            liburToggle(true);
        }

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