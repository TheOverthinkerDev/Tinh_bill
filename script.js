const prices = {
  thit: 11000,
  banhmi: 6000,
  nemnuong: 7000,
  nuoc: 10000,
  banhmiThit: 14000  // Giá cơ bản cho bánh mì kẹp thịt (đã bao gồm 1 miếng thịt)
};

const inputs = document.querySelectorAll('input[type="number"]');
const totalSpan = document.getElementById('total');
const clearBtn = document.getElementById('clearBtn');

function calculateTotal() {
  let total = 0;

  // Tính các mục cơ bản
  total += (parseInt(document.getElementById('thit').value) || 0) * prices.thit;
  total += (parseInt(document.getElementById('banhmi').value) || 0) * prices.banhmi;
  total += (parseInt(document.getElementById('nemnuong').value) || 0) * prices.nemnuong;
  total += (parseInt(document.getElementById('nuoc').value) || 0) * prices.nuoc;

  // Tính bánh mì kẹp thịt
  const soLuongBanh = parseInt(document.getElementById('banhmiThit').value) || 0;
  const thitTrongBanh = parseInt(document.getElementById('thitTrongBanh').value) || 1;
  if (soLuongBanh > 0) {
    // Giá bánh mì kẹp thịt: 14k cho 1 ổ + (số thịt thêm - 1) * 11k
    const giaMotBanh = prices.banhmiThit + ((thitTrongBanh - 1) * prices.thit);
    total += soLuongBanh * giaMotBanh;
  }

  totalSpan.textContent = total.toLocaleString('vi-VN');
}

inputs.forEach(input => {
  input.addEventListener('input', calculateTotal);
});

clearBtn.addEventListener('click', () => {
  inputs.forEach(input => input.value = input.id === 'thitTrongBanh' ? 1 : 0);
  totalSpan.textContent = '0';
});