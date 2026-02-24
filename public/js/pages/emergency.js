const user = requireAuth('manager');
updateUserDisplay();

async function loadTeams() {
    try {
        const teams = await getEmergencyTeams();
        const tbody = document.getElementById('teamsBody');
        tbody.innerHTML = teams.map(t => {
            const members = t.members ? JSON.parse(t.members) : [];
            return `<tr>
                <td>${t.teamName}</td>
                <td>${t.leaderName || ''}</td>
                <td>${members.join(', ')}</td>
                <td><span class="status ${t.status}">${t.status}</span></td>
                <td>${new Date(t.createdAt).toLocaleDateString('ar-EG')}</td>
                <td>
                    <button class="btn btn-secondary" onclick="changeTeamStatus(${t.id}, '${t.status === 'active' ? 'inactive' : 'active'}')">
                        ${t.status === 'active' ? 'تعطيل' : 'تفعيل'}
                    </button>
                </td>
            </tr>`;
        }).join('');
    } catch (error) {
        alert(error.message);
    }
}

async function changeTeamStatus(id, newStatus) {
    try {
        await updateEmergencyTeam(id, { status: newStatus });
        loadTeams();
    } catch (error) {
        alert(error.message);
    }
}

async function loadUsersForSelect() {
    try {
        const users = await getActiveUsers();
        const select = document.getElementById('leaderId');
        select.innerHTML = '<option value="">اختر...</option>';
        users.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = `${u.name} (${u.employeeId})`;
            select.appendChild(opt);
        });
    } catch (error) {
        alert(error.message);
    }
}

function showAddTeamModal() {
    document.getElementById('addTeamModal').style.display = 'flex';
    loadUsersForSelect();
}

function closeModal() {
    document.getElementById('addTeamModal').style.display = 'none';
}

document.getElementById('addTeamForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const membersStr = document.getElementById('members').value;
    const members = membersStr ? membersStr.split(',').map(m => parseInt(m.trim())) : [];
    const team = {
        teamName: document.getElementById('teamName').value,
        leaderId: parseInt(document.getElementById('leaderId').value),
        members: members
    };
    try {
        await createEmergencyTeam(team);
        closeModal();
        loadTeams();
    } catch (error) {
        alert(error.message);
    }
});

loadTeams();