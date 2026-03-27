// js/pages/notifications.js
const user = requireAuth();
updateUserDisplay();

const isSender = (user.role === 'donor' || user.role === 'beneficiary');
const isReceiver = (user.role === 'manager' || user.role === 'inventory_keeper' || user.role === 'employee');

if (!isSender && !isReceiver) {
    alert('غير مسموح بالوصول');
    window.location.href = 'dashboard.html';
}

function initTabs() {
    const tabsContainer = document.querySelector('.tabs');
    let tabsHtml = '';

    if (isReceiver) {
        tabsHtml += `<button class="tab active" onclick="showTab('notifications')">التنبيهات الواردة</button>`;
        tabsHtml += `<button class="tab" onclick="showTab('complaints')">الشكاوى الواردة</button>`;
    }
    if (isSender) {
        tabsHtml += `<button class="tab" onclick="showTab('new')">إرسال جديد</button>`;
        tabsHtml += `<button class="tab" onclick="showTab('myMessages')">رسائلي</button>`;
    }

    tabsContainer.innerHTML = tabsHtml;

    if (isReceiver) showTab('notifications');
    else if (isSender) showTab('myMessages');
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
    } else if (tab === 'new') {
        document.querySelector('[onclick="showTab(\'new\')"]').classList.add('active');
        document.getElementById('newTab').classList.add('active');
    } else if (tab === 'myMessages') {
        document.querySelector('[onclick="showTab(\'myMessages\')"]').classList.add('active');
        document.getElementById('myMessagesTab').classList.add('active');
        loadMyMessages();
    }
}

async function loadNotifications() {
    try {
        const all = await getComplaints();
        const notifications = all.filter(c => c.type === 'notification');
        const container = document.getElementById('notificationsList');
        container.innerHTML = notifications.map(n => `
            <div class="complaint-item ${n.read ? 'read' : 'unread'}">
                <p><strong>من: ${n.userRole === 'donor' ? 'مانح' : n.userRole === 'beneficiary' ? 'مستفيد' : 'غير معروف'}</strong></p>
                <p>${n.message}</p>
                <small>${new Date(n.createdAt).toLocaleString('ar-EG')}</small>
                <div class="complaint-actions">
                    ${!n.read ? `<button class="btn btn-sm btn-success" onclick="markAsRead(${n.id})">قراءة</button>` : ''}
                    ${(user.role === 'manager') ? `<button class="btn btn-sm btn-danger" onclick="deleteMessage(${n.id})">حذف</button>` : ''}
                </div>
            </div>
        `).join('') || '<p>لا توجد تنبيهات</p>';
    } catch (error) {
        alert('خطأ في تحميل التنبيهات: ' + error.message);
    }
}

async function loadComplaints() {
    try {
        const all = await getComplaints();
        const complaints = all.filter(c => c.type === 'complaint');
        const container = document.getElementById('complaintsList');
        container.innerHTML = complaints.map(c => `
            <div class="complaint-item ${c.read ? 'read' : 'unread'}">
                <p><strong>من: ${c.userRole === 'donor' ? 'مانح' : c.userRole === 'beneficiary' ? 'مستفيد' : 'غير معروف'}</strong></p>
                <p>${c.message}</p>
                <small>${new Date(c.createdAt).toLocaleString('ar-EG')}</small>
                <div class="complaint-actions">
                    ${!c.read ? `<button class="btn btn-sm btn-success" onclick="markAsRead(${c.id})">قراءة</button>` : ''}
                    ${(user.role === 'manager') ? `<button class="btn btn-sm btn-danger" onclick="deleteMessage(${c.id})">حذف</button>` : ''}
                </div>
            </div>
        `).join('') || '<p>لا توجد شكاوى</p>';
    } catch (error) {
        alert('خطأ في تحميل الشكاوى: ' + error.message);
    }
}

async function loadMyMessages() {
    try {
        const all = await getComplaints();
        const myMessages = all.filter(c => c.userId === user.id);
        const container = document.getElementById('myMessagesList');
        container.innerHTML = myMessages.map(m => `
            <div class="complaint-item ${m.read ? 'read' : 'unread'}">
                <p><span class="badge ${m.type}">${m.type === 'notification' ? 'تنبيه' : 'شكوى'}</span></p>
                <p>${m.message}</p>
                <small>${new Date(m.createdAt).toLocaleString('ar-EG')}</small>
                <div class="complaint-actions">
                    ${(user.role === 'manager' || m.userId === user.id) ? `<button class="btn btn-sm btn-danger" onclick="deleteMessage(${m.id})">حذف</button>` : ''}
                </div>
            </div>
        `).join('') || '<p>لم ترسل أي رسائل بعد</p>';
    } catch (error) {
        alert('خطأ في تحميل رسائلك: ' + error.message);
    }
}

window.markAsRead = async (id) => {
    try {
        await markComplaintAsRead(id);
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) showTab(activeTab.innerText === 'التنبيهات الواردة' ? 'notifications' :
                                 activeTab.innerText === 'الشكاوى الواردة' ? 'complaints' :
                                 activeTab.innerText === 'رسائلي' ? 'myMessages' : 'new');
    } catch (error) {
        alert('فشل تحديث الحالة: ' + error.message);
    }
};

window.deleteMessage = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
        try {
            await deleteComplaint(id);
            const activeTab = document.querySelector('.tab.active');
            if (activeTab) showTab(activeTab.innerText === 'التنبيهات الواردة' ? 'notifications' :
                                     activeTab.innerText === 'الشكاوى الواردة' ? 'complaints' :
                                     activeTab.innerText === 'رسائلي' ? 'myMessages' : 'new');
        } catch (error) {
            alert('فشل الحذف: ' + error.message);
        }
    }
};

document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        type: document.getElementById('complaintType').value,
        message: document.getElementById('complaintMessage').value
    };
    try {
        await createComplaint(data);
        alert('تم الإرسال بنجاح');
        document.getElementById('complaintForm').reset();
        if (isSender) showTab('myMessages');
        else showTab('notifications');
    } catch (error) {
        alert('فشل الإرسال: ' + error.message);
    }
});

initTabs();