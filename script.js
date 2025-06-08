const prices = {
  thit: 11000,
  banhmi: 6000,
  nemnuong: 7000,
  nuoc: 10000
};

const inputs = document.querySelectorAll('input[type="number"]');
const totalSpan = document.getElementById('total');
const clearBtn = document.getElementById('clearBtn');

function calculateTotal() {
  let total = 0;
  inputs.forEach(input => {
    const quantity = parseInt(input.value) || 0;
    total += quantity * prices[input.id];
  });
  totalSpan.textContent = total.toLocaleString('vi-VN');
}

inputs.forEach(input => {
  input.addEventListener('input', calculateTotal);
});

clearBtn.addEventListener('click', () => {
  inputs.forEach(input => input.value = 0);
  totalSpan.textContent = '0';
});