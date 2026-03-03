// التحقق من تسجيل الدخول والصلاحية
const user = requireAuth(['manager', 'inventory_keeper']);
updateUserDisplay();

let inventory = [];
let financials = [];

// تحميل جميع أصناف المخزون
async function loadInventory() {
    try {
        inventory = await getInventory();
        const tbody = document.getElementById('inventoryBody');
        tbody.innerHTML = inventory.map(item => `
            <tr>
                <td>${item.itemName}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>${item.minStock}</td>
                <td>${new Date(item.lastUpdated).toLocaleString('ar-EG')}</td>
                <td>
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

// تحميل المواد الطبية فقط
async function loadMedicalItems() {
    try {
        const allItems = await getInventory();
        const medicalItems = allItems.filter(item => item.category === 'medical');
        const tbody = document.getElementById('medicalBody');
        tbody.innerHTML = medicalItems.map(item => `
            <tr>
                <td>${item.itemName}</td>
                <td>${item.subCategory || 'عام'}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>${item.expiryDate || 'غير محدد'}</td>
                <td>${item.minStock}</td>
                <td>${new Date(item.lastUpdated).toLocaleString('ar-EG')}</td>
                <td>
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

// تحميل المعاملات المالية
async function loadFinancial() {
    try {
        financials = await getFinancialTransactions();
        const tbody = document.getElementById('financialBody');
        const totalIncome = financials.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : 0), 0);
        const totalExpenses = financials.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0);
        const totalFunds = totalIncome - totalExpenses;
        document.getElementById('totalFunds').innerText = totalFunds;
        tbody.innerHTML = financials.map(t => `
            <tr>
                <td>${t.amount}</td>
                <td>${t.type === 'income' ? 'وارد' : 'صادر'}</td>
                <td>${t.description || ''}</td>
                <td>${t.donorName || ''}</td>
                <td>${new Date(t.createdAt).toLocaleString('ar-EG')}</td>
            </tr>
        `).join('');
    } catch (error) {
        alert(error.message);
    }
}

// التبديل بين التبويبات
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

// إظهار نافذة إضافة صنف
function showAddItemModal() {
    document.getElementById('addItemModal').style.display = 'flex';
    document.getElementById('addItemForm').reset();
}

// إغلاق نافذة إضافة صنف
function closeModal() {
    document.getElementById('addItemModal').style.display = 'none';
}

// إظهار نافذة تحديث الكمية
function showUpdateModal(id, currentQty) {
    document.getElementById('updateItemId').value = id;
    document.getElementById('newQuantity').value = currentQty;
    document.getElementById('updateQuantityModal').style.display = 'flex';
}

// إغلاق نافذة تحديث الكمية
function closeUpdateModal() {
    document.getElementById('updateQuantityModal').style.display = 'none';
}

// دالة حذف الصنف (تم تغيير الاسم لتجنب التكرار)
async function handleDeleteItem(id) {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
        try {
            // استدعاء الدالة العامة من api.js
            await deleteInventoryItem(id);
            // إعادة تحميل الجداول بعد الحذف
            loadInventory();
            loadMedicalItems();
        } catch (error) {
            alert(error.message);
        }
    }
}

// إظهار نافذة تسجيل صرف
function showExpenseModal() {
    document.getElementById('expenseModal').style.display = 'flex';
}

// إغلاق نافذة تسجيل صرف
function closeExpenseModal() {
    document.getElementById('expenseModal').style.display = 'none';
}

// معالج تقديم نموذج الصرف
document.getElementById('expenseForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const expense = {
        amount: parseFloat(document.getElementById('expenseAmount').value),
        description: document.getElementById('expenseDesc').value
    };
    try {
        await createExpense(expense);
        closeExpenseModal();
        loadFinancial();
    } catch (error) {
        alert(error.message);
    }
});

// معالج تقديم نموذج إضافة صنف
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

// معالج تقديم نموذج تحديث الكمية
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

// إظهار/إخفاء الحقول الفرعية عند تغيير التصنيف
document.getElementById('category')?.addEventListener('change', function() {
    const isMedical = this.value === 'medical';
    document.getElementById('subCategoryGroup').style.display = isMedical ? 'block' : 'none';
    document.getElementById('expiryDateGroup').style.display = isMedical ? 'block' : 'none';
});

// إغلاق النوافذ المنبثقة عند النقر خارجها
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// تحميل التبويب الافتراضي (جميع المواد)
loadInventory();