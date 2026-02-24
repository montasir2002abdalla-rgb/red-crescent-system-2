const user = requireAuth(['donor']);
updateUserDisplay();

function showPaymentDetails() {
    const method = document.getElementById('paymentMethod').value;
    document.getElementById('bankDetails').style.display = method === 'bank' ? 'block' : 'none';
    document.getElementById('fawryDetails').style.display = method === 'fawry' ? 'block' : 'none';
}

document.getElementById('donationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const donation = {
        amount: parseFloat(document.getElementById('amount').value),
        paymentMethod: document.getElementById('paymentMethod').value,
        transactionId: document.getElementById('transactionId').value
    };
    try {
        const result = await createDonation(donation);
        alert('تم تسجيل تبرعك، شكراً لك!');
        document.getElementById('donationForm').reset();
        loadMyDonations();
    } catch (error) {
        alert(error.message);
    }
});

async function loadMyDonations() {
    try {
        const donations = await getUserDonations();
        const tbody = document.getElementById('myDonationsBody');
        tbody.innerHTML = donations.map(d => `
            <tr>
                <td>${d.amount}</td>
                <td>${d.paymentMethod}</td>
                <td><span class="status ${d.status}">${d.status}</span></td>
                <td>${new Date(d.createdAt).toLocaleDateString('ar-EG')}</td>
            </tr>
        `).join('');
    } catch (error) {
        alert(error.message);
    }
}

loadMyDonations();