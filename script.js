document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi tab
    const dashboardTab = document.getElementById('dashboard-tab');
    const transaksiTab = document.getElementById('transaksi-tab');
    const laporanTab = document.getElementById('laporan-tab');
    const dashboardContent = document.getElementById('dashboard');
    const transaksiContent = document.getElementById('transaksi');
    const laporanContent = document.getElementById('laporan');
    
    // Set tab default
    showTab('dashboard');
    
    // Event listener untuk tab
    dashboardTab.addEventListener('click', (e) => {
        e.preventDefault();
        showTab('dashboard');
    });
    
    transaksiTab.addEventListener('click', (e) => {
        e.preventDefault();
        showTab('transaksi');
    });
    
    laporanTab.addEventListener('click', (e) => {
        e.preventDefault();
        showTab('laporan');
        loadTransaksi();
    });
    
    // Fungsi untuk menampilkan tab
    function showTab(tabName) {
        // Sembunyikan semua konten tab
        dashboardContent.classList.remove('show', 'active');
        transaksiContent.classList.remove('show', 'active');
        laporanContent.classList.remove('show', 'active');
        
        // Nonaktifkan semua tab
        dashboardTab.classList.remove('active');
        transaksiTab.classList.remove('active');
        laporanTab.classList.remove('active');
        
        // Aktifkan tab yang dipilih
        if (tabName === 'dashboard') {
            dashboardContent.classList.add('show', 'active');
            dashboardTab.classList.add('active');
            updateDashboard();
        } else if (tabName === 'transaksi') {
            transaksiContent.classList.add('show', 'active');
            transaksiTab.classList.add('active');
        } else if (tabName === 'laporan') {
            laporanContent.classList.add('show', 'active');
            laporanTab.classList.add('active');
        }
    }
    
    // Inisialisasi penyimpanan
    if (!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', JSON.stringify([]));
    }
    
    // Form tambah transaksi
    const formTransaksi = document.getElementById('form-transaksi');
    formTransaksi.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const jenis = document.getElementById('jenis').value;
        const tanggal = document.getElementById('tanggal').value;
        const jumlah = parseInt(document.getElementById('jumlah').value);
        const kategori = document.getElementById('kategori').value;
        const keterangan = document.getElementById('keterangan').value;
        
        // Validasi form
        if (!jenis || !tanggal || !jumlah || !kategori) {
            alert('Harap isi semua field yang diperlukan!');
            return;
        }
        
        // Buat objek transaksi
        const transaction = {
            id: Date.now(),
            jenis: jenis,
            tanggal: tanggal,
            jumlah: jumlah,
            kategori: kategori,
            keterangan: keterangan
        };
        
        // Simpan transaksi
        saveTransaction(transaction);
        
        // Reset form
        formTransaksi.reset();
        
        // Tampilkan notifikasi
        alert('Transaksi berhasil disimpan!');
        
        // Update dashboard
        updateDashboard();
    });
    
    // Fungsi untuk menyimpan transaksi
    function saveTransaction(transaction) {
        const transactions = JSON.parse(localStorage.getItem('transactions'));
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    
    // Fungsi untuk memuat daftar transaksi
    function loadTransaksi(filterDate = null) {
        const tbody = document.getElementById('tbody-transaksi');
        tbody.innerHTML = '';
        
        let transactions = JSON.parse(localStorage.getItem('transactions'));
        
        // Filter berdasarkan tanggal jika ada
        if (filterDate) {
            transactions = transactions.filter(trans => trans.tanggal === filterDate);
        }
        
        // Urutkan berdasarkan tanggal (terbaru pertama)
        transactions.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        
        if (transactions.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" class="text-center">Tidak ada data transaksi</td>
            `;
            tbody.appendChild(row);
            return;
        }
        
        transactions.forEach((trans, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${formatDate(trans.tanggal)}</td>
                <td><span class="badge ${trans.jenis === 'masuk' ? 'badge-masuk' : 'badge-keluar'}">${trans.jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}</span></td>
                <td>${trans.kategori}</td>
                <td>${formatCurrency(trans.jumlah)}</td>
                <td>${trans.keterangan || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-warning btn-action edit-btn" data-id="${trans.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action delete-btn" data-id="${trans.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Tambahkan event listener untuk tombol edit dan hapus
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                editTransaction(id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                showDeleteModal(id);
            });
        });
    }
    
    // Fungsi untuk mengedit transaksi
    function editTransaction(id) {
        const transactions = JSON.parse(localStorage.getItem('transactions'));
        const transaction = transactions.find(trans => trans.id === id);
        
        if (!transaction) {
            alert('Transaksi tidak ditemukan!');
            return;
        }
        
        // Isi form edit
        document.getElementById('edit-id').value = transaction.id;
        document.getElementById('edit-jenis').value = transaction.jenis;
        document.getElementById('edit-tanggal').value = transaction.tanggal;
        document.getElementById('edit-jumlah').value = transaction.jumlah;
        document.getElementById('edit-kategori').value = transaction.kategori;
        document.getElementById('edit-keterangan').value = transaction.keterangan || '';
        
        // Tampilkan modal
        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        editModal.show();
    }
    
    // Event listener untuk simpan edit
    document.getElementById('save-edit-btn').addEventListener('click', function() {
        const id = parseInt(document.getElementById('edit-id').value);
        const jenis = document.getElementById('edit-jenis').value;
        const tanggal = document.getElementById('edit-tanggal').value;
        const jumlah = parseInt(document.getElementById('edit-jumlah').value);
        const kategori = document.getElementById('edit-kategori').value;
        const keterangan = document.getElementById('edit-keterangan').value;
        
        // Validasi form
        if (!jenis || !tanggal || !jumlah || !kategori) {
            alert('Harap isi semua field yang diperlukan!');
            return;
        }
        
        // Update transaksi
        const transactions = JSON.parse(localStorage.getItem('transactions'));
        const index = transactions.findIndex(trans => trans.id === id);
        
        if (index === -1) {
            alert('Transaksi tidak ditemukan!');
            return;
        }
        
        transactions[index] = {
            id: id,
            jenis: jenis,
            tanggal: tanggal,
            jumlah: jumlah,
            kategori: kategori,
            keterangan: keterangan
        };
        
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Tutup modal
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        editModal.hide();
        
        // Update tampilan
        loadTransaksi();
        updateDashboard();
        
        // Tampilkan notifikasi
        alert('Transaksi berhasil diperbarui!');
    });
    
    // Fungsi untuk menampilkan modal hapus
    function showDeleteModal(id) {
        document.getElementById('confirm-delete-btn').setAttribute('data-id', id);
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        deleteModal.show();
    }
    
    // Event listener untuk konfirmasi hapus
    document.getElementById('confirm-delete-btn').addEventListener('click', function() {
        const id = parseInt(this.getAttribute('data-id'));
        
        // Hapus transaksi
        const transactions = JSON.parse(localStorage.getItem('transactions'));
        const filteredTransactions = transactions.filter(trans => trans.id !== id);
        
        localStorage.setItem('transactions', JSON.stringify(filteredTransactions));
        
        // Tutup modal
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        deleteModal.hide();
        
        // Update tampilan
        loadTransaksi();
        updateDashboard();
        
        // Tampilkan notifikasi
        alert('Transaksi berhasil dihapus!');
    });
    
    // Filter transaksi berdasarkan tanggal
    document.getElementById('filter-btn').addEventListener('click', function() {
        const filterDate = document.getElementById('filter-tanggal').value;
        
        if (!filterDate) {
            alert('Harap pilih tanggal untuk filter!');
            return;
        }
        
        loadTransaksi(filterDate);
    });
    
    // Reset filter
    document.getElementById('reset-filter-btn').addEventListener('click', function() {
        document.getElementById('filter-tanggal').value = '';
        loadTransaksi();
    });
    
    // Fungsi untuk update dashboard
    function updateDashboard() {
        const transactions = JSON.parse(localStorage.getItem('transactions'));
        const today = new Date().toISOString().split('T')[0];
        
        // Hitung saldo kas
        let saldo = 0;
        transactions.forEach(trans => {
            if (trans.jenis === 'masuk') {
                saldo += trans.jumlah;
            } else {
                saldo -= trans.jumlah;
            }
        });
        
        // Hitung pemasukan hari ini
        const pemasukanHariIni = transactions
            .filter(trans => trans.tanggal === today && trans.jenis === 'masuk')
            .reduce((total, trans) => total + trans.jumlah, 0);
        
        // Hitung pengeluaran hari ini
        const pengeluaranHariIni = transactions
            .filter(trans => trans.tanggal === today && trans.jenis === 'keluar')
            .reduce((total, trans) => total + trans.jumlah, 0);
        
        // Update tampilan
        document.getElementById('saldo-kas').textContent = formatCurrency(saldo);
        document.getElementById('pemasukan-hari-ini').textContent = formatCurrency(pemasukanHariIni);
        document.getElementById('pengeluaran-hari-ini').textContent = formatCurrency(pengeluaranHariIni);
        document.getElementById('total-transaksi').textContent = transactions.length;
    }
    
    // Ekspor ke Excel
    document.getElementById('export-excel').addEventListener('click', function() {
        const transactions = JSON.parse(localStorage.getItem('transactions'));
        
        if (transactions.length === 0) {
            alert('Tidak ada data transaksi untuk diekspor!');
            return;
        }
        
        // Format data untuk Excel
        const data = [
            ['No', 'Tanggal', 'Jenis', 'Kategori', 'Jumlah', 'Keterangan'],
            ...transactions.map((trans, index) => [
                index + 1,
                formatDate(trans.tanggal),
                trans.jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
                trans.kategori,
                trans.jumlah,
                trans.keterangan || '-'
            ])
        ];
        
        // Buat workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
        
        // Ekspor ke file
        const date = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `Laporan_Transaksi_${date}.xlsx`);
    });
    
    // Fungsi untuk memformat tanggal
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }
    
    // Fungsi untuk memformat mata uang
    function formatCurrency(amount) {
        return 'Rp' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    // Set tanggal default ke hari ini
    document.getElementById('tanggal').value = new Date().toISOString().split('T')[0];
    document.getElementById('edit-tanggal').value = new Date().toISOString().split('T')[0];
    
    // Inisialisasi dashboard
    updateDashboard();
});