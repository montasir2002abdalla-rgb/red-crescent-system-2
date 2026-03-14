// js/pages/dashboard.js (معدل لإزالة تكرار الإشعارات)

// js/pages/dashboard.js

const user = requireAuth();
updateUserDisplay();

function buildSidebar() {
    const nav = document.getElementById('mainNav');
    const role = user.role;
    let html = '';

    html += `<div class="nav-section"><h4 class="nav-title">القائمة الرئيسية</h4><ul>`;
    html += `<li><a href="#" class="nav-link active" onclick="loadSection('dashboard')"><i class="fas fa-home"></i> <span>الرئيسية</span></a></li>`;
    html += `</ul></div>`;

    if (role === 'manager') {
        html += `<div class="nav-section"><h4 class="nav-title">إدارة النظام</h4><ul>`;
        html += `<li><a href="#" class="nav-link" onclick="window.location.href='approvals.html'"><i class="fas fa-check-circle"></i> <span>الموافقات المعلقة</span></a></li>`;
        html += `<li><a href="#" class="nav-link" onclick="window.location.href='inventory.html'"><i class="fas fa-boxes"></i> <span>المخزون</span></a></li>`;
        html += `<li><a href="#" class="nav-link" onclick="window.location.href='reports.html'"><i class="fas fa-chart-bar"></i> <span>التقارير</span></a></li>`;
        html += `<li><a href="#" class="nav-link" onclick="window.location.href='emergency.html'"><i class="fas fa-ambulance"></i> <span>فرق الطوارئ</span></a></li>`;
        html += `<li><a href="#" class="nav-link" onclick="window.location.href='logistics.html'"><i class="fas fa-truck"></i> <span>النقل واللوجستيات</span></a></li>`;
        html += `</ul></div>`;
    } else if (role === 'inventory_keeper') {
        html += `<div class="nav-section"><h4 class="nav-title">إدارة المخزون</h4><ul>`;
        html += `<li><a href="#" class="nav-link" onclick="window.location.href='inventory.html'"><i class="fas fa-boxes"></i> <span>المخزون</span></a></li>`;
        html += `<li><a href="#" class="nav-link" onclick="window.location.href='reports.html'"><i class="fas fa-chart-bar"></i> <span>التقارير</span></a></li>`;
        html += `<li><a href="#" class="nav-link" onclick="window.location.href='logistics.html'"><i class="fas fa-truck"></i> <span>النقل واللوجستيات</span></a></li>`;
        html += `</ul></div>`;
    } else if (role === 'employee' || role === 'volunteer') {
        html += `<div class="nav-section"><h4 class="nav-title">العمليات</h4><ul>`;
        html += `<li><a href="#" class="nav-link" onclick="window.location.href='beneficiaries.html'"><i class="fas fa-user-injured"></i> <span>المستفيدين</span></a></li>`;
        html += `<li><a href="#" class="nav-link" onclick="window.location.href='requests.html'"><i class="fas fa-tasks"></i> <span>طلبات المساعدة</span></a></li>`;
        html += `<li><a href="#" class="nav-link" onclick="window.location.href='health.html'"><i class="fas fa-heartbeat"></i> <span>الحالات الصحية</span></a></li>`;
        html += `<li><a href="#" class="nav-link" onclick="window.location.href='logistics.html'"><i class="fas fa-truck"></i> <span>النقل واللوجستيات</span></a></li>`;
        html += `</ul></div>`;
    } else if (role === 'donor') {
        html += `<div class="nav-section"><h4 class="nav-title">التبرعات</h4><ul>`;
        html += `<li><a href="#" class="nav-link" onclick="window.location.href='finance.html'"><i class="fas fa-hand-holding-heart"></i> <span>تقديم تبرع</span></a></li>`;
        html += `<li><a href="#" class="nav-link" onclick="loadSection('myDonations')"><i class="fas fa-history"></i> <span>تبرعاتي</span></a></li>`;
        html += `</ul></div>`;
    } else if (role === 'beneficiary') {
        html += `<div class="nav-section"><h4 class="nav-title">الخدمات</h4><ul>`;
        html += `<li><a href="#" class="nav-link" onclick="window.location.href='requests.html'"><i class="fas fa-hands-helping"></i> <span>طلب مساعدة</span></a></li>`;
        html += `<li><a href="#" class="nav-link" onclick="loadSection('myRequests')"><i class="fas fa-list"></i> <span>طلباتي</span></a></li>`;
        html += `</ul></div>`;
    }

    // إضافة عنصر الإشعارات مرة واحدة فقط للجميع (مع عداد)
    html += `<div class="nav-section" style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;"><ul>`;
    html += `<li><a href="notifications.html" class="nav-link" id="notificationsLink">`;
    html += `<i class="fas fa-bell"></i> <span>الإشعارات</span>`;
    html += `<span class="notification-badge" id="notificationBadge" style="display: none;">0</span>`;
    html += `</a></li>`;
    html += `</ul></div>`;

    // إضافة عنصر تغيير كلمة المرور في الأسفل
    html += `<div class="nav-section"><ul>`;
    html += `<li><a href="#" class="nav-link" onclick="showChangePasswordModal()"><i class="fas fa-key"></i> <span>تغيير كلمة المرور</span></a></li>`;
    html += `</ul></div>`;

    nav.innerHTML = html;
}



async function loadSection(section) {
    const content = document.getElementById('mainContent');
    
    if (section === 'dashboard') {
        try {
            const stats = await getStats();
            let statsHtml = '';
            if (user.role === 'manager' || user.role === 'inventory_keeper') {
                statsHtml = `
                    <div class="quick-stats">
                        <div class="stat-card" onclick="window.location.href='beneficiaries-report.html'">
                            <i class="fas fa-users"></i>
                            <div class="count">${stats.beneficiaries}</div>
                            <div class="label">المستفيدين</div>
                        </div>
                        <div class="stat-card" onclick="window.location.href='donations-report.html'">
                            <i class="fas fa-donate"></i>
                            <div class="count">${stats.donations}</div>
                            <div class="label">التبرعات</div>
                        </div>
                        <div class="stat-card" onclick="window.location.href='inventory-report.html'">
                            <i class="fas fa-boxes"></i>
                            <div class="count">${stats.inventoryItems}</div>
                            <div class="label">أصناف المخزون</div>
                        </div>
                        <div class="stat-card" onclick="window.location.href='financial-report.html'">
                            <i class="fas fa-money-bill"></i>
                            <div class="count">${stats.totalFunds}</div>
                            <div class="label">إجمالي الأموال</div>
                        </div>
                        <div class="stat-card" onclick="window.location.href='requests-report.html'">
                            <i class="fas fa-clock"></i>
                            <div class="count">${stats.pendingRequests}</div>
                            <div class="label">طلبات معلقة</div>
                        </div>
                `;
                if (stats.pendingUsers !== undefined) {
                    statsHtml += `<div class="stat-card" onclick="window.location.href='approvals.html'">
                        <i class="fas fa-user-clock"></i>
                        <div class="count">${stats.pendingUsers}</div>
                        <div class="label">طلبات انضمام</div>
                    </div>`;
                }
                if (stats.lowStock !== undefined) {
                    statsHtml += `<div class="stat-card" onclick="window.location.href='inventory-report.html'">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div class="count">${stats.lowStock}</div>
                        <div class="label">مخزون منخفض</div>
                    </div>`;
                }
                if (stats.activeTeams !== undefined) {
                    statsHtml += `<div class="stat-card" onclick="window.location.href='emergency-report.html'">
                        <i class="fas fa-ambulance"></i>
                        <div class="count">${stats.activeTeams}</div>
                        <div class="label">فرق نشطة</div>
                    </div>`;
                }
                statsHtml += `</div>`;
            } else if (user.role === 'donor') {
                statsHtml = `<div class="quick-stats">
                    <div class="stat-card" onclick="loadSection('myDonations')">
                        <i class="fas fa-hand-holding-heart"></i>
                        <div class="count">${stats.donations || 0}</div>
                        <div class="label">عدد تبرعاتي</div>
                    </div>
                    <div class="stat-card" onclick="window.location.href='financial-report.html'">
                        <i class="fas fa-money-bill"></i>
                        <div class="count">${stats.totalIncome || 0}</div>
                        <div class="label">إجمالي تبرعاتي</div>
                    </div>
                </div>`;
            } else if (user.role === 'beneficiary') {
                statsHtml = `<div class="quick-stats">
                    <div class="stat-card" onclick="loadSection('myRequests')">
                        <i class="fas fa-clock"></i>
                        <div class="count">${stats.pendingRequests || 0}</div>
                        <div class="label">طلباتي المعلقة</div>
                    </div>
                    <div class="stat-card" onclick="window.location.href='requests-report.html'">
                        <i class="fas fa-check-circle"></i>
                        <div class="count">${stats.completedRequests || 0}</div>
                        <div class="label">الطلبات المكتملة</div>
                    </div>
                </div>`;
            } else if (user.role === 'employee' || user.role === 'volunteer') {
                statsHtml = `<div class="quick-stats">
                    <div class="stat-card" onclick="window.location.href='beneficiaries-report.html'">
                        <i class="fas fa-users"></i>
                        <div class="count">${stats.beneficiaries}</div>
                        <div class="label">المستفيدين</div>
                    </div>
                    <div class="stat-card" onclick="window.location.href='requests-report.html'">
                        <i class="fas fa-clock"></i>
                        <div class="count">${stats.pendingRequests}</div>
                        <div class="label">طلبات معلقة</div>
                    </div>
                </div>`;
            }

            content.innerHTML = `
                <div class="dashboard-welcome">
                    <h2>مرحباً ${user.name}</h2>
                </div>
                ${statsHtml}
                <div class="recent-activities">
                    <h3><i class="fas fa-history"></i> الأنشطة الأخيرة</h3>
                    <div class="activities-list" id="activitiesList"></div>
                </div>
            `;
            loadRecentActivities();
        } catch (error) {
            content.innerHTML = `<p class="error">حدث خطأ في تحميل البيانات</p>`;
        }
    } else if (section === 'myDonations' && user.role === 'donor') {
        try {
            const donations = await getUserDonations();
            let rows = '';
            donations.forEach(d => {
                rows += `<tr>
                    <td>${d.amount}</td>
                    <td>${d.paymentMethod}</td>
                    <td><span class="status ${d.status}">${d.status}</span></td>
                    <td>${new Date(d.createdAt).toLocaleDateString('ar-EG')}</td>
                </tr>`;
            });
            content.innerHTML = `
                <h2><i class="fas fa-history"></i> تبرعاتي السابقة</h2>
                <table class="data-table">
                    <thead><tr><th>المبلغ</th><th>طريقة الدفع</th><th>الحالة</th><th>التاريخ</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="4">لا توجد تبرعات</td></tr>'}</tbody>
                </table>
            `;
        } catch (error) {
            content.innerHTML = `<p class="error">حدث خطأ</p>`;
        }
    } else if (section === 'myRequests' && user.role === 'beneficiary') {
        try {
            const requests = await getAssistanceRequests();
            const beneficiaries = await getBeneficiaries();
            const myBeneficiary = beneficiaries.find(b => b.userId === user.id);
            const myRequests = myBeneficiary ? requests.filter(r => r.beneficiaryId === myBeneficiary.id) : [];
            let rows = '';
            myRequests.forEach(r => {
                rows += `<tr>
                    <td>${r.requestType}</td>
                    <td>${r.description.substring(0,30)}...</td>
                    <td><span class="status ${r.status}">${r.status}</span></td>
                    <td>${new Date(r.createdAt).toLocaleDateString('ar-EG')}</td>
                </tr>`;
            });
            content.innerHTML = `
                <h2><i class="fas fa-list"></i> طلبات المساعدة الخاصة بي</h2>
                <table class="data-table">
                    <thead><tr><th>النوع</th><th>الوصف</th><th>الحالة</th><th>التاريخ</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="4">لا توجد طلبات</td></tr>'}</tbody>
                </table>
            `;
        } catch (error) {
            content.innerHTML = `<p class="error">حدث خطأ</p>`;
        }
    }
}

async function loadRecentActivities() {
    const list = document.getElementById('activitiesList');
    try {
        const donations = await getDonations();
        let html = '';
        donations.slice(0,5).forEach(d => {
            html += `<div class="activity-item">
                <div class="activity-icon"><i class="fas fa-donate"></i></div>
                <div class="activity-details">
                    <h4>تبرع جديد</h4>
                    <p>${d.donorName} تبرع بمبلغ ${d.amount}</p>
                    <span class="activity-time">${new Date(d.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
            </div>`;
        });
        list.innerHTML = html || '<p>لا توجد أنشطة حديثة</p>';
    } catch (error) {
        list.innerHTML = '<p>خطأ في التحميل</p>';
    }
}

// دالة تحميل عدد الإشعارات غير المقروءة
async function loadNotificationCount() {
    try {
        const complaints = await getComplaints(); // تعيد جميع الشكاوى/التنبيهات
        let unreadCount = 0;

        // تحديد عدد الإشعارات غير المقروءة حسب دور المستخدم
        if (user.role === 'manager' || user.role === 'inventory_keeper' || user.role === 'employee') {
            // المستقبلون: كل التنبيهات والشكاوى (يمكن تحسينها بحقل isRead)
            unreadCount = complaints.length;
        } else if (user.role === 'donor' || user.role === 'beneficiary') {
            // المرسلون: فقط الرسائل التي أرسلوها
            unreadCount = complaints.filter(c => c.userId === user.id || c.senderId === user.id).length;
        }

        if (unreadCount > 0) {
            const badge = document.getElementById('notificationBadge');
            if (badge) {
                badge.style.display = 'inline-block';
                badge.innerText = unreadCount > 99 ? '99+' : unreadCount;
            }
        } else {
            const badge = document.getElementById('notificationBadge');
            if (badge) badge.style.display = 'none';
        }
    } catch (error) {
        console.error('فشل تحميل عدد الإشعارات:', error);
        // لا نظهر العداد في حال الخطأ
    }
}

document.getElementById('globalSearch')?.addEventListener('input', function(e) {
    const query = e.target.value.trim();
    if (query.length > 2) {
        console.log('بحث عن:', query);
    }
});
// دالة لفتح/إغلاق القائمة على الجوال
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay') || createOverlay();
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// إنشاء طبقة الخلفية المعتمة إذا لم تكن موجودة
function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'sidebarOverlay';
    overlay.className = 'sidebar-overlay';
    overlay.onclick = closeMobileMenu;
    document.body.appendChild(overlay);
    return overlay;
}

function closeMobileMenu() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

// استدعاء createOverlay عند تحميل الصفحة للتأكد من وجودها
document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('sidebarOverlay')) {
        createOverlay();
    }
});

// إضافة مستمع لتغيير حجم الشاشة لإغلاق القائمة إذا أصبحت الشاشة كبيرة
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
    }
});

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('expanded');
}

function closeNotifications() {
    document.getElementById('notificationsPanel').style.display = 'none';
}

buildSidebar();
loadSection('dashboard');

// تحميل عدد الإشعارات بعد ثانية لضمان تحميل الصفحة
setTimeout(loadNotificationCount, 1000);