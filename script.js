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
const restoreBtn = document.getElementById('restoreBtn');

// Giá tiền
const PRICES = {
  thit: 11000,
  banhMiMat: 6000,
  nemNuong: 7000,
  nuoc: 10000,
  banhMiThitBase: 14000
};

// Biến lưu trữ dữ liệu vừa xóa
let lastClearedData = null;

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
    if (soThitBanhMi > 1) label += ` (${soThitBanhMi} thịt/bánh)`;
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
  // Chặn nhập ký tự không phải số và số âm
  input.addEventListener('keydown', function (e) {
    // Cho phép phím điều hướng, backspace, delete, tab, enter
    if (
      [8, 9, 13, 27, 46, 37, 38, 39, 40].includes(e.keyCode) ||
      // Cho phép Ctrl/Cmd + A/C/V/X/Z
      ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase()))
    ) {
      return;
    }
    // Chỉ cho phép số 0-9
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  });

  // Chặn nhập số âm và tự động chuyển về số dương
  input.addEventListener('input', function () {
    if (this.value && parseInt(this.value, 10) < 0) {
      this.value = Math.abs(parseInt(this.value, 10));
    }
    // Loại bỏ ký tự không phải số nếu dán vào
    if (/\D/.test(this.value)) {
      this.value = this.value.replace(/\D/g, '');
    }
    // Giới hạn tối đa 80 cho các input trừ số thịt/bánh
    if (this !== soThitBanhMiInput && this.value) {
      let val = parseInt(this.value, 10);
      if (val > 80) this.value = "80";
    }
  });

  input.addEventListener('input', calculateTotal);

  // Chặn nhập số âm cho tất cả input
  input.addEventListener('input', function () {
    if (this.value && parseInt(this.value, 10) < 0) {
      this.value = Math.abs(parseInt(this.value, 10));
    }
  });
});

// Xử lý đặc biệt cho input "SỐ THỊT/Ổ"
soThitBanhMiInput.addEventListener('focus', function () {
  if (this.value === "1") {
    this.value = "";
  }
});
soThitBanhMiInput.addEventListener('blur', function () {
  let val = parseInt(this.value, 10);
  if (isNaN(val) || val < 1) val = 1;
  if (val > 4) val = 4;
  this.value = val;
  calculateTotal();
});
soThitBanhMiInput.addEventListener('input', function () {
  // Không cho nhập quá 1 ký tự (chỉ cho phép 1-4)
  if (this.value.length > 1) {
    this.value = this.value.slice(0, 1);
  }
  let val = parseInt(this.value, 10);
  if (val > 4) this.value = "4";
  if (val < 1 && this.value !== "") this.value = "1";
});

// Hàm xóa kết quả
function clearAll() {
  // Lưu dữ liệu trước khi xoá
  lastClearedData = {
    thit: thitInput.value,
    banhMiMat: banhMiMatInput.value,
    nemNuong: nemNuongInput.value,
    nuoc: nuocInput.value,
    banhMiThit: banhMiThitInput.value,
    soThitBanhMi: soThitBanhMiInput.value
  };

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

// Khôi phục dữ liệu vừa xoá
if (restoreBtn) {
  restoreBtn.addEventListener('click', function () {
    if (lastClearedData) {
      thitInput.value = lastClearedData.thit || '';
      banhMiMatInput.value = lastClearedData.banhMiMat || '';
      nemNuongInput.value = lastClearedData.nemNuong || '';
      nuocInput.value = lastClearedData.nuoc || '';
      banhMiThitInput.value = lastClearedData.banhMiThit || '';
      soThitBanhMiInput.value = lastClearedData.soThitBanhMi || 1;
      calculateTotal();
    }
  });
}

// Hiệu ứng ScrambleText cho footer nâng cao
document.addEventListener("DOMContentLoaded", function () {
  if (window.gsap && window.ScrambleTextPlugin) {
    gsap.registerPlugin(ScrambleTextPlugin);

    // Ẩn text gốc
    gsap.set("#scramble-text-original", { opacity: 0 });

    // ScrambleText hiệu ứng khi load xong
    const scrambleText = document.getElementById("scramble-text-original").textContent;
    const tl = gsap.timeline({ id: "text-scramble", defaults: { ease: "none" } });

    setTimeout(function () {
      tl.to("#scramble-text-1", {
        scrambleText: {
          text: scrambleText,
          chars: "upperAndLowerCase",
          revealDelay: 0.5
        },
        duration: 2
      });
    }, 2000); // chỉnh delay tại đây (ms)
  }
});