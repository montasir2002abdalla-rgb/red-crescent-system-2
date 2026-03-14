// js/pages/users-management.js
const user = requireAuth('manager');
updateUserDisplay();

let allUsers = [];
let allRequests = [];

// تحميل البيانات مع معالجة الأخطاء
async function loadData() {
    try {
        // محاولة جلب المستخدمين
        allUsers = await getAllUsers();
    } catch (error) {
        console.error('فشل جلب المستخدمين:', error);
        allUsers = [];
        // عرض رسالة للمستخدم في الجدول
        document.getElementById('usersBody').innerHTML = `<tr><td colspan="8" style="color:red;">خطأ في تحميل المستخدمين: ${error.message}</td></tr>`;
    }

    try {
        allRequests = await getAssistanceRequests();
    } catch (error) {
        console.error('فشل جلب الطلبات:', error);
        allRequests = [];
    }

    updateStats();
    renderTable();
}

// تحديث الإحصائيات
function updateStats() {
    document.getElementById('totalUsers').innerText = allUsers.length || 0;
    const pendingUsers = allUsers.filter(u => u.status === 'pending').length;
    document.getElementById('pendingUsers').innerText = pendingUsers;

    const accepted = allRequests.filter(r => r.status === 'completed' || r.status === 'approved').length;
    const rejected = allRequests.filter(r => r.status === 'rejected').length;
    document.getElementById('acceptedRequests').innerText = accepted;
    document.getElementById('rejectedRequests').innerText = rejected;
}

// عرض الجدول مع تطبيق الفلاتر
function renderTable() {
    if (!allUsers.length) {
        document.getElementById('usersBody').innerHTML = '<tr><td colspan="8">لا يوجد مستخدمين لعرضهم</td></tr>';
        return;
    }

    const searchTerm = document.getElementById('searchUser').value.toLowerCase();
    const roleFilter = document.getElementById('filterRole').value;
    const statusFilter = document.getElementById('filterStatus').value;

    const filtered = allUsers.filter(u => {
        const matchesSearch = (u.name && u.name.toLowerCase().includes(searchTerm)) || 
                             (u.employeeId && u.employeeId.toLowerCase().includes(searchTerm));
        const matchesRole = roleFilter ? u.role === roleFilter : true;
        const matchesStatus = statusFilter ? u.status === statusFilter : true;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const tbody = document.getElementById('usersBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">لا توجد نتائج مطابقة</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(u => `
        <tr>
            <td>${u.name || '-'}</td>
            <td>${u.employeeId || '-'}</td>
            <td>${u.email || '-'}</td>
            <td>${u.phone || '-'}</td>
            <td>${getRoleName(u.role)}</td>
            <td><span class="badge ${u.status === 'active' ? 'active' : u.status === 'pending' ? 'pending' : 'rejected'}">${u.status === 'active' ? 'نشط' : u.status === 'pending' ? 'معلق' : 'مرفوض'}</span></td>
            <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '-'}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editUser(${u.id})" title="تعديل"><i class="fas fa-edit"></i></button>
                ${u.status === 'pending' ? `
                    <button class="btn btn-success btn-sm" onclick="approveUser(${u.id})" title="موافقة"><i class="fas fa-check"></i></button>
                    <button class="btn btn-warning btn-sm" onclick="rejectUser(${u.id})" title="رفض"><i class="fas fa-times"></i></button>
                ` : ''}
                ${(u.role === 'employee' || u.role === 'volunteer') ? `
                    <button class="btn btn-danger btn-sm" onclick="showDeleteModal(${u.id})" title="حذف"><i class="fas fa-trash"></i></button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// دوال الفلاتر
document.getElementById('searchUser').addEventListener('input', renderTable);
document.getElementById('filterRole').addEventListener('change', renderTable);
document.getElementById('filterStatus').addEventListener('change', renderTable);

// إظهار نافذة الحذف
function showDeleteModal(userId) {
    document.getElementById('deleteUserId').value = userId;
    document.getElementById('deleteConfirmModal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
}

async function confirmDelete() {
    const userId = document.getElementById('deleteUserId').value;
    try {
        await deleteUser(userId);
        closeDeleteModal();
        await loadData(); // إعادة تحميل البيانات
    } catch (error) {
        alert('فشل الحذف: ' + error.message);
    }
}

// موافقة على مستخدم معلق
async function approveUser(userId) {
    if (confirm('هل أنت متأكد من الموافقة على هذا المستخدم؟')) {
        try {
            await approveUser(userId);
            await loadData();
        } catch (error) {
            alert(error.message);
        }
    }
}

// رفض مستخدم معلق
async function rejectUser(userId) {
    if (confirm('هل أنت متأكد من رفض هذا المستخدم؟')) {
        try {
            await rejectUser(userId);
            await loadData();
        } catch (error) {
            alert(error.message);
        }
    }
}

// تعديل المستخدم
async function editUser(userId) {
    const userToEdit = allUsers.find(u => u.id === userId);
    if (!userToEdit) return;

    document.getElementById('editUserId').value = userToEdit.id;
    document.getElementById('editName').value = userToEdit.name || '';
    document.getElementById('editEmail').value = userToEdit.email || '';
    document.getElementById('editPhone').value = userToEdit.phone || '';
    document.getElementById('editRole').value = userToEdit.role;
    document.getElementById('editStatus').value = userToEdit.status;

    document.getElementById('editUserModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editUserModal').style.display = 'none';
}

// حفظ التعديلات
document.getElementById('editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editUserId').value;
    const updatedData = {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        role: document.getElementById('editRole').value,
        status: document.getElementById('editStatus').value
    };
    try {
        // نفترض وجود دالة updateUser في api.js
        await updateUser(id, updatedData);
        closeEditModal();
        await loadData();
    } catch (error) {
        alert('فشل التحديث: ' + error.message);
    }
});

// بدء التحميل
loadData();