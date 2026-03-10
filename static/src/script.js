 const API = '/api/tasks';
    let tasks = [], currentFilter = 'semua', editingId = null;

    const CAT_LABEL = { work:'Kerja', study:'Belajar', personal:'Personal', finance:'Keuangan', social:'Sosial', other:'Lainnya' };
    const CAT_COLOR = {
      work:     'bg-blue-900 text-blue-300',
      study:    'bg-purple-900 text-purple-300',
      personal: 'bg-emerald-900 text-emerald-300',
      finance:  'bg-amber-900 text-amber-300',
      social:   'bg-pink-900 text-pink-300',
      other:    'bg-gray-700 text-gray-300',
    };

    // SVG icons
    const ICON = {
      edit: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
      trash: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
      check: `<svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
      undo: `<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>`,
    };

    // Category data
    const CATEGORIES = [
      { value: 'work',     label: 'Kerja',    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm0 0V5a2 2 0 00-2-2H6a2 2 0 00-2 2v2"/></svg>` },
      { value: 'study',    label: 'Belajar',  icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>` },
      { value: 'personal', label: 'Personal', icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>` },
      { value: 'finance',  label: 'Keuangan', icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` },
      { value: 'social',   label: 'Sosial',   icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>` },
      { value: 'other',    label: 'Lainnya',  icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg>` },
    ];

    // ── Auth guard ───────────────────────────────────────────
    const token = localStorage.getItem('token');
    if (!token) location.href = '/login.html';

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.name) {
        const greeting = document.getElementById('user-greeting-top');
        greeting.innerHTML = `<svg class="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>${user.name}`;
      }
    } catch {}

    function authH() {
      return { 'Content-Type':'application/json', 'Authorization':'Bearer '+token };
    }

    function doLogout() {
      localStorage.removeItem('token'); localStorage.removeItem('user');
      location.href = '/login.html';
    }

    // ── Cat change handlers ──────────────────────────────────
    function onCatChange() {
      document.getElementById('custom-wrap').classList.toggle('hidden', document.getElementById('cat-select').value !== 'other');
    }
    function onEditCatChange() {
      document.getElementById('edit-custom-wrap').classList.toggle('hidden', document.getElementById('edit-cat').value !== 'other');
    }
    function getCatData(value) { return CATEGORIES.find(c => c.value === value) || CATEGORIES[5]; }

    function buildDropdownItems(dropdownId, hiddenId, btnIconId, btnLabelId, wrapId, customWrapId) {
      const dd = document.getElementById(dropdownId);
      const current = document.getElementById(hiddenId).value;
      dd.innerHTML = CATEGORIES.map(c => `
        <button type="button" onclick="selectCat('${c.value}','${dropdownId}','${hiddenId}','${btnIconId}','${btnLabelId}','${wrapId}','${customWrapId}')"
          class="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition ${c.value===current?'bg-gray-700 text-white':''}">
          <span class="text-gray-400">${c.icon}</span>
          <span>${c.label}</span>
          ${c.value===current ? `<svg class="w-3.5 h-3.5 ml-auto text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>` : ''}
        </button>`).join('');
    }

    function selectCat(value, dropdownId, hiddenId, btnIconId, btnLabelId, wrapId, customWrapId) {
      document.getElementById(hiddenId).value = value;
      const cat = getCatData(value);
      document.getElementById(btnIconId).innerHTML = cat.icon;
      document.getElementById(btnLabelId).textContent = cat.label;
      document.getElementById(dropdownId).classList.add('hidden');
      if (customWrapId) document.getElementById(customWrapId).classList.toggle('hidden', value !== 'other');
    }

    function toggleCatDropdown() {
      const dd = document.getElementById('cat-dropdown');
      const isHidden = dd.classList.contains('hidden');
      closeAllDropdowns();
      if (isHidden) {
        buildDropdownItems('cat-dropdown','cat-select','cat-btn-icon','cat-btn-label','cat-dropdown-wrap','custom-wrap');
        dd.classList.remove('hidden');
      }
    }

    function toggleEditCatDropdown() {
      const dd = document.getElementById('edit-cat-dropdown');
      const isHidden = dd.classList.contains('hidden');
      closeAllDropdowns();
      if (isHidden) {
        buildDropdownItems('edit-cat-dropdown','edit-cat','edit-cat-btn-icon','edit-cat-btn-label','edit-cat-dropdown-wrap','edit-custom-wrap');
        dd.classList.remove('hidden');
      }
    }

    function closeAllDropdowns() {
      document.getElementById('cat-dropdown').classList.add('hidden');
      document.getElementById('edit-cat-dropdown').classList.add('hidden');
    }
    // ── Load tasks ───────────────────────────────────────────
    async function loadTasks() {
      show('loading-state'); hide('task-list'); hide('empty-state');
      try {
        const res = await fetch(API, { headers: authH() });
        if (res.status === 401) { doLogout(); return; }
        if (!res.ok) throw new Error('Gagal memuat tugas');
        const data = await res.json();
        tasks = data.data || [];
        render();
      } catch(e) { toast('⚠ ' + e.message, 'err'); }
      finally { hide('loading-state'); }
    }

    // ── Add task ─────────────────────────────────────────────
    async function addTask() {
      const titleEl  = document.getElementById('task-input');
      const catEl    = document.getElementById('cat-select');
      const customEl = document.getElementById('custom-input');
      const title    = titleEl.value.trim();
      const category = catEl.value;

      if (!title) { toast('Tulis dulu tugasnya!', 'err'); titleEl.focus(); return; }
      if (category === 'other' && !customEl.value.trim()) {
        toast('Isi nama kategori kustom!', 'err'); customEl.focus(); return;
      }

      const body = { title, category };
      if (category === 'other') body.custom_category = customEl.value.trim();

      try {
        const res  = await fetch(API, { method:'POST', headers:authH(), body:JSON.stringify(body) });
        if (res.status === 401) { doLogout(); return; }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal menambah tugas');
        titleEl.value = ''; customEl.value = '';
        document.getElementById('custom-wrap').classList.add('hidden');
        toast('Tugas ditambahkan!');
        await loadTasks();
      } catch(e) { toast(e.message,'err'); }
    }

    // ── Toggle status ────────────────────────────────────────
    async function toggleTask(id) {
      const t = tasks.find(x => x.id === id); if (!t) return;
      const newStatus = t.status === 'done' ? 'pending' : 'done';
      try {
        const res = await fetch(`${API}/${id}/status`, {
          method:'PATCH', headers:authH(), body:JSON.stringify({ status:newStatus })
        });
        if (res.status===401) { doLogout(); return; }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        t.status = newStatus;
        render();
        toast(newStatus==='done' ? 'Selesai!' : 'Belum selesai');
      } catch(e) { toast(e.message,'err'); }
    }

    // ── Delete task ──────────────────────────────────────────
    async function deleteTask(id) {
      if (!confirm('Hapus tugas ini?')) return;
      try {
        const res = await fetch(`${API}/${id}`, { method:'DELETE', headers:authH() });
        if (res.status===401) { doLogout(); return; }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        tasks = tasks.filter(x => x.id !== id);
        render();
        toast('Tugas dihapus');
      } catch(e) { toast(e.message,'err'); }
    }

    // ── Edit ─────────────────────────────────────────────────
    function openEdit(id) {
      const t = tasks.find(x => x.id===id); if(!t) return;
      editingId = id;
      document.getElementById('edit-title').value = t.title;
      document.getElementById('edit-cat').value   = t.category;
      const isOther = t.category === 'other';
      document.getElementById('edit-custom-wrap').classList.toggle('hidden', !isOther);
      document.getElementById('edit-custom').value = isOther ? (t.custom_category||'') : '';
      show('edit-modal');
      setTimeout(() => document.getElementById('edit-title').focus(), 50);
    }
    function closeModal() { editingId=null; hide('edit-modal'); }
    function onModalBackdrop(e) { if(e.target===document.getElementById('edit-modal')) closeModal(); }

    async function saveEdit() {
      const title    = document.getElementById('edit-title').value.trim();
      const category = document.getElementById('edit-cat').value;
      const customEl = document.getElementById('edit-custom');
      if (!title) { toast('Judul wajib diisi!','err'); return; }
      if (category==='other' && !customEl.value.trim()) { toast('Isi kategori kustom!','err'); return; }
      const body = { title, category };
      if (category==='other') body.custom_category = customEl.value.trim();
      try {
        const res  = await fetch(`${API}/${editingId}`, { method:'PATCH', headers:authH(), body:JSON.stringify(body) });
        if (res.status===401) { doLogout(); return; }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        closeModal();
        toast('Tugas diperbarui!');
        await loadTasks();
      } catch(e) { toast(e.message,'err'); }
    }

    // ── Clear done ───────────────────────────────────────────
    async function clearDone() {
      const done = tasks.filter(t => t.status==='done');
      if (!done.length) { toast('Tidak ada tugas selesai', 'err'); return; }
      if (!confirm(`Hapus ${done.length} tugas yang selesai?`)) return;
      let cnt = 0;
      for (const t of done) {
        try {
          const r = await fetch(`${API}/${t.id}`, { method:'DELETE', headers:authH() });
          if (r.ok) { tasks = tasks.filter(x => x.id!==t.id); cnt++; }
        } catch {}
      }
      render();
      toast(`${cnt} tugas dihapus`);
    }

    // ── Filter ───────────────────────────────────────────────
    function setFilter(f, btn) {
      currentFilter = f;
      document.querySelectorAll('.filter-btn').forEach(b => {
        const active = b.dataset.filter === f;
        b.className = 'filter-btn flex-1 rounded-lg py-2 text-sm font-semibold transition ' +
          (active ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700');
      });
      render();
    }

    // ── Render ───────────────────────────────────────────────
    function render() {
      const total = tasks.length;
      const done  = tasks.filter(t => t.status==='done').length;
      const left  = total - done;
      const pct   = total===0 ? 0 : Math.round(done/total*100);

      document.getElementById('total-count').textContent = total;
      document.getElementById('done-count').textContent  = done;
      document.getElementById('left-count').textContent  = left;
      document.getElementById('progress-pct').textContent = pct+'%';
      document.getElementById('progress-fill').style.width = pct+'%';

      // Recent tasks for dashboard
      const recentEl = document.getElementById('recent-tasks');
      const recent = tasks.slice(0, 5);
      if (recent.length) {
        recentEl.innerHTML = recent.map(t => {
          const isDone = t.status === 'done';
          const dot = isDone
            ? `<svg class="w-2 h-2 text-green-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg>`
            : `<svg class="w-2 h-2 text-yellow-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg>`;
          return `<div class="flex items-start gap-2 text-sm py-2 border-b border-gray-700 last:border-0">
            ${dot}
            <span class="flex-1 ${isDone ? 'line-through text-gray-600' : 'text-gray-300'}">${esc(t.title)}</span>
          </div>`;
        }).join('');
      } else {
        recentEl.innerHTML = '<p class="text-gray-600 text-sm text-center py-4">Belum ada tugas</p>';
      }

      // Category stats
      const catEl = document.getElementById('category-stats');
      const catCount = {};
      tasks.forEach(t => {
        const cat = t.custom_category || CAT_LABEL[t.category] || t.category;
        catCount[cat] = (catCount[cat] || 0) + 1;
      });
      const catEntries = Object.entries(catCount);
      if (catEntries.length) {
        catEl.innerHTML = catEntries.map(([cat, count]) => 
          `<div class="flex justify-between text-sm py-2 border-b border-gray-700 last:border-0">
            <span class="text-gray-300">${esc(cat)}</span>
            <span class="text-indigo-400 font-semibold">${count}</span>
          </div>`
        ).join('');
      } else {
        catEl.innerHTML = '<p class="text-gray-600 text-sm text-center py-4">Belum ada data</p>';
      }

      let filtered = tasks;
      if (currentFilter==='aktif')   filtered = tasks.filter(t => t.status!=='done');
      if (currentFilter==='selesai') filtered = tasks.filter(t => t.status==='done');

      const list  = document.getElementById('task-list');
      const empty = document.getElementById('empty-state');

      if (!filtered.length) {
        hide('task-list'); list.innerHTML='';
        empty.style.display='flex'; empty.classList.remove('hidden');
        return;
      }
      hide('loading-state');
      empty.style.display='none'; empty.classList.add('hidden');
      show('task-list');

      list.innerHTML = filtered.map(t => {
        const isDone    = t.status === 'done';
        const catLabel  = t.custom_category || CAT_LABEL[t.category] || t.category;
        const catColor  = CAT_COLOR[t.category] || CAT_COLOR.other;
        const dateStr   = t.created_at
          ? new Date(t.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})
          : '';
        return `
        <div class="task-item ${isDone?'task-done':''} group flex items-start gap-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-xl px-4 py-3 transition" data-id="${t.id}">
          <button onclick="toggleTask(${t.id})" title="${isDone?'Tandai belum selesai':'Tandai selesai'}"
            class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition
              ${isDone ? 'bg-green-500 border-green-500' : 'border-gray-500 hover:border-indigo-400'}">
            ${isDone ? '<svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : ''}
          </button>
          <div class="flex-1 min-w-0">
            <p class="task-title text-sm font-medium text-white leading-snug">${esc(t.title)}</p>
            <div class="flex items-center gap-2 mt-1.5 flex-wrap">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${catColor}">${esc(catLabel)}</span>
              ${dateStr ? `<span class="text-gray-600 text-xs">${dateStr}</span>` : ''}
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0 mt-0.5">
            <button onclick="openEdit(${t.id})" title="Edit"
              class="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-gray-700 transition text-xs">${ICON.edit}</button>
            <button onclick="deleteTask(${t.id})" title="Hapus"
              class="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-700 transition text-xs">${ICON.trash}</button>
          </div>
        </div>`;
      }).join('');
    }

    // ── Toast ────────────────────────────────────────────────
    function toast(msg, type='ok') {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.className = 'show ' + (type==='err' ? 'toast-err' : 'toast-ok');
      clearTimeout(el._t);
      el._t = setTimeout(() => el.classList.remove('show'), 2600);
    }

    // ── Helpers ──────────────────────────────────────────────
    function show(id) { document.getElementById(id).classList.remove('hidden'); }
    function hide(id) { document.getElementById(id).classList.add('hidden'); }
    function esc(s)   { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

    // ── Sidebar menu ─────────────────────────────────────────
    function setActiveMenu(menu) {
      document.querySelectorAll('.sidebar-menu-item').forEach(item => {
        item.classList.remove('active');
      });
      event.target.closest('.sidebar-menu-item').classList.add('active');
      
      document.getElementById('dashboard-content').classList.toggle('hidden', menu !== 'dashboard');
      document.getElementById('task-content').classList.toggle('hidden', menu !== 'task');
      document.getElementById('profile-content').classList.toggle('hidden', menu !== 'profil');
      
      const titles = { dashboard: 'Dashboard', task: 'Task', profil: 'Profil' };
      document.querySelector('nav h1').textContent = titles[menu] || 'Dashboard';
      
      if (menu === 'profil') loadProfile();
      
      if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('show');
      }
    }

    // ── Profile ─────────────────────────────────────────────
    function loadProfile() {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        document.getElementById('profile-name').textContent = user.name || '-';
        document.getElementById('profile-email').textContent = user.email || '-';
      } catch {}
    }

    function togglePasswordVisibility(inputId) {
      const input = document.getElementById(inputId);
      input.type = input.type === 'password' ? 'text' : 'password';
    }

    async function changePassword() {
      const newPw = document.getElementById('new-password').value.trim();
      const confPw = document.getElementById('confirm-password').value.trim();
      
      if (!newPw || !confPw) {
        toast('Semua field harus diisi!', 'err');
        return;
      }
      if (newPw !== confPw) {
        toast('Password baru tidak cocok!', 'err');
        return;
      }
      if (newPw.length < 6) {
        toast('Password minimal 6 karakter!', 'err');
        return;
      }
      
      try {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: authH(),
          body: JSON.stringify({ new_password: newPw })
        });
        
        const text = await res.text();
        if (!text) throw new Error('Server tidak memberikan response');
        
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error('Response dari server:', text);
          throw new Error('Endpoint belum tersedia atau server error');
        }
        
        if (res.status === 401) { doLogout(); return; }
        if (!res.ok) throw new Error(data.message || 'Gagal ganti password');
        
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        toast('✅ Password berhasil diganti!');
      } catch(e) {
        toast('⚠️ ' + e.message, 'err');
      }
    }

    // ── Init ─────────────────────────────────────────────────
    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('show');
    }

    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('task-input').addEventListener('keydown', e => { if(e.key==='Enter') addTask(); });
      document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });
      loadTasks();
    });