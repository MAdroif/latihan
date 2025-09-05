window.onload = loadTransaksi;

// Set tanggal hari ini sebagai default
document.getElementById('tanggal').value = new Date().toISOString().split('T')[0];

async function loadTransaksi() {
  try {
    const res = await fetch("http://127.0.0.1:8000/transaksi");
    const data = await res.json();
    const tbody = document.getElementById("transaksiTable");
    tbody.innerHTML = "";
    
    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            <div>📝</div>
            <p>Belum ada transaksi</p>
          </td>
        </tr>
      `;
    } else {
      data.forEach(item => {
        const formattedAmount = new Intl.NumberFormat('id-ID').format(item.jumlah);
        const row = `
          <tr style="animation: slideIn 0.3s ease-out;">
            <td><input type="checkbox" value="${item.id}" onchange="updateAksiBtn()"></td>
            <td>${new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
            <td>${item.rincian}</td>
            <td class="amount ${item.tipe}">Rp ${formattedAmount}</td>
            <td><span class="type-badge ${item.tipe}">${item.tipe}</span></td>
          </tr>
        `;
        tbody.innerHTML += row;
      });
    }
  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById("transaksiTable").innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          <div>⚠️</div>
          <p>Gagal memuat data</p>
        </td>
      </tr>
    `;
  }
}
// fungsi hapus catatan
async function hapusTransaksi(id) {
  const res = await fetch(`http://127.0.0.1:8000/hapus/${id}`, {
    method: "DELETE"
  });
  const result = await res.json();
  alert(result.pesan || result.error);
  loadTransaksi(); // refresh tabel setelah hapus
}

document.getElementById("aksiBtn").addEventListener("click", async () => {
  const aksiBtn = document.getElementById("aksiBtn");
  if (aksiBtn.textContent === "Hapus Terpilih") {
    const checkboxes = document.querySelectorAll("#transaksiTable input[type='checkbox']:checked");
    for (let cb of checkboxes) {
      await hapusTransaksi(cb.value);
    }
    loadTransaksi();
    aksiBtn.textContent = "Pilih"; // reset lagi
  }
});

document.getElementById("hapusBtn").addEventListener("click", async () => {
  const checkboxes = document.querySelectorAll("#transaksiTable input[type='checkbox']:checked");
  for (let cb of checkboxes) {
    await hapusTransaksi(cb.value); // panggil backend untuk tiap id terpilih
  }
  loadTransaksi(); // refresh tabel
});

function updateAksiBtn() {
  const checkboxes = document.querySelectorAll("#transaksiTable input[type='checkbox']");
  const checked = Array.from(checkboxes).some(cb => cb.checked);
  const aksiBtn = document.getElementById("aksiBtn");
  aksiBtn.textContent = checked ? "Hapus Terpilih" : "Pilih";
}
document.getElementById("transaksiForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const submitBtn = document.querySelector('.submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Menyimpan...';
  submitBtn.disabled = true;
  
  try {
    const data = {
      tanggal: document.getElementById("tanggal").value,
      rincian: document.getElementById("rincian").value,
      jumlah: parseFloat(document.getElementById("jumlah").value),
      tipe: document.getElementById("tipe").value
    };
    
    const res = await fetch("http://127.0.0.1:8000/tambah", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    const result = await res.json();
    
    if (res.ok) {
      // Reset form
      document.getElementById("transaksiForm").reset();
      document.getElementById('tanggal').value = new Date().toISOString().split('T')[0];
      
      // Reload data
      await loadTransaksi();
      
      // Show success message
      showNotification('✅ Transaksi berhasil ditambahkan!', 'success');
    } else {
      showNotification('❌ Gagal menambahkan transaksi', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showNotification('❌ Terjadi kesalahan', 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    background: ${type === 'success' ? '#28a745' : '#dc3545'};
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
