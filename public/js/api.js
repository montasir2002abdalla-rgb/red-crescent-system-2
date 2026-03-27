async function handleResponse(response) {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Response is not JSON:', text.substring(0, 200));
        throw new Error(`خطأ في الخادم (${response.status}) - تأكد من اتصالك بالخادم`);
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'حدث خطأ');
    return data;
}

// ==================== دوال المصادقة (Auth) ====================
async function login(employeeId, password) {
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, password })
    });
    return handleResponse(res);
}

async function register(userData) {
    const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return handleResponse(res);
}

async function changePassword(oldPassword, newPassword) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
    });
    return handleResponse(res);
}

// ==================== دوال المستخدمين (Users) ====================
async function getAllUsers() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

async function getPendingUsers() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/users/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

async function getActiveUsers() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/users/active', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

async function approveUser(userId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/users/approve/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

async function rejectUser(userId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/users/reject/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

async function deleteUser(userId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

async function updateUser(id, data) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

// ==================== دوال المخزون (Inventory) ====================
async function getInventory() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

async function addInventoryItem(item) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
    });
    return handleResponse(res);
}

async function updateInventoryItem(id, quantity) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
    });
    return handleResponse(res);
}

async function deleteInventoryItem(id) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

// ==================== دوال التبرعات (Donations) ====================
async function getDonations() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/donations', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

async function getUserDonations() {
    return getDonations();
}

async function createDonation(data) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/donations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

// ==================== دوال المصروفات (Expenses) ====================
async function createExpense(data) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

// ==================== دوال المعاملات المالية (Financial Transactions) ====================
async function getFinancialTransactions() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/financial-transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

// ==================== دوال المستفيدين (Beneficiaries) ====================
async function getBeneficiaries() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/beneficiaries', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

async function createBeneficiary(data) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

async function updateBeneficiary(id, data) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/beneficiaries/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

async function deleteBeneficiary(id) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/beneficiaries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

// ==================== دوال طلبات المساعدة (Assistance Requests) ====================
async function getAssistanceRequests() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/assistance-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

async function createAssistanceRequest(data) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/assistance-requests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

async function updateAssistanceRequestStatus(id, status) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/assistance-requests/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
    return handleResponse(res);
}

async function deleteAssistanceRequest(id) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/assistance-requests/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

// ==================== دوال فرق الطوارئ (Emergency Teams) ====================
async function getEmergencyTeams() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/emergency-teams', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

async function createEmergencyTeam(data) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/emergency-teams', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

async function updateEmergencyTeam(id, data) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/emergency-teams/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

// ==================== دوال اللوجستيات (Logistics) ====================
async function getLogistics() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/logistics', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

async function createLogistics(data) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/logistics', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

async function updateLogistics(id, data) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/logistics/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

// ==================== دوال السجلات الصحية (Health Records) ====================
async function getHealthRecords(beneficiaryId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/health-records/${beneficiaryId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

async function createHealthRecord(data) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/health-records', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

async function updateHealthRecord(id, data) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/health-records/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

async function deleteHealthRecord(id) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/health-records/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

// ==================== دوال الشكاوى والتنبيهات (Complaints) ====================
async function getComplaints() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

async function createComplaint(data) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

async function markComplaintAsRead(id) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/complaints/read/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

async function deleteComplaint(id) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/complaints/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}

// ==================== دوال الإحصائيات (Stats) ====================
async function getStats() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}
async function updateFinancialTransaction(id, data) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/financial-transactions/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

async function deleteFinancialTransaction(id) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/financial-transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
}
// في نهاية api.js، أضف إذا لم تكن موجودة:
async function createExpense(data) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

// تأكد من وجود الدوال التالية أيضاً:
window.createExpense = createExpense;

window.updateFinancialTransaction = updateFinancialTransaction;
window.deleteFinancialTransaction = deleteFinancialTransaction;
// ==================== تصدير الدوال إلى النطاق العام ====================
window.login = login;
window.register = register;
window.changePassword = changePassword;

window.getAllUsers = getAllUsers;
window.getPendingUsers = getPendingUsers;
window.getActiveUsers = getActiveUsers;
window.approveUser = approveUser;
window.rejectUser = rejectUser;
window.deleteUser = deleteUser;
window.updateUser = updateUser;

window.getInventory = getInventory;
window.addInventoryItem = addInventoryItem;
window.updateInventoryItem = updateInventoryItem;
window.deleteInventoryItem = deleteInventoryItem;

window.getDonations = getDonations;
window.getUserDonations = getUserDonations;
window.createDonation = createDonation;

window.createExpense = createExpense;
window.getFinancialTransactions = getFinancialTransactions;

window.getBeneficiaries = getBeneficiaries;
window.createBeneficiary = createBeneficiary;
window.updateBeneficiary = updateBeneficiary;
window.deleteBeneficiary = deleteBeneficiary;

window.getAssistanceRequests = getAssistanceRequests;
window.createAssistanceRequest = createAssistanceRequest;
window.updateAssistanceRequestStatus = updateAssistanceRequestStatus;
window.deleteAssistanceRequest = deleteAssistanceRequest;

window.getEmergencyTeams = getEmergencyTeams;
window.createEmergencyTeam = createEmergencyTeam;
window.updateEmergencyTeam = updateEmergencyTeam;

window.getLogistics = getLogistics;
window.createLogistics = createLogistics;
window.updateLogistics = updateLogistics;

window.getHealthRecords = getHealthRecords;
window.createHealthRecord = createHealthRecord;
window.updateHealthRecord = updateHealthRecord;
window.deleteHealthRecord = deleteHealthRecord;

window.getComplaints = getComplaints;
window.createComplaint = createComplaint;
window.markComplaintAsRead = markComplaintAsRead;
window.deleteComplaint = deleteComplaint;

window.getStats = getStats;