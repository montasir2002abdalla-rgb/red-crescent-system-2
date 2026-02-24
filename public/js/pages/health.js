const user = requireAuth(['employee', 'volunteer', 'manager']);
updateUserDisplay();

let currentBeneficiaryId = null;

async function loadBeneficiariesForSelect() {
    try {
        const beneficiaries = await getBeneficiaries();
        const select = document.getElementById('beneficiarySelect');
        const select2 = document.getElementById('healthBeneficiaryId');
        let options = '<option value="">اختر...</option>';
        beneficiaries.forEach(b => {
            options += `<option value="${b.id}">${b.name} (${b.idNumber})</option>`;
        });
        if (select) select.innerHTML = options;
        if (select2) select2.innerHTML = options;
    } catch (error) {
        alert(error.message);
    }
}

async function loadHealthRecords() {
    const beneficiaryId = document.getElementById('beneficiarySelect')?.value;
    if (!beneficiaryId) return;
    currentBeneficiaryId = beneficiaryId;
    try {
        const records = await getHealthRecords(beneficiaryId);
        const tbody = document.getElementById('healthBody');
        tbody.innerHTML = records.map(r => `
            <tr>
                <td>${r.recordDate}</td>
                <td>${r.diagnosis}</td>
                <td>${r.treatment || ''}</td>
                <td>${r.notes || ''}</td>
                <td>${r.createdByName || ''}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editHealthRecord(${r.id})"><i class="fas fa-edit"></i></button>
                    ${(user.role === 'manager' || user.role === 'employee') ? `
                        <button class="btn btn-danger btn-sm" onclick="deleteHealthRecord(${r.id})"><i class="fas fa-trash"></i></button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        alert(error.message);
    }
}

function showAddHealthModal() {
    if (!currentBeneficiaryId && !document.getElementById('beneficiarySelect')?.value) {
        alert('الرجاء اختيار مستفيد أولاً');
        return;
    }
    if (document.getElementById('healthBeneficiaryId')) {
        document.getElementById('healthBeneficiaryId').value = currentBeneficiaryId || document.getElementById('beneficiarySelect')?.value;
    }
    document.getElementById('addHealthModal').style.display = 'flex';
    document.getElementById('healthRecordId').value = '';
}

function closeModal() {
    document.getElementById('addHealthModal').style.display = 'none';
}

async function editHealthRecord(id) {
    try {
        const records = await getHealthRecords(currentBeneficiaryId);
        const rec = records.find(r => r.id === id);
        if (!rec) return;
        document.getElementById('healthBeneficiaryId').value = rec.beneficiaryId;
        document.getElementById('recordDate').value = rec.recordDate;
        document.getElementById('diagnosis').value = rec.diagnosis;
        document.getElementById('treatment').value = rec.treatment || '';
        document.getElementById('healthNotes').value = rec.notes || '';
        document.getElementById('healthRecordId').value = rec.id;
        document.getElementById('addHealthModal').style.display = 'flex';
    } catch (error) {
        alert(error.message);
    }
}

async function deleteHealthRecord(id) {
    if (confirm('هل أنت متأكد من حذف هذا السجل الصحي؟')) {
        try {
            await deleteHealthRecord(id);
            loadHealthRecords();
        } catch (error) {
            alert(error.message);
        }
    }
}

document.getElementById('addHealthForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('healthRecordId').value;
    const record = {
        beneficiaryId: parseInt(document.getElementById('healthBeneficiaryId').value),
        recordDate: document.getElementById('recordDate').value,
        diagnosis: document.getElementById('diagnosis').value,
        treatment: document.getElementById('treatment').value,
        notes: document.getElementById('healthNotes').value
    };
    try {
        if (id) {
            await updateHealthRecord(id, record);
        } else {
            await createHealthRecord(record);
        }
        closeModal();
        loadHealthRecords();
    } catch (error) {
        alert(error.message);
    }
});

loadBeneficiariesForSelect();