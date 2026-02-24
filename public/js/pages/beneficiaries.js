const user = requireAuth(['employee', 'volunteer', 'manager']);
updateUserDisplay();

async function loadBeneficiaries() {
    try {
        const beneficiaries = await getBeneficiaries();
        const tbody = document.getElementById('beneficiariesBody');
        tbody.innerHTML = beneficiaries.map(b => `
            <tr>
                <td>${b.name}</td>
                <td>${b.idNumber}</td>
                <td>${b.phone}</td>
                <td>${b.address || ''}</td>
                <td>${b.familyMembers}</td>
                <td>${b.healthStatus || ''}</td>
                <td>${new Date(b.createdAt).toLocaleDateString('ar-EG')}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editBeneficiary(${b.id})"><i class="fas fa-edit"></i></button>
                    ${(user.role === 'manager') ? `
                        <button class="btn btn-danger btn-sm" onclick="deleteBeneficiary(${b.id})"><i class="fas fa-trash"></i></button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        alert(error.message);
    }
}

function showAddBeneficiaryModal() {
    document.getElementById('addBeneficiaryModal').style.display = 'flex';
    document.getElementById('addBeneficiaryForm').reset();
    document.getElementById('beneficiaryId').value = '';
}

function closeModal() {
    document.getElementById('addBeneficiaryModal').style.display = 'none';
}

async function editBeneficiary(id) {
    try {
        const beneficiaries = await getBeneficiaries();
        const ben = beneficiaries.find(b => b.id === id);
        if (!ben) return;
        document.getElementById('benName').value = ben.name;
        document.getElementById('benIdNumber').value = ben.idNumber;
        document.getElementById('benPhone').value = ben.phone;
        document.getElementById('benAddress').value = ben.address || '';
        document.getElementById('benFamily').value = ben.familyMembers;
        document.getElementById('benHealth').value = ben.healthStatus || '';
        document.getElementById('beneficiaryId').value = ben.id;
        document.getElementById('addBeneficiaryModal').style.display = 'flex';
    } catch (error) {
        alert(error.message);
    }
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
    const id = document.getElementById('beneficiaryId').value;
    const beneficiary = {
        name: document.getElementById('benName').value,
        idNumber: document.getElementById('benIdNumber').value,
        phone: document.getElementById('benPhone').value,
        address: document.getElementById('benAddress').value,
        familyMembers: parseInt(document.getElementById('benFamily').value),
        healthStatus: document.getElementById('benHealth').value
    };
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