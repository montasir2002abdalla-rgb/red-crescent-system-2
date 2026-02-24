const user = requireAuth(['manager', 'inventory_keeper']);
updateUserDisplay();

let allTransactions = [];

async function loadFinancialReport() {
    try {
        allTransactions = await getFinancialTransactions();
        updateTable(allTransactions);
        calculateTotals(allTransactions);
    } catch (error) {
        alert(error.message);
    }
}

function updateTable(transactions) {
    const tbody = document.getElementById('financialReportBody');
    tbody.innerHTML = transactions.map(t => `
        <tr>
            <td>${new Date(t.createdAt).toLocaleDateString('ar-EG')}</td>
            <td>${t.description || ''}</td>
            <td>${t.type === 'income' ? 'إيراد' : 'مصروف'}</td>
            <td>${t.amount}</td>
            <td>${t.donorName || ''}</td>
        </tr>
    `).join('');
}

function calculateTotals(transactions) {
    let totalIncome = 0, totalExpenses = 0;
    transactions.forEach(t => {
        if (t.type === 'income') totalIncome += t.amount;
        else totalExpenses += t.amount;
    });
    const totalBalance = totalIncome - totalExpenses;
    document.getElementById('totalIncome').innerText = totalIncome;
    document.getElementById('totalExpenses').innerText = totalExpenses;
    document.getElementById('totalBalance').innerText = totalBalance;
}

function filterByType(type) {
    const filtered = allTransactions.filter(t => t.type === type);
    updateTable(filtered);
}

function showAll() {
    updateTable(allTransactions);
}

loadFinancialReport();