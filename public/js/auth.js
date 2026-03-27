function updateUserDisplay() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.querySelectorAll('#userName').forEach(el => el.textContent = user.name);
        let roleText = '';
        if (user.role === 'manager') roleText = 'مدير النظام';
        else if (user.role === 'inventory_keeper') roleText = 'أمين مخزن';
        else if (user.role === 'employee') roleText = 'موظف';
        else if (user.role === 'volunteer') roleText = 'متطوع';
        else if (user.role === 'donor') roleText = 'مانح';
        else if (user.role === 'beneficiary') roleText = 'مستفيد';
        document.querySelectorAll('#userRole').forEach(el => el.textContent = roleText);
    }
}

function requireAuth(requiredRole) {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!user || !token) {
        window.location.href = 'index.html';
        return null;
    }
    if (requiredRole && !requiredRole.includes(user.role)) {
        alert('ليس لديك صلاحية للوصول إلى هذه الصفحة');
        window.location.href = 'dashboard.html';
        return null;
    }
    return user;
}

function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

window.updateUserDisplay = updateUserDisplay;
window.requireAuth = requireAuth;
window.logout = logout;