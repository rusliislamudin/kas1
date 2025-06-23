document.addEventListener('DOMContentLoaded', function() {
    // Elemen form
    const transactionForm = document.getElementById('transactionForm');
    const dateInput = document.getElementById('date');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const typeSelect = document.getElementById('type');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const addNewBtn = document.getElementById('addNewBtn');
    const editIdInput = document.getElementById('editId');
    const formTitle = document.getElementById('formTitle');

    // Elemen ringkasan
    const totalIncomeElement = document.getElementById('totalIncome');
    const totalExpenseElement = document.getElementById('totalExpense');
    const balanceElement = document.getElementById('balance');

    // Elemen daftar transaksi
    const transactionList = document.getElementById('transactionList');

    // Modal
    const confirmModal = document.getElementById('confirmModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');

    // Variabel untuk menyimpan ID transaksi yang akan dihapus
    let transactionToDelete = null;

    // Set tanggal default ke hari ini
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Inisialisasi data transaksi dari localStorage
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Fungsi untuk menyimpan transaksi
    function saveTransaction(event) {
        event.preventDefault();
        
        const id = editIdInput.value ? parseInt(editIdInput.value) : Date.now();
        const date = dateInput.value;
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const type = typeSelect.value;
        
        if (!date || !description || isNaN(amount)) {
            showNotification('Harap isi semua field dengan benar!', true);
            return;
        }
        
        const transaction = {
            id,
            date,
            description,
            amount,
            type
        };
        
        if (editIdInput.value) {
            // Update transaksi yang ada
            const index = transactions.findIndex(t => t.id === id);
            if (index !== -1) {
                transactions[index] = transaction;
                showNotification('Transaksi berhasil diperbarui!');
            }
        } else {
            // Tambah transaksi baru
            transactions.push(transaction);
            showNotification('Transaksi berhasil ditambahkan!');
        }
        
        saveTransactions();
        renderTransactions();
        updateSummary();
        resetForm();
    }

    // Fungsi untuk mengedit transaksi
    function editTransaction(id) {
        const transaction = transactions.find(t => t.id === id);
        if (transaction) {
            editIdInput.value = transaction.id;
            dateInput.value = transaction.date;
            descriptionInput.value = transaction.description;
            amountInput.value = transaction.amount;
            typeSelect.value = transaction.type;
            formTitle.textContent = 'Edit';
            
            // Scroll ke form
            transactionForm.scrollIntoView({ behavior: 'smooth' });
            descriptionInput.focus();
        }
    }

    // Fungsi untuk menghapus transaksi
    function deleteTransaction(id) {
        transactionToDelete = id;
        confirmModal.classList.add('show');
    }

    // Konfirmasi hapus
    confirmDeleteBtn.addEventListener('click', function() {
        if (transactionToDelete) {
            transactions = transactions.filter(t => t.id !== transactionToDelete);
            saveTransactions();
            renderTransactions();
            updateSummary();
            showNotification('Transaksi berhasil dihapus!');
        }
        confirmModal.classList.remove('show');
        transactionToDelete = null;
    });

    // Batal hapus
    cancelDeleteBtn.addEventListener('click', function() {
        confirmModal.classList.remove('show');
        transactionToDelete = null;
    });

    // Fungsi untuk reset form
    function resetForm() {
        editIdInput.value = '';
        dateInput.value = today;
        descriptionInput.value = '';
        amountInput.value = '';
        typeSelect.value = 'income';
        formTitle.textContent = 'Tambah';
    }

    // Fungsi untuk menyimpan transaksi ke localStorage
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    // Fungsi untuk menampilkan transaksi
    function renderTransactions() {
        transactionList.innerHTML = '';
        
        if (transactions.length === 0) {
            transactionList.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="far fa-folder-open"></i>
                        <p>Belum ada transaksi</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Urutkan transaksi berdasarkan tanggal (terbaru pertama)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td class="${transaction.type === 'income' ? 'income' : ''}">
                    ${transaction.type === 'income' ? formatCurrency(transaction.amount) : '-'}
                </td>
                <td class="${transaction.type === 'expense' ? 'expense' : ''}">
                    ${transaction.type === 'expense' ? formatCurrency(transaction.amount) : '-'}
                </td>
                <td class="actions">
                    <button class="action-btn edit-btn" onclick="editTransaction(${transaction.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            transactionList.appendChild(row);
        });
    }

    // Fungsi untuk memperbarui ringkasan keuangan
    function updateSummary() {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = totalIncome - totalExpense;
        
        totalIncomeElement.textContent = formatCurrency(totalIncome);
        totalExpenseElement.textContent = formatCurrency(totalExpense);
        balanceElement.textContent = formatCurrency(balance);
    }

    // Fungsi helper untuk memformat tanggal
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }

    // Fungsi helper untuk memformat mata uang
    function formatCurrency(amount) {
        return 'Rp ' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,').replace('.00', '');
    }

    // Fungsi untuk menampilkan notifikasi
    function showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = `notification ${isError ? 'error' : ''}`;
        notification.innerHTML = `
            <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            ${message}
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Event listener
    saveBtn.addEventListener('click', saveTransaction);
    cancelBtn.addEventListener('click', resetForm);
    addNewBtn.addEventListener('click', function() {
        resetForm();
        transactionForm.scrollIntoView({ behavior: 'smooth' });
    });

    // Inisialisasi tampilan
    renderTransactions();
    updateSummary();

    // Export fungsi ke global scope untuk bisa dipanggil dari HTML
    window.editTransaction = editTransaction;
    window.deleteTransaction = deleteTransaction;
});

// ... (kode sebelumnya tetap sama) ...

// Fungsi untuk menghapus transaksi
function deleteTransaction(id) {
    // Tampilkan modal konfirmasi
    showDeleteModal(id);
}

// Fungsi untuk menampilkan modal hapus
function showDeleteModal(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    // Buat elemen modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-exclamation-triangle"></i> Konfirmasi Hapus</h3>
            </div>
            <div class="modal-body">
                <p>Anda akan menghapus transaksi:</p>
                <div class="transaction-detail">
                    <p><strong>Tanggal:</strong> ${formatDate(transaction.date)}</p>
                    <p><strong>Keterangan:</strong> ${transaction.description}</p>
                    <p><strong>Jumlah:</strong> <span class="${transaction.type}">${formatCurrency(transaction.amount)}</span></p>
                </div>
                <p class="warning-text"><i class="fas fa-exclamation-circle"></i> Aksi ini tidak dapat dibatalkan!</p>
            </div>
            <div class="modal-footer">
                <button id="cancelDelete" class="btn secondary">
                    <i class="fas fa-times"></i> Batal
                </button>
                <button id="confirmDelete" class="btn danger">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Animasi muncul
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Event listeners untuk tombol
    document.getElementById('confirmDelete').addEventListener('click', () => {
        // Hapus transaksi
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        renderTransactions();
        updateSummary();
        
        // Tutup modal
        closeDeleteModal(modal);
        
        // Tampilkan notifikasi sukses
        showNotification('Transaksi berhasil dihapus!', false, 'success');
    });
    
    document.getElementById('cancelDelete').addEventListener('click', () => {
        closeDeleteModal(modal);
    });
    
    // Tutup modal saat klik di luar
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeDeleteModal(modal);
        }
    });
}

function closeDeleteModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.remove();
        document.body.style.overflow = 'auto';
    }, 300);
}

// Fungsi notifikasi yang diperbarui
function showNotification(message, isError = false, type = '') {
    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'error' : type || 'success'}`;
    
    let icon = '';
    if (isError) {
        icon = '<i class="fas fa-exclamation-circle"></i>';
    } else if (type === 'success') {
        icon = '<i class="fas fa-check-circle"></i>';
    } else if (type === 'info') {
        icon = '<i class="fas fa-info-circle"></i>';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            ${icon}
            <span>${message}</span>
        </div>
        <div class="notification-progress"></div>
    `;
    
    document.body.appendChild(notification);
    
    // Animasi masuk
    setTimeout(() => {
        notification.classList.add('show');
        
        // Animasi progress bar
        const progress = notification.querySelector('.notification-progress');
        progress.style.width = '100%';
        progress.style.transition = 'width 3s linear';
    }, 10);
    
    // Auto close setelah 3 detik
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ... (kode lainnya tetap sama) ...