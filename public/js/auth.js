function updateUserDisplay() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.querySelectorAll('#userName').forEach(el => el.textContent = user.name);
        document.querySelectorAll('#userRole').forEach(el => el.textContent = getRoleName(user.role));
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