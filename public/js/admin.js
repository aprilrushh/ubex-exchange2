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

    loadStats();
    loadCoinTable();
    loadUserTable();
    loadTransactionTable();
});
