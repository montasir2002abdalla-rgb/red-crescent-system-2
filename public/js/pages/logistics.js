const user = requireAuth(['manager', 'employee', 'inventory_keeper']);
updateUserDisplay();

async function loadLogistics() {
    try {
        const logistics = await getLogistics();
        const tbody = document.getElementById('logisticsBody');
        tbody.innerHTML = logistics.map(l => `
            <tr>
                <td>${l.requestId || '-'}</td>
                <td>${l.fromLocation}</td>
                <td>${l.toLocation}</td>
                <td>${l.assignedName || 'غير معين'}</td>
                <td><span class="status ${l.status}">${l.status}</span></td>
                <td>${new Date(l.createdAt).toLocaleDateString('ar-EG')}</td>
                <td>
                    <select onchange="updateLogisticsStatus(${l.id}, this.value)" class="status-select">
                        <option value="pending" ${l.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                        <option value="in_progress" ${l.status === 'in_progress' ? 'selected' : ''}>قيد التنفيذ</option>
                        <option value="completed" ${l.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        alert(error.message);
    }
}

async function updateLogisticsStatus(id, status) {
    try {
        await updateLogistics(id, { status });
        loadLogistics();
    } catch (error) {
        alert(error.message);
    }
}

async function loadActiveUsersForSelect() {
    try {
        const users = await getActiveUsers();
        const select = document.getElementById('assignedTo');
        select.innerHTML = '<option value="">اختر المسؤول...</option>';
        users.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = `${u.name} (${u.employeeId}) - ${getRoleName(u.role)}`;
            select.appendChild(opt);
        });
    } catch (error) {
        alert('فشل تحميل قائمة المستخدمين: ' + error.message);
    }
}

function showAddLogisticsModal() {
    document.getElementById('addLogisticsModal').style.display = 'flex';
    loadActiveUsersForSelect();
}

function closeModal() {
    document.getElementById('addLogisticsModal').style.display = 'none';
}

document.getElementById('addLogisticsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const assignedTo = document.getElementById('assignedTo').value;
    if (!assignedTo) {
        alert('الرجاء اختيار المسؤول');
        return;
    }
    const logistics = {
        requestId: document.getElementById('requestId').value || null,
        fromLocation: document.getElementById('fromLocation').value,
        toLocation: document.getElementById('toLocation').value,
        assignedTo: parseInt(assignedTo)
    };
    try {
        await createLogistics(logistics);
        closeModal();
        loadLogistics();
    } catch (error) {
        alert(error.message);
    }
});

loadLogistics();