const user = requireAuth();
updateUserDisplay();

const reportsGrid = document.getElementById('reportsGrid');
let reports = [];

if (user.role === 'manager' || user.role === 'inventory_keeper') {
    reports = [
        { icon: 'fas fa-users', title: 'تقرير المستفيدين', desc: 'إحصائية بعدد المستفيدين', link: 'beneficiaries-report.html' },
        { icon: 'fas fa-donate', title: 'تقرير التبرعات', desc: 'تفاصيل التبرعات الواردة', link: 'donations-report.html' },
        { icon: 'fas fa-boxes', title: 'تقرير المخزون', desc: 'حالة المخزون الحالية', link: 'inventory-report.html' },
        { icon: 'fas fa-money-bill', title: 'التقرير المالي', desc: 'إيرادات ومصروفات', link: 'financial-report.html' },
        { icon: 'fas fa-tasks', title: 'طلبات المساعدة', desc: 'حالة الطلبات', link: 'requests-report.html' },
        { icon: 'fas fa-ambulance', title: 'فرق الطوارئ', desc: 'أداء الفرق', link: 'emergency-report.html' },
        { icon: 'fas fa-pills', title: 'تقرير الأدوية', desc: 'حالة الأدوية والمواد الصحية', link: 'medical-report.html' }
    ];
} else if (user.role === 'donor') {
    reports = [
        { icon: 'fas fa-hand-holding-heart', title: 'تبرعاتي', desc: 'سجل تبرعاتي', link: 'my-donations-report.html' },
        { icon: 'fas fa-chart-line', title: 'إحصائيات', desc: 'إحصائيات التبرعات', link: 'donor-stats.html' }
    ];
} else if (user.role === 'beneficiary') {
    reports = [
        { icon: 'fas fa-hands-helping', title: 'طلباتي', desc: 'حالة طلبات المساعدة', link: 'my-requests-report.html' },
        { icon: 'fas fa-heartbeat', title: 'حالتي الصحية', desc: 'السجل الصحي', link: 'my-health-report.html' }
    ];
} else if (user.role === 'employee' || user.role === 'volunteer') {
    reports = [
        { icon: 'fas fa-user-injured', title: 'المستفيدين', desc: 'إحصائيات المستفيدين', link: 'beneficiaries-report.html' },
        { icon: 'fas fa-tasks', title: 'الطلبات', desc: 'حالة الطلبات', link: 'requests-report.html' },
        { icon: 'fas fa-heartbeat', title: 'الحالات الصحية', desc: 'السجلات الصحية', link: 'health-report.html' }
    ];
}

reportsGrid.innerHTML = reports.map(r => `
    <div class="report-card" onclick="window.location.href='${r.link}'">
        <i class="${r.icon}"></i>
        <h3>${r.title}</h3>
        <p>${r.desc}</p>
    </div>
`).join('');