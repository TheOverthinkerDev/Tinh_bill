// Lấy các phần tử input và phần tử hiển thị tổng
const thitInput = document.getElementById('thit');
const banhMiInput = document.getElementById('banhMi');
const nemNuongInput = document.getElementById('nemNuong');
const nuocInput = document.getElementById('nuoc');
const banhMiThitInput = document.getElementById('banhMiThit');
const soThitBanhMiInput = document.getElementById('soThitBanhMi');
const totalDisplay = document.getElementById('total');

// Giá tiền
const PRICES = {
  thit: 11000,
  banhMi: 6000,
  nemNuong: 7000,
  nuoc: 10000,
  banhMiThitBase: 14000
};

// Hàm tính tổng
function calculateTotal() {
  const thit = parseInt(thitInput.value) || 0;
  const banhMi = parseInt(banhMiInput.value) || 0;
  const nemNuong = parseInt(nemNuongInput.value) || 0;
  const nuoc = parseInt(nuocInput.value) || 0;
  const banhMiThit = parseInt(banhMiThitInput.value) || 0;
  const soThitBanhMi = parseInt(soThitBanhMiInput.value) || 1;

  let total = 0;
  total += thit * PRICES.thit;
  total += banhMi * PRICES.banhMi;
  total += nemNuong * PRICES.nemNuong;
  total += nuoc * PRICES.nuoc;

  total += banhMiThit * (PRICES.banhMiThitBase + ((soThitBanhMi - 1) * PRICES.thit));

  totalDisplay.textContent = `TỔNG: ${total.toLocaleString()} VND`;
}

// Gắn sự kiện tự động tính khi nhập
[
  thitInput,
  banhMiInput,
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
  banhMiInput.value = '';
  nemNuongInput.value = '';
  nuocInput.value = '';
  banhMiThitInput.value = '';
  soThitBanhMiInput.value = 1;
  totalDisplay.textContent = 'TỔNG: 0 VND';
}