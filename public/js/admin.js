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
        try {
            const res = await fetch('http://localhost:3035/api/v1/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            if (!res.ok) throw new Error('Failed to load stats');
            const data = await res.json();
            updateStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async function loadCoinTable() {
        try {
            const res = await fetch('http://localhost:3035/api/v1/admin/coins', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            if (!res.ok) throw new Error('Failed to load coins');
            const data = await res.json();
            updateCoinTable(data);
        } catch (error) {
            console.error('Error loading coins:', error);
        }
    }

    async function loadUserTable() {
        try {
            const res = await fetch('http://localhost:3035/api/v1/admin/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            if (!res.ok) throw new Error('Failed to load users');
            const data = await res.json();
            updateUserTable(data);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    async function loadTransactionTable() {
        try {
            const res = await fetch('http://localhost:3035/api/v1/admin/transactions?type=all&status=all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            if (!res.ok) throw new Error('Failed to load transactions');
            const data = await res.json();
            updateTransactionTable(data);
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    }

    document.getElementById('apply-filter').addEventListener('click', loadTransactionTable);

    function authHeader() {
        const token = localStorage.getItem('adminToken');
        return { 'Authorization': 'Bearer ' + token, 'Content-Type':'application/json' };
    }

    function updateStats(data) {
        document.getElementById('coin-count').textContent = data.coinCount || 0;
        document.getElementById('user-count').textContent = data.userCount || 0;
        document.getElementById('transaction-count').textContent = data.transactionCount || 0;
        document.getElementById('total-volume').textContent = data.totalVolume || '0';
    }

    function updateCoinTable(data) {
        const tbody = document.querySelector('#coin-table tbody');
        tbody.innerHTML = '';
        data.forEach(coin => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${coin.name}</td>
                <td>${coin.symbol}</td>
                <td>${coin.price || '-'}</td>
                <td><span class="status-tag status-${coin.status || 'active'}">${coin.status || '활성'}</span></td>
                <td>
                    <button class="action-btn edit" onclick="editCoin('${coin.symbol}')">수정</button>
                    <button class="action-btn delete" onclick="deleteCoin('${coin.symbol}')">삭제</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    function updateUserTable(data) {
        const tbody = document.querySelector('#user-table tbody');
        tbody.innerHTML = '';
        data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.email}</td>
                <td>${new Date(user.created_at).toLocaleString()}</td>
                <td><span class="status-tag status-${user.status || 'active'}">${user.status || '활성'}</span></td>
                <td>${user.balance || '-'}</td>
                <td>
                    <button class="action-btn edit" onclick="editUser(${user.id})">수정</button>
                    <button class="action-btn delete" onclick="deleteUser(${user.id})">삭제</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    function updateTransactionTable(data) {
        const tbody = document.querySelector('#transaction-table tbody');
        tbody.innerHTML = '';
        data.forEach(tx => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tx.id}</td>
                <td>${tx.userEmail}</td>
                <td>${tx.type}</td>
                <td>${tx.coin}</td>
                <td>${tx.amount}</td>
                <td><span class="status-tag status-${tx.status}">${tx.status}</span></td>
                <td>${new Date(tx.created_at).toLocaleString()}</td>
                <td>
                    <button class="action-btn view" onclick="viewTransaction(${tx.id})">상세</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    loadStats();
    loadCoinTable();
    loadUserTable();
    loadTransactionTable();
});
