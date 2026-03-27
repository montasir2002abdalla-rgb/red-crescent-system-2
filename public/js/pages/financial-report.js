// js/pages/financial-report.js
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
            <td data-label="التاريخ">${new Date(t.createdAt).toLocaleDateString('ar-EG')}    </td>
            <td data-label="الوصف">${t.description || ''}    </td>
            <td data-label="النوع">${t.type === 'income' ? 'إيراد' : 'مصروف'}    </td>
            <td data-label="المبلغ">${t.amount}    </td>
            <td data-label="المتبرع/المسؤول">${t.donorName || ''}    </td>
            <td data-label="المستفيد">${t.type === 'expense' ? (t.beneficiaryName || '-') : '-'}    </td>
            <td data-label="إجراءات">
                ${user.role === 'manager' ? `
                    <button class="btn btn-secondary btn-sm" onclick="editTransaction(${t.id}, ${t.amount}, '${t.description || ''}', '${t.type}')">تعديل</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTransaction(${t.id})">حذف</button>
                ` : ''}
             </td>
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

function printReport() {
    window.print();
}

function filterFinancial() {
    const search = document.getElementById('searchFinancial').value.toLowerCase();
    const rows = document.querySelectorAll('#financialReportBody tr');
    rows.forEach(row => {
        const desc = row.cells[1]?.innerText.toLowerCase() || '';
        row.style.display = desc.includes(search) ? '' : 'none';
    });
}

async function deleteTransaction(id) {
    if (confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
        try {
            await deleteFinancialTransaction(id);
            loadFinancialReport();
        } catch (error) {
            alert(error.message);
        }
    }
}

function editTransaction(id, amount, description, type) {
    document.getElementById('editTransId').value = id;
    document.getElementById('editAmount').value = amount;
    document.getElementById('editDesc').value = description;
    document.getElementById('editType').value = type;
    document.getElementById('editTransactionModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editTransactionModal').style.display = 'none';
}

async function updateTransaction() {
    const id = document.getElementById('editTransId').value;
    const amount = parseFloat(document.getElementById('editAmount').value);
    const description = document.getElementById('editDesc').value;
    const type = document.getElementById('editType').value;
    try {
        await updateFinancialTransaction(id, { amount, description, type });
        closeEditModal();
        loadFinancialReport();
    } catch (error) {
        alert(error.message);
    }
}

document.getElementById('editTransactionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await updateTransaction();
});

document.getElementById('searchFinancial').addEventListener('input', filterFinancial);

loadFinancialReport();