const user = requireAuth(['employee', 'volunteer', 'manager']);
updateUserDisplay();

let allBeneficiaries = [];

async function loadBeneficiaries() {
    try {
        allBeneficiaries = await getBeneficiaries();
        const tbody = document.getElementById('beneficiariesBody');
        tbody.innerHTML = allBeneficiaries.map(b => {
            let familyMembers = '';
            try {
                const fam = JSON.parse(b.familyMembersJSON);
                familyMembers = fam.map(f => `${f.name} (${f.nationalId}) - ${f.healthStatus || 'غير محدد'}`).join(', ');
            } catch(e) { familyMembers = ''; }
            return `
                <tr>
                    <td data-label="الاسم">${b.name}</td>
                    <td data-label="الرقم الوطني">${b.nationalId || ''}</td>
                    <td data-label="أفراد الأسرة">${familyMembers}</td>
                    <td data-label="رقم الهوية">${b.idNumber}</td>
                    <td data-label="الهاتف">${b.phone}</td>
                    <td data-label="العنوان">${b.address || ''}</td>
                    <td data-label="عدد أفراد الأسرة">${b.familyMembers}</td>
                    <td data-label="الحالة الصحية">${b.healthStatus || ''}</td>
                    <td data-label="الجنس">${b.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
                    <td data-label="تاريخ التسجيل">${new Date(b.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td data-label="إجراءات">
                        <button class="btn btn-secondary btn-sm" onclick="editBeneficiary(${b.id})"><i class="fas fa-edit"></i></button>
                        ${(user.role === 'manager') ? `<button class="btn btn-danger btn-sm" onclick="deleteBeneficiary(${b.id})"><i class="fas fa-trash"></i></button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        alert(error.message);
    }
}

function addFamilyMemberRow() {
    const container = document.getElementById('familyMembersContainer');
    const newRow = document.createElement('div');
    newRow.className = 'family-member-row';
    newRow.innerHTML = `
        <input type="text" placeholder="الاسم" class="family-name" style="width: 30%; margin-left: 5px;">
        <input type="text" placeholder="الرقم الوطني" class="family-nationalId" style="width: 30%; margin-left: 5px;">
        <input type="text" placeholder="الحالة الصحية" class="family-health" style="width: 30%;">
        <button type="button" class="btn btn-sm btn-danger remove-family" style="width: 10%;">حذف</button>
    `;
    container.appendChild(newRow);
    newRow.querySelector('.remove-family').addEventListener('click', function() {
        newRow.remove();
    });
}

function showAddBeneficiaryModal() {
    document.getElementById('addBeneficiaryModal').style.display = 'flex';
    document.getElementById('addBeneficiaryForm').reset();
    document.getElementById('beneficiaryId').value = '';
    document.getElementById('familyMembersContainer').innerHTML = '';
    addFamilyMemberRow();
}

function closeModal() {
    document.getElementById('addBeneficiaryModal').style.display = 'none';
}

async function editBeneficiary(id) {
    const ben = allBeneficiaries.find(b => b.id === id);
    if (!ben) return;
    document.getElementById('benName').value = ben.name;
    document.getElementById('benIdNumber').value = ben.idNumber;
    document.getElementById('benPhone').value = ben.phone;
    document.getElementById('benAddress').value = ben.address || '';
    document.getElementById('benFamily').value = ben.familyMembers;
    document.getElementById('benHealth').value = ben.healthStatus || '';
    document.getElementById('benGender').value = ben.gender || 'male';
    document.getElementById('benNationalId').value = ben.nationalId || '';
    
    const container = document.getElementById('familyMembersContainer');
    container.innerHTML = '';
    if (ben.familyMembersJSON) {
        try {
            const family = JSON.parse(ben.familyMembersJSON);
            family.forEach(f => {
                const row = document.createElement('div');
                row.className = 'family-member-row';
                row.innerHTML = `
                    <input type="text" placeholder="الاسم" class="family-name" value="${f.name}" style="width: 30%; margin-left: 5px;">
                    <input type="text" placeholder="الرقم الوطني" class="family-nationalId" value="${f.nationalId}" style="width: 30%; margin-left: 5px;">
                    <input type="text" placeholder="الحالة الصحية" class="family-health" value="${f.healthStatus || ''}" style="width: 30%;">
                    <button type="button" class="btn btn-sm btn-danger remove-family" style="width: 10%;">حذف</button>
                `;
                container.appendChild(row);
                row.querySelector('.remove-family').addEventListener('click', () => row.remove());
            });
        } catch(e) {}
    } else {
        addFamilyMemberRow();
    }
    document.getElementById('beneficiaryId').value = ben.id;
    document.getElementById('addBeneficiaryModal').style.display = 'flex';
}

async function deleteBeneficiary(id) {
    if (confirm('هل أنت متأكد من حذف هذا المستفيد؟')) {
        try {
            await deleteBeneficiary(id);
            loadBeneficiaries();
        } catch (error) {
            alert(error.message);
        }
    }
}

document.getElementById('addBeneficiaryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const familyMembers = [];
    document.querySelectorAll('.family-member-row').forEach(row => {
        const name = row.querySelector('.family-name')?.value;
        const nationalId = row.querySelector('.family-nationalId')?.value;
        const healthStatus = row.querySelector('.family-health')?.value;
        if (name && nationalId) familyMembers.push({ name, nationalId, healthStatus: healthStatus || '' });
    });
    const beneficiary = {
        name: document.getElementById('benName').value,
        idNumber: document.getElementById('benIdNumber').value,
        phone: document.getElementById('benPhone').value,
        address: document.getElementById('benAddress').value,
        familyMembers: parseInt(document.getElementById('benFamily').value),
        healthStatus: document.getElementById('benHealth').value,
        gender: document.getElementById('benGender').value,
        nationalId: document.getElementById('benNationalId').value,
        familyMembersJSON: JSON.stringify(familyMembers)
    };
    const id = document.getElementById('beneficiaryId').value;
    try {
        if (id) {
            await updateBeneficiary(id, beneficiary);
        } else {
            await createBeneficiary(beneficiary);
        }
        closeModal();
        loadBeneficiaries();
    } catch (error) {
        alert(error.message);
    }
});

loadBeneficiaries();