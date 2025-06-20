// DOM Elements
const thitInput = document.getElementById('thit');
const banhMiMatInput = document.getElementById('banhMiMat');
const nemNuongInput = document.getElementById('nemNuong');
const nuocInput = document.getElementById('nuoc');
const banhMiThitInput = document.getElementById('banhMiThit');
const soThitBanhMiInput = document.getElementById('soThitBanhMi');
const soThitBanhMiItem = document.getElementById('soThitBanhMiItem');
const totalDisplay = document.getElementById('total');
const totalContainer = document.getElementById('totalContainer');
const subtotalsDiv = document.getElementById('subtotals');
const restoreBtn = document.getElementById('restoreBtn');
const themeSwitcher = document.getElementById('themeSwitcher');
const themeColor = document.getElementById('theme-color');
const customerPayInput = document.getElementById('customerPay');
const changeDisplay = document.getElementById('change');

// Price constants are provided by calc.js

// State management
let lastClearedData = null;
let isDetailsVisible = false;
const APP_STATE_KEY = 'toitutinhState';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  loadSavedTheme();
  initEventListeners();
  loadState();
  initScrambleText();
  initializeCustomerPaymentVisibility(); // Ensure customer payment starts hidden
});

// Theme management
function loadSavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeColor.content = savedTheme === 'dark' ? '#111' : '#ffffff';
  updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
  const icon = themeSwitcher.querySelector('i');
  icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Event listeners
function initEventListeners() {
  // Theme switcher
  themeSwitcher.addEventListener('click', toggleTheme);
  
  // Input validation and calculation
  [thitInput, banhMiMatInput, nemNuongInput, nuocInput, banhMiThitInput, soThitBanhMiInput]
    .forEach(input => {
      input.addEventListener('input', handleInputChange);
      input.addEventListener('keydown', validateNumberInput);
    });

  // Special handling for soThitBanhMi
  soThitBanhMiInput.addEventListener('focus', handleSoThitFocus);
  soThitBanhMiInput.addEventListener('blur', handleSoThitBlur);
  soThitBanhMiInput.addEventListener('input', handleSoThitInput);

  // Total display click
  if (totalDisplay) {
    totalDisplay.addEventListener('click', toggleDetails);
  }

  // Restore button
  if (restoreBtn) {
    restoreBtn.addEventListener('click', restoreLastCleared);
  }

  // Customer payment
  if (customerPayInput) {
    customerPayInput.addEventListener('input', handleCustomerPayment);
  }

  // Auto-save
  window.addEventListener('beforeunload', saveState);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeColor.content = newTheme === 'dark' ? '#111' : '#ffffff';
  updateThemeIcon(newTheme);
}

function handleInputChange(e) {
  validateInput(e.target);
  calculateTotal();
  saveState();
}

function validateNumberInput(e) {
  // Allow navigation keys, backspace, delete, tab, enter
  if ([8, 9, 13, 27, 46, 37, 38, 39, 40].includes(e.keyCode) ||
      // Allow Ctrl/Cmd + A/C/V/X/Z
      ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase()))) {
    return;
  }
  // Only allow numbers 0-9
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
}

function validateInput(input) {
  // Remove non-numeric characters
  input.value = input.value.replace(/\D/g, '');
  
  // Convert negative to positive
  if (input.value && parseInt(input.value) < 0) {
    input.value = Math.abs(parseInt(input.value));
  }
  
  // Limit max value (except for soThitBanhMi)
  if (input !== soThitBanhMiInput && input.value) {
    const val = parseInt(input.value);
    if (val > 80) input.value = "80";
  }
}

function handleSoThitFocus() {
  if (this.value === "1") {
    this.value = "";
  }
}

function handleSoThitBlur() {
  let val = parseInt(this.value) || 1;
  if (val < 1) val = 1;
  if (val > 4) val = 4;
  this.value = val;
  calculateTotal();
}

function handleSoThitInput() {
  if (this.value.length > 1) {
    this.value = this.value.slice(0, 1);
  }
  let val = parseInt(this.value);
  if (val > 4) this.value = "4";
  if (val < 1 && this.value !== "") this.value = "1";
}

// Main calculation function
function calculateTotal() {
  const thit = parseInt(thitInput.value) || 0;
  const banhMiMat = parseInt(banhMiMatInput.value) || 0;
  const nemNuong = parseInt(nemNuongInput.value) || 0;
  const nuoc = parseInt(nuocInput.value) || 0;
  const banhMiThit = parseInt(banhMiThitInput.value) || 0;
  const soThitBanhMi = parseInt(soThitBanhMiInput.value) || 1;

  let total = 0;
  const subtotals = [];

  // Calculate individual totals
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

  // Show/hide soThitBanhMi section
  if (banhMiThit > 0) {
    soThitBanhMiItem.style.display = '';
    setTimeout(() => soThitBanhMiItem.classList.add('show'), 10);
  } else {
    soThitBanhMiItem.classList.remove('show');
    setTimeout(() => soThitBanhMiItem.style.display = 'none', 300);
  }

  // Update subtotals display
  subtotalsDiv.innerHTML = subtotals.map(
    s => `<div class="subtotal-row">
      <span class="subtotal-label">${s.label}</span>
      <span class="subtotal-value">${s.value.toLocaleString()}đ</span>
    </div>`
  ).join('');

  // Update total display
  totalDisplay.textContent = `TỔNG TIỀN: ${total.toLocaleString()} VND`;
  // Show/hide total container
  if (total > 0) {
    totalContainer.style.display = '';
    // Don't reset isDetailsVisible or hide sections - let user control visibility
  } else {
    totalContainer.style.display = 'none';
    isDetailsVisible = false;
    document.querySelector('.change-calculator').classList.remove('show');
    subtotalsDiv.classList.remove('show');
  }

  // Recalculate change if customer payment exists
  if (customerPayInput.value) {
    calculateChange();
  }
}

// Customer payment handling
function handleCustomerPayment(e) {
  let value = this.value.replace(/[^\d]/g, '');
  
  if (value) {
    this.value = parseInt(value).toLocaleString('vi-VN');
    
    // Generate suggestions for 1-3 digit numbers
    if (value.length <= 3) {
      const num = parseInt(value);
      let suggestions = [];
      
      if (value.length === 1) {
        suggestions = [num * 1000, num * 10000, num * 100000];
      } else if (value.length === 2) {
        suggestions = [num * 1000, num * 10000];
      } else if (value.length === 3) {
        suggestions = [num * 1000];
      }
      
      document.getElementById('amountSuggestions').innerHTML = suggestions
        .map(s => `<button class="suggestion-btn" onclick="applySuggestion(${s})">${s.toLocaleString('vi-VN')}đ</button>`)
        .join('');
    } else {
      document.getElementById('amountSuggestions').innerHTML = '';
    }
    
    calculateChange();
  } else {
    this.value = '';
    changeDisplay.textContent = '';
    document.getElementById('amountSuggestions').innerHTML = '';
  }
}

function applySuggestion(amount) {
  customerPayInput.value = amount.toLocaleString('vi-VN');
  calculateChange();
  document.getElementById('amountSuggestions').innerHTML = '';
}

function calculateChange() {
  const totalAmount = parseInt(totalDisplay.textContent.replace(/[^\d]/g, '')) || 0;
  const customerAmount = parseInt(customerPayInput.value.replace(/[^\d]/g, '')) || 0;
  const change = customerAmount - totalAmount;

  if (change > 0) {
    changeDisplay.textContent = `Tiền thừa: ${change.toLocaleString('vi-VN')}đ`;
    changeDisplay.className = 'change-amount positive';
  } else if (change < 0) {
    changeDisplay.textContent = `Thiếu: ${Math.abs(change).toLocaleString('vi-VN')}đ`;
    changeDisplay.className = 'change-amount negative';
  } else if (change === 0 && customerAmount > 0) {
    changeDisplay.textContent = 'Trả đủ';
    changeDisplay.className = 'change-amount';
  } else {
    changeDisplay.textContent = '';
    changeDisplay.className = 'change-amount';
  }
}

// UI interactions
function toggleDetails() {
  isDetailsVisible = !isDetailsVisible;
  const calculator = document.querySelector('.change-calculator');
  
  if (isDetailsVisible) {
    subtotalsDiv.classList.add('show');
    calculator.classList.add('show');
  } else {
    subtotalsDiv.classList.remove('show');
    calculator.classList.remove('show');
  }
}

function clearAll() {
  // Save current data before clearing
  lastClearedData = {
    thit: thitInput.value,
    banhMiMat: banhMiMatInput.value,
    nemNuong: nemNuongInput.value,
    nuoc: nuocInput.value,
    banhMiThit: banhMiThitInput.value,
    soThitBanhMi: soThitBanhMiInput.value,
    customerPay: customerPayInput.value
  };

  // Clear all inputs
  [thitInput, banhMiMatInput, nemNuongInput, nuocInput, banhMiThitInput].forEach(input => {
    input.value = '';
  });
  soThitBanhMiInput.value = 1;
  customerPayInput.value = '';
  // Reset UI
  isDetailsVisible = false;
  const calculator = document.querySelector('.change-calculator');
  calculator.classList.remove('show');
  subtotalsDiv.classList.remove('show');
  subtotalsDiv.innerHTML = '';
  changeDisplay.textContent = '';
  document.getElementById('amountSuggestions').innerHTML = '';
  totalContainer.style.display = 'none';
  totalDisplay.textContent = 'TỔNG TIỀN: 0 VND';

  // Haptic feedback
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
}

function restoreLastCleared() {
  if (lastClearedData) {
    Object.entries(lastClearedData).forEach(([key, value]) => {
      const input = document.getElementById(key);
      if (input) input.value = value || (key === 'soThitBanhMi' ? 1 : '');
    });
    calculateTotal();
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  }
}

// State persistence
function saveState() {
  const state = {
    inputs: {
      thit: thitInput.value,
      banhMiMat: banhMiMatInput.value,
      nemNuong: nemNuongInput.value,
      nuoc: nuocInput.value,
      banhMiThit: banhMiThitInput.value,
      soThitBanhMi: soThitBanhMiInput.value,
      customerPay: customerPayInput.value
    },
    lastCleared: lastClearedData
  };
  localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
}

function loadState() {
  const savedState = localStorage.getItem(APP_STATE_KEY);
  if (savedState) {
    try {
      const state = JSON.parse(savedState);
      const hasData = Object.values(state.inputs).some(value => value && value !== '1');
      
      if (hasData) {
        Object.entries(state.inputs).forEach(([key, value]) => {
          const input = document.getElementById(key);
          if (input && value) input.value = value;
        });
        lastClearedData = state.lastCleared;
        calculateTotal();
        // Ensure customer payment section starts hidden even after loading state
        const calculator = document.querySelector('.change-calculator');
        if (calculator) {
          calculator.classList.remove('show');
        }
        isDetailsVisible = false;
      }
    } catch (e) {
      console.error('Error loading state:', e);
      localStorage.removeItem(APP_STATE_KEY);
    }
  }
}

// GSAP Scramble Text Effect
function initScrambleText() {
  if (window.gsap && window.ScrambleTextPlugin) {
    gsap.registerPlugin(ScrambleTextPlugin);
    
    setTimeout(() => {
      const originalText = document.getElementById('scramble-text-original').textContent;
      gsap.to("#scramble-text-1", {
        duration: 2,
        scrambleText: {
          text: originalText,
          chars: "upperAndLowerCase",
          revealDelay: 0.5
        },
        ease: "power2.out"
      });
    }, 1000);
  }
}

// Initialize customer payment visibility
function initializeCustomerPaymentVisibility() {
  const calculator = document.querySelector('.change-calculator');
  if (calculator) {
    calculator.classList.remove('show'); // Ensure it starts hidden
  }
}

// Clean up on page unload
// Previously this removed the saved state, which prevented session persistence.
// Removing the localStorage.clear ensures the bill data remains after reloads.
window.addEventListener('unload', () => {
  saveState();
});

