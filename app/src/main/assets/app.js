const API = 'http://127.0.0.1:5001';
let isOnline = false;

function doLogin() {
  const saved = localStorage.getItem('valid_code') || '1234';
  const code = document.getElementById('code-input').value;
  if (code === saved) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-screen').classList.remove('hidden');
    loadSettings();
    startPing();
  } else alert('Неверный код!');
}

function loadSettings() {
  document.getElementById('username').textContent = localStorage.getItem('username') || 'Оператор';
  if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
  document.getElementById('set-name').value = localStorage.getItem('username') || 'Оператор';
  document.getElementById('set-dark').checked = (localStorage.getItem('theme') === 'dark');
}

function showTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.add('hidden'));
  document.getElementById('tab-' + name).classList.remove('hidden');
}

function doLogout() {
  if (confirm('Вы уверены, что хотите выйти?')) {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('code-input').value = '';
  }
}

async function doSearch() {
  if (!isOnline) return alert('Нет связи!');
  const fields = {
    last: document.getElementById('f-last').value,
    first: document.getElementById('f-first').value,
    middle: document.getElementById('f-middle').value,
    dob: document.getElementById('f-dob').value,
    inn: document.getElementById('f-inn').value
  };
  if (!Object.values(fields).some(v => v.trim())) return;
  const res = document.getElementById('search-result');
  res.textContent = 'Поиск...';
  try {
    const r = await fetch(API + '/search', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({fields})
    });
    const d = await r.json();
    const results = d.results || [];
    res.textContent = results.length ? `Найдено: ${results.length}\n\n` + results.join('\n\n') : 'Ничего не найдено.';
  } catch (e) { res.textContent = 'Ошибка: ' + e; }
}

async function doFns() {
  if (!isOnline) return alert('Нет связи!');
  const query = document.getElementById('fns-input').value.trim();
  if (!query) return;
  const res = document.getElementById('fns-result');
  res.textContent = 'Запрос в ФНС...';
  try {
    const r = await fetch(API + '/fns', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({query})
    });
    const d = await r.json();
    if (d.error) res.textContent = 'Ошибка: ' + d.error;
    else if (!d.data || !d.data.length) res.textContent = 'Не найдено.';
    else res.textContent = d.data.map(o =>
      `Название: ${o.name}\nИНН: ${o.inn} | ОГРН: ${o.ogrn}\nАдрес: ${o.address}\nДиректор: ${o.director}\nСтатус: ${o.status}`
    ).join('\n\n');
  } catch (e) { res.textContent = 'Ошибка: ' + e; }
}

async function doIp() {
  if (!isOnline) return alert('Нет связи!');
  const query = document.getElementById('ip-input').value.trim();
  if (!query) return;
  const res = document.getElementById('ip-result');
  res.textContent = 'Запрос к базе IP...';
  try {
    const r = await fetch(API + '/ip', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ip: query})
    });
    const d = await r.json();
    if (d.error) { res.textContent = 'Ошибка: ' + d.error; return; }
    const i = d.data;
    res.textContent =
      `IP: ${i.query || ''}\nСтрана: ${i.country || ''}\nРегион: ${i.regionName || ''}\n` +
      `Город: ${i.city || ''}\nПровайдер: ${i.isp || ''}\nОрганизация: ${i.org || ''}\n` +
      `Мобильный: ${i.mobile ? 'Да' : 'Нет'}\nVPN/Прокси: ${i.proxy ? 'Да' : 'Нет'}\n` +
      `Хостинг: ${i.hosting ? 'Да' : 'Нет'}`;
  } catch (e) { res.textContent = 'Ошибка: ' + e; }
}

function saveSettings() {
  localStorage.setItem('username', document.getElementById('set-name').value.trim());
  const code = document.getElementById('set-code').value.trim();
  if (code) {
    if (code.length < 4) return alert('Код минимум 4 символа!');
    localStorage.setItem('valid_code', code);
  }
  const dark = document.getElementById('set-dark').checked;
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  document.body.classList.toggle('dark', dark);
  document.getElementById('username').textContent = localStorage.getItem('username');
  alert('Сохранено!');
}

function ping() {
  fetch(API + '/ip', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ip: '8.8.8.8'})
  })
    .then(() => { isOnline = true; })
    .catch(() => { isOnline = false; })
    .finally(() => {
      const st = document.getElementById('status');
      st.textContent = isOnline ? '● Сервер: Онлайн' : '● Сервер: Офлайн';
      st.className = 'status ' + (isOnline ? 'online' : 'offline');
    });
}

function startPing() { ping(); setInterval(ping, 10000); }

document.getElementById('code-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});
