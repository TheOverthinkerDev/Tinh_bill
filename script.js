// Lấy các phần tử input và phần tử hiển thị tổng
const thitInput = document.getElementById('thit');
const banhMiMatInput = document.getElementById('banhMiMat');
const nemNuongInput = document.getElementById('nemNuong');
const nuocInput = document.getElementById('nuoc');
const banhMiThitInput = document.getElementById('banhMiThit');
const soThitBanhMiInput = document.getElementById('soThitBanhMi');
const soThitBanhMiItem = document.getElementById('soThitBanhMiItem');
const totalDisplay = document.getElementById('total');

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
  total += thit * PRICES.thit;
  total += banhMiMat * PRICES.banhMiMat;
  total += nemNuong * PRICES.nemNuong;
  total += nuoc * PRICES.nuoc;

  total += banhMiThit * (PRICES.banhMiThitBase + ((soThitBanhMi - 1) * PRICES.thit));

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

  totalDisplay.textContent = `TỔNG: ${total.toLocaleString()} VND`;
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
  totalDisplay.textContent = 'TỔNG: 0 VND';
  soThitBanhMiItem.classList.remove('show');
  setTimeout(() => {
    soThitBanhMiItem.style.display = 'none';
  }, 300);
}