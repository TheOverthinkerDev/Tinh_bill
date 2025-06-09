// Lấy các phần tử input và phần tử hiển thị tổng
const thitInput = document.getElementById('thit');
const banhMiMatInput = document.getElementById('banhMiMat');
const nemNuongInput = document.getElementById('nemNuong');
const nuocInput = document.getElementById('nuoc');
const banhMiThitInput = document.getElementById('banhMiThit');
const soThitBanhMiInput = document.getElementById('soThitBanhMi');
const soThitBanhMiItem = document.getElementById('soThitBanhMiItem');
const totalDisplay = document.getElementById('total');
const subtotalsDiv = document.getElementById('subtotals');
const totalContainer = document.getElementById('totalContainer');

// Giá tiền
const PRICES = {
  thit: 11000,
  banhMiMat: 6000,
  nemNuong: 7000,
  nuoc: 10000,
  banhMiThitBase: 14000
};

// Hàm tính tổng
function calculateTotal() {
  const thit = parseInt(thitInput.value) || 0;
  const banhMiMat = parseInt(banhMiMatInput.value) || 0;
  const nemNuong = parseInt(nemNuongInput.value) || 0;
  const nuoc = parseInt(nuocInput.value) || 0;
  const banhMiThit = parseInt(banhMiThitInput.value) || 0;
  const soThitBanhMi = parseInt(soThitBanhMiInput.value) || 1;

  let total = 0;
  const subtotals = [];

  const thitSubtotal = thit * PRICES.thit;
  if (thit > 0) subtotals.push({ label: 'Thịt', value: thitSubtotal });

  const banhMiMatSubtotal = banhMiMat * PRICES.banhMiMat;
  if (banhMiMat > 0) subtotals.push({ label: 'Bánh mì mật', value: banhMiMatSubtotal });

  const nemNuongSubtotal = nemNuong * PRICES.nemNuong;
  if (nemNuong > 0) subtotals.push({ label: 'Nem nướng', value: nemNuongSubtotal });

  const nuocSubtotal = nuoc * PRICES.nuoc;
  if (nuoc > 0) subtotals.push({ label: 'Nước', value: nuocSubtotal });

  const banhMiThitSubtotal = banhMiThit * (PRICES.banhMiThitBase + ((soThitBanhMi - 1) * PRICES.thit));
  if (banhMiThit > 0) {
    let label = 'Bánh mì kẹp thịt';
    if (soThitBanhMi > 1) label += ` (${soThitBanhMi} thịt/ổ)`;
    subtotals.push({ label, value: banhMiThitSubtotal });
  }

  total += thitSubtotal + banhMiMatSubtotal + nemNuongSubtotal + nuocSubtotal + banhMiThitSubtotal;

  // Hiện/ẩn phần "SỐ THỊT/Ổ" với hiệu ứng fade
  if (banhMiThit > 0) {
    soThitBanhMiItem.style.display = '';
    setTimeout(() => {
      soThitBanhMiItem.classList.add('show');
    }, 10);
  } else {
    soThitBanhMiItem.classList.remove('show');
    setTimeout(() => {
      soThitBanhMiItem.style.display = 'none';
    }, 300);
  }

  // Hiển thị tổng từng mục
  subtotalsDiv.innerHTML = subtotals.map(
    s => `<div class="subtotal-row"><span class="subtotal-label">${s.label}</span><span class="subtotal-value">${s.value.toLocaleString()}đ</span></div>`
  ).join('');

  totalDisplay.textContent = `TỔNG TIỀN: ${total.toLocaleString()} VND`;

  const hasResult = thit > 0 || banhMiMat > 0 || nemNuong > 0 || nuoc > 0 || banhMiThit > 0;

  // Hiển thị hoặc ẩn tổng tiền và gạch ngang
  if (hasResult) {
    totalContainer.style.display = '';
  } else {
    totalContainer.style.display = 'none';
  }
}

// Gắn sự kiện tự động tính khi nhập
[
  thitInput,
  banhMiMatInput,
  nemNuongInput,
  nuocInput,
  banhMiThitInput,
  soThitBanhMiInput
].forEach(input => {
  input.addEventListener('input', calculateTotal);
});

// Hàm xóa kết quả
function clearAll() {
  thitInput.value = '';
  banhMiMatInput.value = '';
  nemNuongInput.value = '';
  nuocInput.value = '';
  banhMiThitInput.value = '';
  soThitBanhMiInput.value = 1;
  totalDisplay.textContent = 'TỔNG TIỀN: 0 VND';
  soThitBanhMiItem.classList.remove('show');
  setTimeout(() => {
    soThitBanhMiItem.style.display = 'none';
  }, 300);
  subtotalsDiv.innerHTML = '';
  totalContainer.style.display = 'none';
}