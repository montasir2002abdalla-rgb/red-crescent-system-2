const user = requireAuth();
updateUserDisplay();

if (user.role !== 'donor' && user.role !== 'beneficiary' && user.role !== 'manager') {
    alert('غير مسموح لك بالوصول إلى هذه الصفحة');
    window.location.href = 'dashboard.html';
}

function showTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    if (tab === 'notifications') {
        document.querySelector('[onclick="showTab(\'notifications\')"]').classList.add('active');
        document.getElementById('notificationsTab').classList.add('active');
        loadNotifications();
    } else if (tab === 'complaints') {
        document.querySelector('[onclick="showTab(\'complaints\')"]').classList.add('active');
        document.getElementById('complaintsTab').classList.add('active');
        loadComplaints();
    } else {
        document.querySelector('[onclick="showTab(\'new\')"]').classList.add('active');
        document.getElementById('newTab').classList.add('active');
    }
}

async function loadNotifications() {
    try {
        const complaints = await getComplaints();
        const notifications = complaints.filter(c => c.type === 'notification');
        const container = document.getElementById('notificationsList');
        container.innerHTML = notifications.map(n => `
            <div class="complaint-item">
                <p>${n.message}</p>
                <small>${new Date(n.createdAt).toLocaleString('ar-EG')}</small>
            </div>
        `).join('') || '<p>لا توجد تنبيهات</p>';
    } catch (error) {
        alert(error.message);
    }
}

async function loadComplaints() {
    try {
        const complaints = await getComplaints();
        const userComplaints = user.role === 'manager' ? complaints : complaints.filter(c => c.type === 'complaint');
        const container = document.getElementById('complaintsList');
        container.innerHTML = userComplaints.map(c => `
            <div class="complaint-item">
                <p>${c.message}</p>
                <small>${new Date(c.createdAt).toLocaleString('ar-EG')}</small>
            </div>
        `).join('') || '<p>لا توجد شكاوى</p>';
    } catch (error) {
        alert(error.message);
    }
}

document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        type: document.getElementById('complaintType').value,
        message: document.getElementById('complaintMessage').value
    };
    try {
        await createComplaint(data);
        alert('تم الإرسال');
        document.getElementById('complaintForm').reset();
        showTab('notifications');
    } catch (error) {
        alert(error.message);
    }
});

loadNotifications();