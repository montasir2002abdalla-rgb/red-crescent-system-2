// js/pages/inventory.js
const user = requireAuth(['manager', 'inventory_keeper']);
updateUserDisplay();

let inventory = [];
let financials = [];

async function loadInventory() {
    try {
        inventory = await getInventory();
        const tbody = document.getElementById('inventoryBody');
        tbody.innerHTML = inventory.map(item => `
            <tr>
                <td data-label="الاسم">${item.itemName}     </td>
                <td data-label="التصنيف">${item.category}     </td>
                <td data-label="الكمية">${item.quantity}     </td>
                <td data-label="الوحدة">${item.unit}     </td>
                <td data-label="الحد الأدنى">${item.minStock}     </td>
                <td data-label="آخر تحديث">${new Date(item.lastUpdated).toLocaleString('ar-EG')}     </td>
                <td data-label="إجراءات">
                    <button class="btn btn-secondary btn-sm" onclick="showUpdateModal(${item.id}, ${item.quantity})">تحديث</button>
                    ${user.role === 'manager' ? `
                        <button class="btn btn-danger btn-sm" onclick="handleDeleteItem(${item.id})"><i class="fas fa-trash"></i></button>
                    ` : ''}
                 </td>
             </tr>
        `).join('');
    } catch (error) {
        alert(error.message);
    }
}

async function loadMedicalItems() {
    try {
        const allItems = await getInventory();
        const medicalItems = allItems.filter(item => item.category === 'medical');
        const tbody = document.getElementById('medicalBody');
        tbody.innerHTML = medicalItems.map(item => `
            <tr>
                <td data-label="الاسم">${item.itemName}     </td>
                <td data-label="التصنيف الفرعي">${item.subCategory || 'عام'}     </td>
                <td data-label="الكمية">${item.quantity}     </td>
                <td data-label="الوحدة">${item.unit}     </td>
                <td data-label="تاريخ الانتهاء">${item.expiryDate || 'غير محدد'}     </td>
                <td data-label="الحد الأدنى">${item.minStock}     </td>
                <td data-label="آخر تحديث">${new Date(item.lastUpdated).toLocaleString('ar-EG')}     </td>
                <td data-label="إجراءات">
                    <button class="btn btn-secondary btn-sm" onclick="showUpdateModal(${item.id}, ${item.quantity})">تحديث</button>
                    ${user.role === 'manager' ? `
                        <button class="btn btn-danger btn-sm" onclick="handleDeleteItem(${item.id})"><i class="fas fa-trash"></i></button>
                    ` : ''}
                 </td>
             </tr>
        `).join('');
    } catch (error) {
        alert(error.message);
    }
}

async function loadFinancial() {
    try {
        financials = await getFinancialTransactions();
        const tbody = document.getElementById('financialBody');
        const totalIncome = financials.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : 0), 0);
        const totalExpenses = financials.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0);
        const totalFunds = totalIncome - totalExpenses;
        document.getElementById('totalFunds').innerText = totalFunds;
        tbody.innerHTML = financials.map(t => {
            let party = '';
            if (t.type === 'income') {
                party = t.donorName || '';
            } else {
                party = t.beneficiaryName || '';
            }
            return `
                <tr>
                    <td data-label="المبلغ">${t.amount}     </td>
                    <td data-label="النوع">${t.type === 'income' ? 'وارد' : 'صادر'}     </td>
                    <td data-label="الوصف">${t.description || ''}     </td>
                    <td data-label="المتبرع/المسؤول">${t.type === 'income' ? (t.donorName || '') : (t.createdBy ? 'مدير' : '')}     </td>
                    <td data-label="المستفيد">${t.type === 'expense' ? (t.beneficiaryName || '-') : '-'}     </td>
                    <td data-label="التاريخ">${new Date(t.createdAt).toLocaleString('ar-EG')}     </td>
                 </tr>
            `;
        }).join('');
    } catch (error) {
        alert(error.message);
    }
}

function showTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    if (tab === 'items') {
        document.querySelector('[onclick="showTab(\'items\')"]').classList.add('active');
        document.getElementById('itemsTab').classList.add('active');
        loadInventory();
    } else if (tab === 'medical') {
        document.querySelector('[onclick="showTab(\'medical\')"]').classList.add('active');
        document.getElementById('medicalTab').classList.add('active');
        loadMedicalItems();
    } else if (tab === 'financial') {
        document.querySelector('[onclick="showTab(\'financial\')"]').classList.add('active');
        document.getElementById('financialTab').classList.add('active');
        loadFinancial();
    }
}

function showAddItemModal() {
    document.getElementById('addItemModal').style.display = 'flex';
    document.getElementById('addItemForm').reset();
}

function closeModal() {
    document.getElementById('addItemModal').style.display = 'none';
}

function showUpdateModal(id, currentQty) {
    document.getElementById('updateItemId').value = id;
    document.getElementById('newQuantity').value = currentQty;
    document.getElementById('updateQuantityModal').style.display = 'flex';
}

function closeUpdateModal() {
    document.getElementById('updateQuantityModal').style.display = 'none';
}

async function handleDeleteItem(id) {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
        try {
            await deleteInventoryItem(id);
            loadInventory();
            loadMedicalItems();
        } catch (error) {
            alert(error.message);
        }
    }
}

async function loadBeneficiariesForExpense() {
    try {
        const beneficiaries = await getBeneficiaries();
        const select = document.getElementById('expenseBeneficiaryId');
        if (!select) return;
        select.innerHTML = '<option value="">بدون مستفيد</option>';
        beneficiaries.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = `${b.name} (${b.idNumber})`;
            select.appendChild(opt);
        });
    } catch (error) {
        console.error('خطأ في تحميل المستفيدين:', error);
    }
}

function showExpenseModal() {
    loadBeneficiariesForExpense();
    document.getElementById('expenseModal').style.display = 'flex';
}

function closeExpenseModal() {
    document.getElementById('expenseModal').style.display = 'none';
}

document.getElementById('expenseForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const expense = {
        amount: parseFloat(document.getElementById('expenseAmount').value),
        description: document.getElementById('expenseDesc').value,
        beneficiaryId: document.getElementById('expenseBeneficiaryId').value || null
    };
    try {
        await createExpense(expense);
        closeExpenseModal();
        loadFinancial();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('addItemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const item = {
        itemName: document.getElementById('itemName').value,
        category: document.getElementById('category').value,
        subCategory: document.getElementById('subCategory')?.value || null,
        quantity: parseInt(document.getElementById('quantity').value),
        unit: document.getElementById('unit').value,
        expiryDate: document.getElementById('expiryDate')?.value || null,
        minStock: parseInt(document.getElementById('minStock').value)
    };
    try {
        await addInventoryItem(item);
        closeModal();
        loadInventory();
        loadMedicalItems();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('updateQuantityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('updateItemId').value;
    const quantity = parseInt(document.getElementById('newQuantity').value);
    try {
        await updateInventoryItem(id, quantity);
        closeUpdateModal();
        loadInventory();
        loadMedicalItems();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('category')?.addEventListener('change', function() {
    const isMedical = this.value === 'medical';
    document.getElementById('subCategoryGroup').style.display = isMedical ? 'block' : 'none';
    document.getElementById('expiryDateGroup').style.display = isMedical ? 'block' : 'none';
});

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

loadInventory();