// js/pages/change-password.js

function showChangePasswordModal() {
    // إزالة أي نافذة سابقة
    const existing = document.getElementById('changePasswordModal');
    if (existing) existing.remove();

    // إنشاء النافذة المنبثقة
    const modal = document.createElement('div');
    modal.id = 'changePasswordModal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeChangePasswordModal()">&times;</span>
            <h3><i class="fas fa-key"></i> تغيير كلمة المرور</h3>
            <form id="changePasswordForm">
                <div class="form-group">
                    <label>كلمة المرور الحالية</label>
                    <input type="password" id="oldPassword" required>
                </div>
                <div class="form-group">
                    <label>كلمة المرور الجديدة</label>
                    <input type="password" id="newPassword" required minlength="6">
                </div>
                <div class="form-group">
                    <label>تأكيد كلمة المرور الجديدة</label>
                    <input type="password" id="confirmNewPassword" required minlength="6">
                </div>
                <button type="submit" class="btn btn-primary">تغيير كلمة المرور</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // التعامل مع submit
    document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const oldPass = document.getElementById('oldPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmNewPassword').value;

        if (newPass !== confirm) {
            alert('كلمتا المرور الجديدتين غير متطابقتين');
            return;
        }
        try {
            const result = await changePassword(oldPass, newPass);
            alert(result.message);
            closeChangePasswordModal();
        } catch (error) {
            alert(error.message);
        }
    });
}

function closeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) modal.remove();
}

// جعل الدوال عامة
window.showChangePasswordModal = showChangePasswordModal;
window.closeChangePasswordModal = closeChangePasswordModal;