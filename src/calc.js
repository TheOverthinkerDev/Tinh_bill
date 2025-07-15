const PRICES = {
  thit: 11000,
  banhMiMat: 6000,
  nemNuong: 7000,
  nuoc: 10000,
  banhMiThitBase: 3000
};

function calculateTotals({
  thit = 0,
  banhMiMat = 0,
  nemNuong = 0,
  nuoc = 0,
  banhMiThit = 0,
  soThitBanhMi = 1
} = {}) {
  const thitSubtotal = thit * PRICES.thit;
  const banhMiMatSubtotal = banhMiMat * PRICES.banhMiMat;
  const nemNuongSubtotal = nemNuong * PRICES.nemNuong;
  const nuocSubtotal = nuoc * PRICES.nuoc;
  const banhMiThitSubtotal = banhMiThit * (PRICES.banhMiThitBase + (soThitBanhMi * PRICES.thit));

  const subtotals = [];
  if (thit > 0) subtotals.push({ label: 'Thịt', value: thitSubtotal });
  if (banhMiMat > 0) subtotals.push({ label: 'Bánh mì mật', value: banhMiMatSubtotal });
  if (nemNuong > 0) subtotals.push({ label: 'Nem nướng', value: nemNuongSubtotal });
  if (nuoc > 0) subtotals.push({ label: 'Nước', value: nuocSubtotal });
  if (banhMiThit > 0) {
    let label = 'Bánh mì kẹp thịt';
    if (soThitBanhMi > 1) label += ` (${soThitBanhMi} thịt/bánh)`;
    subtotals.push({ label, value: banhMiThitSubtotal });
  }

  const total = thitSubtotal + banhMiMatSubtotal + nemNuongSubtotal + nuocSubtotal + banhMiThitSubtotal;
  return { total, subtotals };
}

if (typeof module !== 'undefined') {
  module.exports = { PRICES, calculateTotals };
} else {
  // expose globally for browser usage
  window.PRICES = PRICES;
  window.calculateTotals = calculateTotals;
}
