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

// Price constants
const PRICES = {
  thit: 11000,
  banhMiMat: 6000,
  nemNuong: 7000,
  nuoc: 10000,
  banhMiThitBase: 3000
};

// State management
let lastClearedData = null;
let isDetailsVisible = false;
const APP_STATE_KEY = 'toitutinhState';

// History management for undo/redo functionality
let history = [];
let historyIndex = -1;
const MAX_HISTORY = 20;

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

  // Keyboard shortcuts for undo/redo
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
    }
  });
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
  saveToHistory(); // Save to history on input change
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

// Notification system
function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span class="notification-message">${message}</span>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Auto remove
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Export functionality
function exportData() {
  const data = {
    date: new Date().toLocaleDateString('vi-VN'),
    time: new Date().toLocaleTimeString('vi-VN',
    items: [],
    total: 0
  };
  
  const inputs = [
    { id: 'thit', name: 'Thịt', price: PRICES.thit },
    { id: 'banhMiMat', name: 'Bánh mì mật', price: PRICES.banhMiMat },
    { id: 'nemNuong', name: 'Nem nướng', price: PRICES.nemNuong },
    { id: 'nuoc', name: 'Nước', price: PRICES.nuoc },
    { id: 'banhMiThit', name: 'Bánh mì kẹp thịt', price: PRICES.banhMiThitBase }
  ];
  
  inputs.forEach(item => {
    const quantity = parseInt(document.getElementById(item.id).value) || 0;
    if (quantity > 0) {
      let itemPrice = item.price;
      if (item.id === 'banhMiThit') {
        const soThit = parseInt(soThitBanhMiInput.value) || 1;
        itemPrice = PRICES.banhMiThitBase + ((soThit - 1) * PRICES.thit);
      }
      data.items.push({
        name: item.name,
        quantity,
        price: itemPrice,
        subtotal: quantity * itemPrice
      });
      data.total += quantity * itemPrice;
    }
  });
  
  if (customerPayInput.value) {
    data.customerPaid = parseInt(customerPayInput.value.replace(/[^\d]/g, '')) || 0;
    data.change = data.customerPaid - data.total;
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hoa-don-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showNotification('📄 Đã xuất hóa đơn', 'success');
}

// Print functionality
function printReceipt() {
  const printWindow = window.open('', '_blank');
  const total = parseInt(totalDisplay.textContent.replace(/[^\d]/g, '')) || 0;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hóa đơn - ${new Date().toLocaleDateString('vi-VN')}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; }
        .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; }
        .item { display: flex; justify-content: space-between; margin: 5px 0; }
        .total { border-top: 1px solid #000; padding-top: 10px; font-weight: bold; }
        .date { text-align: center; margin-top: 10px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>TÔI TỰ TÍNH</h2>
        <p>Hóa đơn tính tiền</p>
      </div>
      <div class="items">
        ${subtotalsDiv.innerHTML}
      </div>
      <div class="total">
        <div class="item">
          <span>TỔNG TIỀN:</span>
          <span>${total.toLocaleString()}đ</span>
        </div>
        ${customerPayInput.value ? `
          <div class="item">
            <span>Khách trả:</span>
            <span>${parseInt(customerPayInput.value.replace(/[^\d]/g, '') || 0).toLocaleString()}đ</span>
          </div>
          <div class="item">
            <span>Tiền thừa:</span>
            <span>${(parseInt(customerPayInput.value.replace(/[^\d]/g, '') || 0) - total).toLocaleString()}đ</span>
          </div>
        ` : ''}
      </div>
      <div class="date">
        ${new Date().toLocaleString('vi-VN')}
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.print();
  showNotification('🖨️ Đang in hóa đơn', 'info');
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

// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'measure') {
      console.log(`${entry.name}: ${entry.duration}ms`);
    }
  }
});

if ('PerformanceObserver' in window) {
  performanceObserver.observe({ entryTypes: ['measure'] });
}

// Usage analytics (privacy-friendly)
const analytics = {
  sessions: parseInt(localStorage.getItem('sessions') || '0'),
  calculations: parseInt(localStorage.getItem('calculations') || '0'),
  features: JSON.parse(localStorage.getItem('features') || '{}')
};

function trackUsage(feature) {
  analytics.features[feature] = (analytics.features[feature] || 0) + 1;
  localStorage.setItem('features', JSON.stringify(analytics.features));
}

function trackCalculation() {
  analytics.calculations++;
  localStorage.setItem('calculations', analytics.calculations.toString());
  trackUsage('calculation');
}

// Track session
analytics.sessions++;
localStorage.setItem('sessions', analytics.sessions.toString());

// Update calculateTotal to include tracking
const originalCalculateTotal = calculateTotal;
calculateTotal = function() {
  performance.mark('calc-start');
  const result = originalCalculateTotal.apply(this, arguments);
  performance.mark('calc-end');
  performance.measure('calculation', 'calc-start', 'calc-end');
  trackCalculation();
  return result;
};

// Connection status
function updateConnectionStatus() {
  const status = navigator.onLine ? 'online' : 'offline';
  document.body.setAttribute('data-connection', status);
  
  if (!navigator.onLine) {
    showNotification('📱 Chế độ offline - Dữ liệu được lưu cục bộ', 'info', 5000);
  }
}

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
updateConnectionStatus();

// Clean up on page unload
window.addEventListener('unload', () => {
  localStorage.removeItem(APP_STATE_KEY);
});

// History management functions
function saveToHistory() {
  const currentState = {
    inputs: {
      thit: thitInput.value,
      banhMiMat: banhMiMatInput.value,
      nemNuong: nemNuongInput.value,
      nuoc: nuocInput.value,
      banhMiThit: banhMiThitInput.value,
      soThitBanhMi: soThitBanhMiInput.value,
      customerPay: customerPayInput.value
    },
    timestamp: Date.now()
  };
  
  // Remove future history if we're not at the end
  if (historyIndex < history.length - 1) {
    history = history.slice(0, historyIndex + 1);
  }
  
  // Add new state
  history.push(currentState);
  
  // Limit history size
  if (history.length > MAX_HISTORY) {
    history.shift();
  } else {
    historyIndex++;
  }
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    const state = history[historyIndex];
    restoreHistoryState(state);
    showNotification('↶ Hoàn tác', 'success');
  } else {
    showNotification('Không có gì để hoàn tác', 'info');
  }
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    const state = history[historyIndex];
    restoreHistoryState(state);
    showNotification('↷ Làm lại', 'success');
  } else {
    showNotification('Không có gì để làm lại', 'info');
  }
}

function restoreHistoryState(state) {
  // Temporarily disable history saving during restore
  const shouldSaveHistory = false;
  
  Object.entries(state.inputs).forEach(([key, value]) => {
    const input = document.getElementById(key);
    if (input) input.value = value || (key === 'soThitBanhMi' ? 1 : '');
  });
  
  calculateTotal();
}

// GitHub Analytics Integration
const GITHUB_REPO = 'username/Tinh_bill'; // Thay bằng repo của bạn

// Privacy-friendly analytics using GitHub Issues API
async function trackUsageToGitHub(action, data = {}) {
  // Chỉ track trong production và với user consent
  if (location.hostname === 'localhost' || !localStorage.getItem('analytics-consent')) {
    return;
  }
  
  const analyticsData = {
    action,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent.substring(0, 100),
    ...data
  };
  
  // Lưu local trước, sau đó có thể gửi batch
  const localAnalytics = JSON.parse(localStorage.getItem('local-analytics') || '[]');
  localAnalytics.push(analyticsData);
  
  // Giữ tối đa 50 records
  if (localAnalytics.length > 50) {
    localAnalytics.splice(0, localAnalytics.length - 50);
  }
  
  localStorage.setItem('local-analytics', JSON.stringify(localAnalytics));
}

// Feature Usage Tracking
function trackFeatureUsage(feature) {
  trackUsageToGitHub('feature_used', { feature });
  
  const features = JSON.parse(localStorage.getItem('feature-usage') || '{}');
  features[feature] = (features[feature] || 0) + 1;
  localStorage.setItem('feature-usage', JSON.stringify(features));
}

// Error Tracking
window.addEventListener('error', (error) => {
  trackUsageToGitHub('error', {
    message: error.message,
    filename: error.filename,
    line: error.lineno
  });
});

// Performance Tracking
function trackPerformance() {
  if ('performance' in window) {
    const perf = performance.getEntriesByType('navigation')[0];
    trackUsageToGitHub('performance', {
      loadTime: Math.round(perf.loadEventEnd - perf.fetchStart),
      domReady: Math.round(perf.domContentLoadedEventEnd - perf.fetchStart)
    });
  }
}

// Track on page load
window.addEventListener('load', trackPerformance);

// GitHub Issues Integration for Feedback
function createFeedbackForm() {
  const modal = document.createElement('div');
  modal.className = 'feedback-modal';
  modal.innerHTML = `
    <div class="feedback-content">
      <h3>📝 Góp ý cải tiến</h3>
      <textarea id="feedbackText" placeholder="Chia sẻ ý kiến của bạn về ứng dụng..."></textarea>
      <div class="feedback-buttons">
        <button onclick="submitFeedback()" class="btn-primary">Gửi góp ý</button>
        <button onclick="closeFeedback()" class="btn-secondary">Hủy</button>
      </div>
      <p class="feedback-note">Góp ý sẽ được gửi dưới dạng GitHub Issue</p>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
}

function submitFeedback() {
  const feedback = document.getElementById('feedbackText').value.trim();
  if (!feedback) {
    showNotification('Vui lòng nhập nội dung góp ý', 'error');
    return;
  }
  
  // Create GitHub Issue URL
  const title = `[Feedback] Góp ý từ người dùng - ${new Date().toLocaleDateString('vi-VN')}`;
  const body = `
## Góp ý từ người dùng

**Nội dung:** ${feedback}

**Thông tin kỹ thuật:**
- Thời gian: ${new Date().toLocaleString('vi-VN')}
- User Agent: ${navigator.userAgent}
- URL: ${window.location.href}
- Viewport: ${window.innerWidth}x${window.innerHeight}

---
*Góp ý được tạo tự động từ ứng dụng*
  `;
  
  const githubUrl = `https://github.com/${GITHUB_REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=feedback,user-generated`;
  
  window.open(githubUrl, '_blank');
  closeFeedback();
  showNotification('✅ Đã mở trang tạo góp ý trên GitHub', 'success');
  trackFeatureUsage('feedback_submitted');
}

function closeFeedback() {
  const modal = document.querySelector('.feedback-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  }
}
