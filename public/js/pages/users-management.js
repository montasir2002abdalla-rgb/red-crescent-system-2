// js/pages/users-management.js
const user = requireAuth('manager');
updateUserDisplay();

let allUsers = [];
let allRequests = [];

async function loadData() {
    try {
        allUsers = await getAllUsers();
    } catch (error) {
        console.error('فشل جلب المستخدمين:', error);
        allUsers = [];
        document.getElementById('usersBody').innerHTML = `<tr><td colspan="9" style="color:red;">خطأ في تحميل المستخدمين: ${error.message}</td></tr>`;
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

function updateStats() {
    document.getElementById('totalUsers').innerText = allUsers.length || 0;
    const pendingUsers = allUsers.filter(u => u.status === 'pending').length;
    document.getElementById('pendingUsers').innerText = pendingUsers;

    const accepted = allRequests.filter(r => r.status === 'completed').length;
    const rejected = allRequests.filter(r => r.status === 'rejected').length;
    document.getElementById('acceptedRequests').innerText = accepted;
    document.getElementById('rejectedRequests').innerText = rejected;
}

function renderTable() {
    if (!allUsers.length) {
        document.getElementById('usersBody').innerHTML = '<tr><td colspan="9">لا يوجد مستخدمين لعرضهم</td></tr>';
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
        tbody.innerHTML = '<tr><td colspan="9">لا توجد نتائج مطابقة</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(u => `
        <tr>
            <td data-label="الاسم">${u.name || '-'}</td>
            <td data-label="الرقم الوظيفي">${u.employeeId || '-'}</td>
            <td data-label="البريد">${u.email || '-'}</td>
            <td data-label="الهاتف">${u.phone || '-'}</td>
            <td data-label="الدور">${getRoleName(u.role)}</td>
            <td data-label="الجنس">${u.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
            <td data-label="الحالة"><span class="badge ${u.status === 'active' ? 'active' : u.status === 'pending' ? 'pending' : 'rejected'}">${u.status === 'active' ? 'نشط' : u.status === 'pending' ? 'معلق' : 'مرفوض'}</span></td>
            <td data-label="تاريخ التسجيل">${u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '-'}</td>
            <td data-label="إجراءات">
                <button class="btn btn-secondary btn-sm" onclick="editUser(${u.id})" title="تعديل"><i class="fas fa-edit"></i></button>
                <button class="btn btn-info btn-sm" onclick="showUserDetails(${u.id})" title="تفاصيل"><i class="fas fa-info-circle"></i></button>
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

document.getElementById('searchUser').addEventListener('input', renderTable);
document.getElementById('filterRole').addEventListener('change', renderTable);
document.getElementById('filterStatus').addEventListener('change', renderTable);

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
        await loadData();
    } catch (error) {
        alert('فشل الحذف: ' + error.message);
    }
}

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

async function editUser(userId) {
    const userToEdit = allUsers.find(u => u.id === userId);
    if (!userToEdit) return;

    document.getElementById('editUserId').value = userToEdit.id;
    document.getElementById('editName').value = userToEdit.name || '';
    document.getElementById('editEmail').value = userToEdit.email || '';
    document.getElementById('editPhone').value = userToEdit.phone || '';
    document.getElementById('editRole').value = userToEdit.role;
    document.getElementById('editGender').value = userToEdit.gender || 'male';
    document.getElementById('editStatus').value = userToEdit.status;

    document.getElementById('editUserModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editUserModal').style.display = 'none';
}

document.getElementById('editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editUserId').value;
    const updatedData = {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        role: document.getElementById('editRole').value,
        gender: document.getElementById('editGender').value,
        status: document.getElementById('editStatus').value
    };
    try {
        await updateUser(id, updatedData);
        closeEditModal();
        await loadData();
    } catch (error) {
        alert('فشل التحديث: ' + error.message);
    }
});

window.showUserDetails = async (userId) => {
    const userObj = allUsers.find(u => u.id === userId);
    if (!userObj) return;
    let detailsHtml = `
        <p><strong>الاسم:</strong> ${userObj.name}</p>
        <p><strong>الرقم الوظيفي:</strong> ${userObj.employeeId}</p>
        <p><strong>البريد الإلكتروني:</strong> ${userObj.email}</p>
        <p><strong>الهاتف:</strong> ${userObj.phone}</p>
        <p><strong>الدور:</strong> ${getRoleName(userObj.role)}</p>
        <p><strong>الجنس:</strong> ${userObj.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
        <p><strong>الحالة:</strong> ${userObj.status === 'active' ? 'نشط' : userObj.status === 'pending' ? 'معلق' : 'مرفوض'}</p>
        <p><strong>تاريخ التسجيل:</strong> ${new Date(userObj.createdAt).toLocaleDateString('ar-EG')}</p>
    `;
    if (userObj.role === 'employee' || userObj.role === 'volunteer') {
        detailsHtml += `
            <hr>
            <p><strong>المؤهلات والخبرات:</strong> ${userObj.qualifications || 'غير مدخلة'}</p>
            <p><strong>الدافع للانضمام:</strong> ${userObj.motivation || 'غير مدخل'}</p>
        `;
    }
    // إضافة تفاصيل المستفيد إذا كان الدور beneficiary
    if (userObj.role === 'beneficiary') {
        try {
            const allBeneficiaries = await getBeneficiaries();
            const beneficiary = allBeneficiaries.find(b => b.userId === userObj.id);
            if (beneficiary) {
                let familyMembersHtml = '';
                if (beneficiary.familyMembersJSON) {
                    try {
                        const family = JSON.parse(beneficiary.familyMembersJSON);
                        if (family.length) {
                            familyMembersHtml = '<ul>';
                            family.forEach(f => {
                                familyMembersHtml += `<li>${f.name} (الرقم الوطني: ${f.nationalId})</li>`;
                            });
                            familyMembersHtml += '</ul>';
                        } else {
                            familyMembersHtml = 'لا يوجد أفراد أسرة مسجلين';
                        }
                    } catch(e) { familyMembersHtml = 'غير مدخلة'; }
                } else {
                    familyMembersHtml = 'غير مدخلة';
                }
                detailsHtml += `
                    <hr>
                    <p><strong>الرقم الوطني:</strong> ${beneficiary.nationalId || 'غير مدخل'}</p>
                    <p><strong>أفراد الأسرة:</strong> ${familyMembersHtml}</p>
                `;
            }
        } catch (error) {
            console.error('فشل جلب بيانات المستفيد:', error);
            detailsHtml += `<p class="error">تعذر تحميل بيانات المستفيد</p>`;
        }
    }
    document.getElementById('userDetailsContent').innerHTML = detailsHtml;
    document.getElementById('userDetailsModal').style.display = 'flex';
};

function closeUserDetailsModal() {
    document.getElementById('userDetailsModal').style.display = 'none';
}

loadData();