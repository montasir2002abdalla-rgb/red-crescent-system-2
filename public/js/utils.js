function getRoleName(role) {
    const roles = {
        'manager': 'مدير',
        'inventory_keeper': 'أمين مخزن',
        'employee': 'موظف',
        'volunteer': 'متطوع',
        'donor': 'مانح',
        'beneficiary': 'مستفيد'
    };
    return roles[role] || role;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('ar-EG');
}

window.getRoleName = getRoleName;
window.formatDate = formatDate;