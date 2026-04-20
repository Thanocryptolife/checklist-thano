:root {
    --dark: #07090e;
    --card: #111622;
    --cyan: #00f2ff;
    --win: #00ffa3;
    --loss: #ff3e3e;
    --text: #e2e8f0;
    --border: #1f2937;
}

body { background: var(--dark); color: var(--text); font-family: 'Inter', sans-serif; margin: 0; padding: 20px; }
.container { max-width: 1400px; margin: auto; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 20px; }
.cyan { color: var(--cyan); }
.flex-row { display: flex; gap: 15px; }

.pro-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.brand h1 { font-family: 'Orbitron', sans-serif; margin: 0; font-size: 1.8rem; }
.balance-box { display: flex; align-items: center; gap: 10px; margin-top: 5px; }
.balance-box input { width: 100px; background: #000; border: 1px solid var(--border); color: white; padding: 5px; }

.stats-bar { display: flex; gap: 20px; }
.stat { background: var(--card); padding: 10px 20px; border-radius: 8px; border: 1px solid var(--border); font-weight: bold; }
.stat span { display: block; color: var(--cyan); font-size: 1.2rem; }

.dashboard { display: grid; grid-template-columns: 400px 1fr; gap: 20px; }
.input-group { flex: 1; margin-bottom: 15px; }
label { display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px; }
select, input, textarea { width: 100%; background: #080a0f; border: 1px solid var(--border); color: white; padding: 10px; border-radius: 6px; box-sizing: border-box; }
textarea { height: 80px; resize: none; }

.check-grid { display: grid; grid-template-columns: 1fr; gap: 5px; }
.check-grid label { display: flex; align-items: center; gap: 10px; color: #cbd5e1; font-size: 0.85rem; cursor: pointer; }
.check-grid input { width: auto; }

.score-container { text-align: center; margin-top: 20px; }
#score-val { font-size: 2.5rem; font-weight: 800; color: var(--cyan); font-family: 'Orbitron'; }
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
