const user = requireAuth();
updateUserDisplay();

let currentBeneficiaryId = null;

async function getBeneficiaryIdFromUser() {
    if (user.role === 'beneficiary') {
        const beneficiaries = await getBeneficiaries();
        const ben = beneficiaries.find(b => b.userId === user.id);
        if (ben) currentBeneficiaryId = ben.id;
    }
}

async function loadRequests() {
    try {
        const requests = await getAssistanceRequests();
        const tbody = document.getElementById('requestsBody');
        if (!tbody) return;

        let filtered = requests;
        if (user.role === 'beneficiary' && currentBeneficiaryId) {
            filtered = requests.filter(r => r.beneficiaryId === currentBeneficiaryId);
        }

        tbody.innerHTML = filtered.map(r => `
            <tr>
                <td>${r.beneficiaryName || 'غير معروف'}</td>
                <td>${r.requestType}</td>
                <td>${r.description.substring(0, 50)}...</td>
                <td><span class="status ${r.status}">${r.status}</span></td>
                <td>${new Date(r.createdAt).toLocaleDateString('ar-EG')}</td>
                <td>
                    ${(user.role === 'manager' || user.role === 'employee') ? `
                        <select onchange="updateRequestStatus(${r.id}, this.value)" class="status-select">
                            <option value="pending" ${r.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                            <option value="in_progress" ${r.status === 'in_progress' ? 'selected' : ''}>قيد التنفيذ</option>
                            <option value="completed" ${r.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                            <option value="rejected" ${r.status === 'rejected' ? 'selected' : ''}>مرفوض</option>
                        </select>
                    ` : ''}
                    ${(user.role === 'manager') ? `
                        <button class="btn btn-danger btn-sm" onclick="deleteRequest(${r.id})"><i class="fas fa-trash"></i></button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        alert(error.message);
    }
}

async function updateRequestStatus(id, status) {
    try {
        await updateAssistanceRequestStatus(id, status);
        loadRequests();
    } catch (error) {
        alert(error.message);
    }
}

async function deleteRequest(id) {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
        try {
            await deleteAssistanceRequest(id);
            loadRequests();
        } catch (error) {
            alert(error.message);
        }
    }
}

async function loadBeneficiariesForSelect() {
    try {
        const beneficiaries = await getBeneficiaries();
        const select = document.getElementById('requestBeneficiaryId');
        if (!select) return;
        select.innerHTML = '<option value="">اختر...</option>';
        beneficiaries.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = `${b.name} (${b.idNumber})`;
            select.appendChild(opt);
        });
    } catch (error) {
        alert(error.message);
    }
}

function showAddRequestModal() {
    if (user.role === 'beneficiary') {
        document.getElementById('beneficiarySelectGroup').style.display = 'none';
    } else {
        document.getElementById('beneficiarySelectGroup').style.display = 'block';
        loadBeneficiariesForSelect();
    }
    document.getElementById('addRequestModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('addRequestModal').style.display = 'none';
}

document.getElementById('addRequestForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    let beneficiaryId;
    if (user.role === 'beneficiary') {
        if (!currentBeneficiaryId) {
            alert('لم يتم العثور على معرف المستفيد. يرجى التواصل مع الإدارة.');
            return;
        }
        beneficiaryId = currentBeneficiaryId;
    } else {
        beneficiaryId = document.getElementById('requestBeneficiaryId').value;
        if (!beneficiaryId) {
            alert('الرجاء اختيار مستفيد');
            return;
        }
    }
    const request = {
        beneficiaryId: parseInt(beneficiaryId),
        requestType: document.getElementById('requestType').value,
        description: document.getElementById('requestDescription').value
    };
    try {
        await createAssistanceRequest(request);
        closeModal();
        loadRequests();
    } catch (error) {
        alert(error.message);
    }
});

getBeneficiaryIdFromUser().then(() => loadRequests());