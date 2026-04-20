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
