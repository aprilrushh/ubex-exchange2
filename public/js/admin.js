document.addEventListener('DOMContentLoaded', function() {
    const navLinks = {
        dashboard: document.getElementById('dashboard-link'),
        coins: document.getElementById('coins-link'),
        users: document.getElementById('users-link'),
        deposits: document.getElementById('deposits-link')
    };
    const pages = {
        dashboard: document.getElementById('dashboard-page'),
        coins: document.getElementById('coins-page'),
        users: document.getElementById('users-page'),
        deposits: document.getElementById('deposits-page')
    };
    function showPage(id) {
        Object.values(pages).forEach(p => p && p.classList.remove('active'));
        Object.values(navLinks).forEach(l => l && l.classList.remove('active'));
        if (pages[id]) pages[id].classList.add('active');
        if (navLinks[id]) navLinks[id].classList.add('active');
    }
    Object.keys(navLinks).forEach(key => {
        navLinks[key]?.addEventListener('click', e => { e.preventDefault(); showPage(key); });
    });

    async function loadStats() {
        const res = await fetch('/api/admin/stats', { headers: authHeader() });
        if (res.ok) {
            const s = await res.json();
            document.getElementById('coin-count').textContent = s.coinCount;
            document.getElementById('user-count').textContent = s.userCount;
        }
    }

    async function loadCoinTable() {
        const tbody = document.querySelector('#coin-table tbody');
        tbody.innerHTML = '';
        const res = await fetch('/api/admin/coins', { headers: authHeader() });
        const coins = await res.json();
        coins.forEach(c => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${c.name}</td><td>${c.symbol}</td><td>-</td><td><span class="status-tag status-active">활성</span></td><td></td>`;
            tbody.appendChild(row);
        });
    }

    async function loadUserTable() {
        const tbody = document.querySelector('#user-table tbody');
        tbody.innerHTML = '';
        const res = await fetch('/api/admin/users', { headers: authHeader() });
        const users = await res.json();
        users.forEach(u => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${u.id}</td><td>${u.email}</td><td>${u.created_at}</td><td><span class="status-tag status-active">활성</span></td><td>-</td><td></td>`;
            tbody.appendChild(row);
        });
    }

    async function loadTransactionTable() {
        const tbody = document.querySelector('#transaction-table tbody');
        tbody.innerHTML = '';
        const type = document.getElementById('transaction-type').value;
        const status = document.getElementById('transaction-status').value;
        const res = await fetch(`/api/admin/transactions?type=${type}&status=${status}`, { headers: authHeader() });
        const txs = await res.json();
        txs.forEach(t => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${t.id}</td><td>${t.userEmail}</td><td>${t.type}</td><td>${t.coin}</td><td>${t.amount}</td><td><span class="status-tag status-${t.status}">${t.status}</span></td><td>${t.created_at}</td><td></td>`;
            tbody.appendChild(row);
        });
    }

    document.getElementById('apply-filter').addEventListener('click', loadTransactionTable);

    function authHeader() {
        const token = localStorage.getItem('adminToken');
        return { 'Authorization': 'Bearer ' + token, 'Content-Type':'application/json' };
    }

    loadStats();
    loadCoinTable();
    loadUserTable();
    loadTransactionTable();
});
