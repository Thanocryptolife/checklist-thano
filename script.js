let trades = JSON.parse(localStorage.getItem('thano_pro_trades')) || [];
let capital = parseFloat(localStorage.getItem('thano_cap')) || 0;
let editId = null; 

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('capital-input').value = capital;
    updateStats();
    renderHistory();
});

function initBalance() {
    capital = parseFloat(document.getElementById('capital-input').value) || 0;
    localStorage.setItem('thano_cap', capital);
    updateStats();
}

function calcScore() {
    let score = 0;
    document.querySelectorAll('.conf-cb:checked').forEach(c => score += parseInt(c.value));
    document.getElementById('score-val').textContent = score + "%";
    document.getElementById('bar-fill').style.width = score + "%";
    return score;
}
document.querySelectorAll('.conf-cb').forEach(c => c.addEventListener('change', calcScore));

document.getElementById('img-url').addEventListener('input', (e) => {
    const img = document.getElementById('view-img');
    const txt = document.getElementById('no-img-text');
    if(e.target.value) {
        img.src = e.target.value;
        img.style.display = 'block';
        txt.style.display = 'none';
    } else {
        img.style.display = 'none';
        txt.style.display = 'block';
    }
});

document.getElementById('save-btn').onclick = () => {
    const tradeData = {
        id: editId || Date.now(),
        date: new Date().toLocaleDateString(),
        asset: document.getElementById('asset-select').value,
        dir: document.getElementById('trade-dir').value,
        risk: document.getElementById('risk-pct').value,
        score: calcScore(),
        status: document.getElementById('trade-status').value,
        pl: parseFloat(document.getElementById('trade-pl').value) || 0,
        notes: document.getElementById('trade-notes').value,
        img: document.getElementById('img-url').value,
        checks: Array.from(document.querySelectorAll('.conf-cb:checked')).map(c => c.dataset.txt)
    };

    if(editId) {
        const index = trades.findIndex(t => t.id === editId);
        trades[index] = tradeData;
        editId = null;
    } else {
        trades.unshift(tradeData);
    }

    localStorage.setItem('thano_pro_trades', JSON.stringify(trades));
    resetForm();
    updateStats();
    renderHistory();
};

function modifyTrade(id) {
    const t = trades.find(tr => tr.id === id);
    editId = id;
    document.getElementById('asset-select').value = t.asset;
    document.getElementById('trade-dir').value = t.dir;
    document.getElementById('risk-pct').value = t.risk;
    document.getElementById('trade-status').value = t.status;
    document.getElementById('trade-pl').value = t.pl || '';
    document.getElementById('trade-notes').value = t.notes;
    document.getElementById('img-url').value = t.img;
    document.getElementById('img-url').dispatchEvent(new Event('input'));
    document.querySelectorAll('.conf-cb').forEach(cb => {
        cb.checked = t.checks.includes(cb.dataset.txt);
    });
    calcScore();
    document.getElementById('edit-indicator').style.display = 'block';
    document.getElementById('save-btn').textContent = "METTRE À JOUR";
    document.getElementById('cancel-btn').style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStats() {
    let totalPL = trades.reduce((sum, t) => sum + t.pl, 0);
    let closed = trades.filter(t => t.status !== 'EN_COURS');
    let wins = closed.filter(t => t.status === 'WIN').length;
    document.getElementById('display-pl').textContent = totalPL.toFixed(2) + "$";
    document.getElementById('display-balance').textContent = (capital + totalPL).toFixed(2) + "$";
    document.getElementById('display-wr').textContent = closed.length ? ((wins/closed.length)*100).toFixed(1) + "%" : "0%";
}

function renderHistory() {
    const body = document.getElementById('history-body');
    body.innerHTML = '';
    trades.forEach(t => {
        body.innerHTML += `
            <tr>
                <td>${t.date}</td>
                <td><strong>${t.asset}</strong></td>
                <td style="color:${t.dir === 'ACHAT' ? '#00ffa3' : '#ff3e3e'}">${t.dir}</td>
                <td>${t.score}%</td>
                <td><span class="status-tag ${t.status}">${t.status}</span></td>
                <td style="font-weight:bold; color:${t.pl >= 0 ? '#00ffa3' : '#ff3e3e'}">${t.pl}$</td>
                <td>
                    <button onclick="modifyTrade(${t.id})" class="btn-init">MODIFIER</button>
                    <button onclick="deleteTrade(${t.id})" style="color:red; background:none; border:none; cursor:pointer; margin-left:10px;">X</button>
                </td>
            </tr>
        `;
    });
}

function resetForm() {
    editId = null;
    document.getElementById('trade-pl').value = '';
    document.getElementById('trade-notes').value = '';
    document.getElementById('img-url').value = '';
    document.getElementById('risk-pct').value = '';
    document.querySelectorAll('.conf-cb').forEach(c => c.checked = false);
    document.getElementById('img-url').dispatchEvent(new Event('input'));
    document.getElementById('edit-indicator').style.display = 'none';
    document.getElementById('save-btn').textContent = "ENREGISTRER LA POSITION";
    document.getElementById('cancel-btn').style.display = 'none';
    calcScore();
}

function deleteTrade(id) {
    if(confirm("Supprimer ce trade ?")) {
        trades = trades.filter(t => t.id !== id);
        localStorage.setItem('thano_pro_trades', JSON.stringify(trades));
        updateStats();
        renderHistory();
    }
}
document.getElementById('cancel-btn').onclick = resetForm;.stats-grid-pro {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    margin-top: 10px;
}

.monthly-card {
    background: #080a0f;
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #1f2937;
    text-align: center;
}

.monthly-card h3 {
    margin: 0 0 10px 0;
    color: var(--cyan);
    font-size: 1rem;
}

.monthly-card p {
    margin: 5px 0;
    font-size: 0.9rem;
}

.header-flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.btn-small {
    background: #1f2937;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 5px;
    font-size: 0.75rem;
    cursor: pointer;
}#score-val { font-size: 2.5rem; font-weight: 800; color: var(--cyan); font-family: 'Orbitron'; }
.bar-bg { background: #1a2236; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 5px; }
#bar-fill { height: 100%; width: 0%; background: var(--cyan); transition: 0.4s; }

.image-display { height: 350px; background: #000; border-radius: 8px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--border); }
#view-img { width: 100%; height: 100%; object-fit: contain; }

.btn-primary { background: var(--cyan); color: #000; border: none; padding: 15px; border-radius: 8px; font-weight: bold; width: 100%; cursor: pointer; }
.btn-secondary { background: #334155; color: white; border: none; padding: 15px; border-radius: 8px; cursor: pointer; }

table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px; color: #64748b; font-size: 0.8rem; border-bottom: 2px solid var(--border); }
td { padding: 12px; border-bottom: 1px solid var(--border); }
.status-tag { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
.EN_COURS { background: #334155; }
.WIN { background: rgba(0, 255, 163, 0.2); color: var(--win); }
.LOSS { background: rgba(255, 62, 62, 0.2); color: var(--loss); }
.edit-mode-tag { background: #1e3a8a; color: #60a5fa; padding: 8px; border-radius: 6px; text-align: center; margin-bottom: 15px; font-size: 0.8rem; font-weight: bold; }// Ajoute ou remplace ces fonctions dans ton fichier script.js

function updateStats() {
    let totalPL = trades.reduce((sum, t) => sum + t.pl, 0);
    let closed = trades.filter(t => t.status !== 'EN_COURS');
    let wins = closed.filter(t => t.status === 'WIN').length;

    // Mise à jour de la barre du haut
    document.getElementById('display-pl').textContent = totalPL.toFixed(2) + "$";
    document.getElementById('display-balance').textContent = (capital + totalPL).toFixed(2) + "$";
    document.getElementById('display-wr').textContent = closed.length ? ((wins / closed.length) * 100).toFixed(1) + "%" : "0%";

    renderMonthlyAnalytics();
}

function renderMonthlyAnalytics() {
    const container = document.getElementById('monthly-stats-container');
    container.innerHTML = '';

    // Groupement des trades par mois
    const monthlyData = {};

    trades.forEach(t => {
        if (t.status === 'EN_COURS') return; // On ne compte pas ce qui n'est pas fini
        
        // On extrait le mois et l'année de la date (ex: "04/2024")
        const dateParts = t.date.split('/');
        const monthYear = dateParts[1] + "/" + dateParts[2];

        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { pl: 0, count: 0, wins: 0 };
        }

        monthlyData[monthYear].pl += t.pl;
        monthlyData[monthYear].count += 1;
        if (t.status === 'WIN') monthlyData[monthYear].wins += 1;
    });

    // Création des cartes de data pour chaque mois
    for (const [month, data] of Object.entries(monthlyData)) {
        const wr = ((data.wins / data.count) * 100).toFixed(1);
        const card = document.createElement('div');
        card.className = 'monthly-card';
        card.innerHTML = `
            <h3>${month}</h3>
            <p>P/L : <span style="color:${data.pl >= 0 ? '#00ffa3' : '#ff3e3e'}">${data.pl.toFixed(2)}$</span></p>
            <p>Trades : <strong>${data.count}</strong></p>
            <p>Win Rate : <strong>${wr}%</strong></p>
        `;
        container.appendChild(card);
    }
}});

document.getElementById('save-btn').onclick = () => {
    const tradeData = {
        id: editId || Date.now(),
        date: new Date().toLocaleDateString('fr-FR'),
        asset: document.getElementById('asset-select').value,
        dir: document.getElementById('trade-dir').value,
        risk: document.getElementById('risk-pct').value,
        score: calcScore(),
        status: document.getElementById('trade-status').value,
        pl: parseFloat(document.getElementById('trade-pl').value) || 0,
        notes: document.getElementById('trade-notes').value,
        img: document.getElementById('img-url').value,
        checks: Array.from(document.querySelectorAll('.conf-cb:checked')).map(c => c.dataset.txt)
    };

    if(editId) {
        const index = trades.findIndex(t => t.id === editId);
        trades[index] = tradeData;
        editId = null;
    } else {
        trades.unshift(tradeData);
    }

    localStorage.setItem('thano_pro_trades', JSON.stringify(trades));
    resetForm();
    updateStats();
    renderHistory();
};

function renderHistory() {
    const body = document.getElementById('history-body');
    body.innerHTML = '';
    trades.forEach(t => {
        body.innerHTML += `
            <tr>
                <td>${t.date}</td>
                <td><strong>${t.asset}</strong></td>
                <td style="color:${t.dir === 'ACHAT' ? '#00ffa3' : '#ff3e3e'}">${t.dir}</td>
                <td>${t.score}%</td>
                <td><span class="status-tag ${t.status}">${t.status}</span></td>
                <td style="font-weight:bold; color:${t.pl >= 0 ? '#00ffa3' : '#ff3e3e'}">${t.pl}$</td>
                <td>
                    <button onclick="modifyTrade(${t.id})" class="btn-init">MODIF</button>
                    <button onclick="deleteTrade(${t.id})" style="color:red; background:none; border:none; cursor:pointer;">X</button>
                </td>
            </tr>`;
    });
}

function modifyTrade(id) {
    const t = trades.find(tr => tr.id === id);
    editId = id;
    document.getElementById('asset-select').value = t.asset;
    document.getElementById('trade-dir').value = t.dir;
    document.getElementById('trade-status').value = t.status;
    document.getElementById('trade-pl').value = t.pl;
    document.getElementById('trade-notes').value = t.notes;
    document.getElementById('img-url').value = t.img;
    document.getElementById('img-url').dispatchEvent(new Event('input'));
    document.querySelectorAll('.conf-cb').forEach(cb => {
        cb.checked = t.checks.includes(cb.dataset.txt);
    });
    calcScore();
    document.getElementById('edit-indicator').style.display = 'block';
    document.getElementById('save-btn').textContent = "METTRE À JOUR";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStats() {
    let totalPL = trades.reduce((sum, t) => sum + t.pl, 0);
    let closed = trades.filter(t => t.status !== 'EN_COURS');
    let wins = closed.filter(t => t.status === 'WIN').length;
    document.getElementById('display-pl').textContent = totalPL.toFixed(2) + "$";
    document.getElementById('display-balance').textContent = (capital + totalPL).toFixed(2) + "$";
    document.getElementById('display-wr').textContent = closed.length ? ((wins/closed.length)*100).toFixed(1) + "%" : "0%";
    renderMonthlyAnalytics();
}

function renderMonthlyAnalytics() {
    const container = document.getElementById('monthly-stats-container');
    container.innerHTML = '';
    const monthlyData = {};
    trades.forEach(t => {
        if (t.status === 'EN_COURS') return;
        const dateParts = t.date.split('/');
        const monthYear = dateParts[1] + "/" + dateParts[2];
        if (!monthlyData[monthYear]) monthlyData[monthYear] = { pl: 0, count: 0 };
        monthlyData[monthYear].pl += t.pl;
        monthlyData[monthYear].count += 1;
    });
    for (const [month, data] of Object.entries(monthlyData)) {
        container.innerHTML += `
            <div class="monthly-card">
                <h3>${month}</h3>
                <p style="color:${data.pl >= 0 ? '#00ffa3' : '#ff3e3e'}">${data.pl.toFixed(2)}$</p>
                <p>${data.count} Trades</p>
            </div>`;
    }
}

function resetForm() {
    editId = null;
    document.getElementById('trade-pl').value = '';
    document.getElementById('trade-notes').value = '';
    document.getElementById('img-url').value = '';
    document.querySelectorAll('.conf-cb').forEach(c => c.checked = false);
    document.getElementById('img-url').dispatchEvent(new Event('input'));
    document.getElementById('edit-indicator').style.display = 'none';
    document.getElementById('save-btn').textContent = "ENREGISTRER LA POSITION";
    calcScore();
}

function deleteTrade(id) {
    if(confirm("Supprimer ce trade ?")) {
        trades = trades.filter(t => t.id !== id);
        localStorage.setItem('thano_pro_trades', JSON.stringify(trades));
        updateStats(); renderHistory();
    }
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trades));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "data_thano.json");
    dlAnchor.click();
}
