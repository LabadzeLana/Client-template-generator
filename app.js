(() => {
  const $ = (s) => document.querySelector(s);
  const state = { currency: 'GEL' };
  const SYM = { GEL: '₾', USD: '$' };

  const DEFAULTS = {
    client: 'კლიენტი ორგანიზაცია',
    desc: 'გთავაზობთ GeoLab-ის პროგრამას „The art of using AI“ თქვენი გუნდისთვის — პრაქტიკულ სწავლებას, რომელიც დაგეხმარებათ ხელოვნური ინტელექტის ინსტრუმენტების ყოველდღიურ საქმიანობაში ეფექტურად გამოყენებაში.',
    items: [
      { name: 'AI საფუძვლები — ჯგუფური კურსი', qty: 10, price: 350 },
      { name: 'პრაქტიკული ვორქშოპი', qty: 2, price: 600 },
    ],
  };

  const fmt = (n) => {
    const s = (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return state.currency === 'GEL' ? `${s} ₾` : `$${s}`;
  };
  const esc = (t) => t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const formatDate = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
  };

  const itemsEl = $('#items');
  const tpl = $('#row-tpl');

  function addRow(data = {}) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.querySelector('.i-name').value = data.name ?? '';
    node.querySelector('.i-qty').value = data.qty ?? 1;
    node.querySelector('.i-price').value = data.price ?? '';
    node.querySelector('.i-del').addEventListener('click', () => { node.remove(); render(); });
    itemsEl.appendChild(node);
    return node;
  }

  function readItems() {
    return [...itemsEl.children].map((row) => {
      const qtyIn = row.querySelector('.i-qty');
      let qty = parseFloat(qtyIn.value);
      if (!(qty >= 1)) qty = 1;
      const price = Math.max(0, parseFloat(row.querySelector('.i-price').value) || 0);
      const total = qty * price;
      row.querySelector('.i-total').textContent = fmt(total);
      return { name: row.querySelector('.i-name').value.trim(), qty, price, total };
    });
  }

  function render() {
    const client = $('#in-client').value.trim() || DEFAULTS.client;
    const desc = $('#in-desc').value.trim() || DEFAULTS.desc;
    $('#pv-client').textContent = client;
    $('#pv-desc').textContent = desc;
    $('#pv-date').textContent = 'თარიღი: ' + formatDate($('#in-date').value);

    const items = readItems();
    const grand = items.reduce((a, i) => a + i.total, 0);
    $('#pv-rows').innerHTML = items.length
      ? items.map((i, idx) => `
        <tr>
          <td class="c-n">${String(idx + 1).padStart(2, '0')}</td>
          <td class="strong">${esc(i.name || 'პროდუქტი / სერვისი')}</td>
          <td class="r">${i.qty}</td>
          <td class="r">${fmt(i.price)}</td>
          <td class="r strong">${fmt(i.total)}</td>
        </tr>`).join('')
      : '<tr class="empty"><td colspan="5">დაამატეთ პროდუქტი ან სერვისი</td></tr>';
    $('#pv-total').textContent = fmt(grand);
    $('#ed-total').textContent = fmt(grand);
  }

  // Init
  $('#in-date').value = new Date().toLocaleDateString('en-CA');
  DEFAULTS.items.forEach(addRow);

  document.querySelector('.editor').addEventListener('input', render);
  $('#btn-add').addEventListener('click', () => { addRow().querySelector('.i-name').focus(); render(); });
  document.querySelectorAll('.seg').forEach((b) => b.addEventListener('click', () => {
    state.currency = b.dataset.cur;
    document.querySelectorAll('.seg').forEach((x) => x.classList.toggle('active', x === b));
    render();
  }));
  $('#btn-print').addEventListener('click', () => window.print());

  // Scale the A4 sheet to fit the preview pane
  const sheet = $('#sheet');
  const wrap = document.querySelector('.sheet-wrap');
  function fit() {
    sheet.style.transform = '';
    const avail = document.querySelector('.preview').clientWidth - 64;
    const w = sheet.offsetWidth;
    const s = Math.min(1, avail / w);
    sheet.style.transform = `scale(${s})`;
    wrap.style.height = s < 1 ? `${sheet.offsetHeight * s}px` : '';
  }
  window.addEventListener('resize', fit);
  window.addEventListener('beforeprint', () => { sheet.style.transform = ''; wrap.style.height = ''; });
  window.addEventListener('afterprint', fit);

  render();
  fit();
})();
