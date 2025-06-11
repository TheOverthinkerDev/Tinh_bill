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

// Add loading state animation thay vì 21000
function setLoading(element, isLoading) {
  if (isLoading) {
    element.classList.add('loading');
  } else {
    element.classList.remove('loading');
  }
}

// Sửa lại hàm calculateTotal để hoạt động với cả async và sync
async function calculateTotal(skipAnimation = false) {
  if (!skipAnimation) {
    setLoading(totalDisplay, true);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  const thit = parseInt(thitInput.value) || 0;
  const banhMiMat = parseInt(banhMiMatInput.value) || 0;
  const nemNuong = parseInt(nemNuongInput.value) || 0;
  const nuoc = parseInt(nuocInput.value) || 0;
  const banhMiThit = parseInt(banhMiThitInput.value) || 0;
  const soThitBanhMi = parseInt(soThitBanhMiInput.value) || 1;

  let total = 0;
  const subtotals = [];

  // Calculate subtotals
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

  total = thitSubtotal + banhMiMatSubtotal + nemNuongSubtotal + nuocSubtotal + banhMiThitSubtotal;

  // Handle UI updates
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

  // Update subtotals with animation
  subtotalsDiv.innerHTML = subtotals.map(
    (s, i) => `<div class="subtotal-row" style="animation-delay: ${skipAnimation ? 0 : i * 0.1}s">
      <span class="subtotal-label">${s.label}</span>
      <span class="subtotal-value">${s.value.toLocaleString()}đ</span>
    </div>`
  ).join('');

  // Update total with animation
  const oldTotal = totalDisplay.textContent.replace(/[^0-9]/g, '');
  const newTotal = total.toLocaleString();
  
  if (oldTotal !== newTotal && !skipAnimation) {
    totalDisplay.classList.add('updating');
    totalDisplay.textContent = `TỔNG TIỀN: ${newTotal} VND`;
    await new Promise(resolve => setTimeout(resolve, 50));
    totalDisplay.classList.remove('updating');
  } else {
    totalDisplay.textContent = `TỔNG TIỀN: ${newTotal} VND`;
  }

  if (!skipAnimation) {
    setLoading(totalDisplay, false);
  }

  // Show/hide total container
  totalContainer.style.display = total > 0 ? '' : 'none';
}

// Gộp các event listener input
[thitInput, banhMiMatInput, nemNuongInput, nuocInput, banhMiThitInput, soThitBanhMiInput].forEach(input => {
  input.addEventListener('input', function(e) {
    // Validate và clean input
    if (this.value && parseInt(this.value, 10) < 0) {
      this.value = Math.abs(parseInt(this.value, 10));
    }
    if (/\D/.test(this.value)) {
      this.value = this.value.replace(/\D/g, '');
    }
    // Giới hạn max value
    if (this !== soThitBanhMiInput && this.value) {
      let val = parseInt(this.value, 10);
      if (val > 80) this.value = "80";
    }
    // Tính toán
    calculateTotal(true); // Skip animation khi nhập liệu
  });
  // Chặn nhập ký tự không phải số
  input.addEventListener('keydown', function(e) {
    if ([8,9,13,27,46,37,38,39,40].includes(e.keyCode) || 
        ((e.ctrlKey || e.metaKey) && ['a','c','v','x','z'].includes(e.key.toLowerCase()))) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault(); 
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
});
soThitBanhMiInput.addEventListener('input', function () {
  // Không cho nhập quá 1 ký tự (chỉ cho phép 1-4)
  if (this.value.length > 1) {
    this.value = this.value.slice(0, 1);
  }
  let val = parseInt(this.value, 10);
  if (val > 4) this.value = "4";
  if (val < 1 && this.value !== "") this.value = "1";
  calculateTotal(true);
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
  subtotalsDiv.classList.remove('show');
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

// Thêm transition cho subtotals
if (totalDisplay && subtotalsDiv) {
  totalDisplay.addEventListener('click', function() {
    subtotalsDiv.classList.toggle('show');
  });
}

// Hiệu ứng ScrambleText cho footer nâng cao
document.addEventListener("DOMContentLoaded", function () {
  if (window.gsap && window.ScrambleTextPlugin) {
    gsap.registerPlugin(ScrambleTextPlugin);
    const scrambleText = document.getElementById("scramble-text-original").textContent;
    const tl = gsap.timeline({ id: "text-scramble", defaults: { ease: "none" } });
    tl.to("#scramble-text-1", {
      scrambleText: {
        text: scrambleText,
        chars: "upperAndLowerCase",
        revealDelay: 0.5
      },
      duration: 2
    });
  }
});

// Dark mode & localStorage handling
const themeSwitcher = document.getElementById('themeSwitcher');
const themeColor = document.getElementById('theme-color');
const APP_STATE_KEY = 'toitutinhState';

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeColor.content = savedTheme === 'dark' ? '#1a1a1a' : '#ffffff';

// Theme switcher
themeSwitcher.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeColor.content = newTheme === 'dark' ? '#1a1a1a' : '#ffffff';
  themeSwitcher.innerHTML = `<i class="fas fa-${newTheme === 'dark' ? 'sun' : 'moon'}"></i>`;
});

// Save state to localStorage
function saveState() {
  const state = {
    inputs: {
      thit: thitInput.value,
      banhMiMat: banhMiMatInput.value,
      nemNuong: nemNuongInput.value,
      nuoc: nuocInput.value,
      banhMiThit: banhMiThitInput.value,
      soThitBanhMi: soThitBanhMiInput.value
    },
    lastCleared: lastClearedData
  };
  localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
}

// Load state from localStorage
function loadState() {
  const savedState = localStorage.getItem(APP_STATE_KEY);
  if (savedState) {
    try {
      const state = JSON.parse(savedState);
      // Kiểm tra xem state có dữ liệu không
      const hasData = Object.values(state.inputs).some(value => value && value !== '1');
      if (hasData) {
        Object.entries(state.inputs).forEach(([key, value]) => {
          const input = document.getElementById(key);
          if (input) input.value = value;
        });
        lastClearedData = state.lastCleared;
        calculateTotal();
      } else {
        // Xóa state nếu không có dữ liệu
        localStorage.removeItem(APP_STATE_KEY);
      }
    } catch (e) {
      console.error('Error loading state:', e);
      localStorage.removeItem(APP_STATE_KEY);
    }
  }
}

// Clear localStorage khi đóng tab
window.addEventListener('unload', () => {
  localStorage.removeItem(APP_STATE_KEY);
});

// Mobile optimizations
function initMobileOptimizations() {
  // Haptic feedback
  const hapticElements = document.querySelectorAll('.haptic');
  hapticElements.forEach(el => {
    el.addEventListener('click', () => {
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    });
  });

  // Swipe to restore
  if (window.interact) {
    interact('.touch-container')
      .draggable({
        enabled: true,
        modifiers: [
          interact.modifiers.restrict({
            restriction: 'self'
          })
        ],
        onmove: event => {
          const target = event.target;
          const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
          if (x < -50) {
            // Trigger restore
            if (lastClearedData) {
              restoreBtn.click();
            }
            target.setAttribute('data-x', '0');
          }
        }
      });
  }

  // Auto keyboard focus
  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('touchstart', () => {
      requestAnimationFrame(() => input.focus());
    });
  });

  // Prevent bounce scroll
  document.body.addEventListener('touchmove', e => {
    if (e.target.closest('.touch-container')) return;
    e.preventDefault();
  }, { passive: false });
}

// Initialize mobile optimizations on load
if ('ontouchstart' in window) {
  document.addEventListener('DOMContentLoaded', initMobileOptimizations);
}

// Auto save on input
[thitInput, banhMiMatInput, nemNuongInput, nuocInput, banhMiThitInput, soThitBanhMiInput]
  .forEach(input => {
    input.addEventListener('input', () => {
      saveState();
    });
  });

// Load saved state when page loads
document.addEventListener('DOMContentLoaded', loadState);

// Fix lỗi tính toán bị duplicate và logic sai
async function calculateTotal(skipAnimation = false) {
  if (!skipAnimation) {
    setLoading(totalDisplay, true);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  const thit = parseInt(thitInput.value) || 0;
  const banhMiMat = parseInt(banhMiMatInput.value) || 0;
  const nemNuong = parseInt(nemNuongInput.value) || 0;
  const nuoc = parseInt(nuocInput.value) || 0;
  const banhMiThit = parseInt(banhMiThitInput.value) || 0;
  const soThitBanhMi = parseInt(soThitBanhMiInput.value) || 1;

  let total = 0;
  const subtotals = [];

  // Calculate subtotals
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

  total = thitSubtotal + banhMiMatSubtotal + nemNuongSubtotal + nuocSubtotal + banhMiThitSubtotal;

  // Handle UI updates
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

  // Update subtotals with animation
  subtotalsDiv.innerHTML = subtotals.map(
    (s, i) => `<div class="subtotal-row" style="animation-delay: ${skipAnimation ? 0 : i * 0.1}s">
      <span class="subtotal-label">${s.label}</span>
      <span class="subtotal-value">${s.value.toLocaleString()}đ</span>
    </div>`
  ).join('');

  // Update total with animation
  const oldTotal = totalDisplay.textContent.replace(/[^0-9]/g, '');
  const newTotal = total.toLocaleString();
  
  if (oldTotal !== newTotal && !skipAnimation) {
    totalDisplay.classList.add('updating');
    totalDisplay.textContent = `TỔNG TIỀN: ${newTotal} VND`;
    await new Promise(resolve => setTimeout(resolve, 50));
    totalDisplay.classList.remove('updating');
  } else {
    totalDisplay.textContent = `TỔNG TIỀN: ${newTotal} VND`;
  }

  if (!skipAnimation) {
    setLoading(totalDisplay, false);
  }

  // Show/hide total container
  totalContainer.style.display = total > 0 ? '' : 'none';
}

// Fix event listener cho share button không tồn tại
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
  shareBtn.addEventListener('click', () => {
    const text = `Tổng tiền: ${totalDisplay.textContent}\n${subtotalsDiv.textContent}`;
    if (navigator.share) {
      navigator.share({
        title: 'Hóa đơn từ Tôi Tự Tính',
        text: text
      });
    }
  });
}