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
        checkDeadlineNotifications();
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
      if (!category) { toast('Pilih kategori dulu!', 'err'); return; }
      if (category === 'other' && !customEl.value.trim()) {
        toast('Isi nama kategori kustom!', 'err'); customEl.focus(); return;
      }

      const deadlineEl = document.getElementById('deadline-input');
      const body = { title, category };
      if (category === 'other') body.custom_category = customEl.value.trim();
      if (deadlineEl.value) body.deadline = new Date(deadlineEl.value).toISOString();

      try {
        const res  = await fetch(API, { method:'POST', headers:authH(), body:JSON.stringify(body) });
        if (res.status === 401) { doLogout(); return; }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal menambah tugas');
        titleEl.value = ''; customEl.value = ''; deadlineEl.value = '';
        catEl.value = '';
        document.getElementById('cat-btn-icon').innerHTML = '';
        document.getElementById('cat-btn-label').textContent = 'Pilih Kategori';
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

    // ── Deadline helpers ─────────────────────────────────────
    function toLocalDatetimeValue(isoStr) {
      if (!isoStr) return '';
      const d = new Date(isoStr);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }

    function formatDeadline(isoStr) {
      if (!isoStr) return null;
      const d = new Date(isoStr);
      return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function isOverdue(isoStr, status) {
      if (!isoStr || status === 'done') return false;
      return new Date(isoStr) < new Date();
    }

    // ── Edit ─────────────────────────────────────────────────
    function openEdit(id) {
      const t = tasks.find(x => x.id===id); if(!t) return;
      editingId = id;
      document.getElementById('edit-title').value = t.title;
      document.getElementById('edit-cat').value   = t.category;
      
      const cat = getCatData(t.category);
      document.getElementById('edit-cat-btn-icon').innerHTML = cat.icon;
      document.getElementById('edit-cat-btn-label').textContent = cat.label;
      
      const isOther = t.category === 'other';
      document.getElementById('edit-custom-wrap').classList.toggle('hidden', !isOther);
      document.getElementById('edit-custom').value = isOther ? (t.custom_category||'') : '';
      
      document.getElementById('edit-deadline').value = t.deadline ? toLocalDatetimeValue(t.deadline) : '';
      
      show('edit-modal');
      setTimeout(() => document.getElementById('edit-title').focus(), 50);
    }
    function closeModal() { editingId=null; hide('edit-modal'); }
    function onModalBackdrop(e) { if(e.target===document.getElementById('edit-modal')) closeModal(); }

    async function saveEdit() {
      const title      = document.getElementById('edit-title').value.trim();
      const category   = document.getElementById('edit-cat').value;
      const customEl   = document.getElementById('edit-custom');
      const deadlineEl = document.getElementById('edit-deadline');
      if (!title) { toast('Judul wajib diisi!','err'); return; }
      if (category==='other' && !customEl.value.trim()) { toast('Isi kategori kustom!','err'); return; }
      const body = { title, category };
      if (category==='other') body.custom_category = customEl.value.trim();
      body.deadline = deadlineEl.value ? new Date(deadlineEl.value).toISOString() : null;
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
    let searchQuery = '';

    function searchTasks() {
      searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
      render();
    }

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

      // Upcoming deadlines (dashboard)
      const upcomingEl = document.getElementById('upcoming-deadlines');
      const withDeadline = tasks
        .filter(t => t.deadline && t.status !== 'done')
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);

      if (withDeadline.length) {
        upcomingEl.innerHTML = withDeadline.map(t => {
          const over = isOverdue(t.deadline, t.status);
          const fmt  = formatDeadline(t.deadline);
          return `<div class="flex items-center gap-3 py-2 border-b border-gray-700 last:border-0">
            <svg class="w-3.5 h-3.5 flex-shrink-0 ${over ? 'text-red-400' : 'text-amber-400'}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="flex-1 text-sm text-gray-300 truncate">${esc(t.title)}</span>
            <span class="text-xs font-medium flex-shrink-0 ${over ? 'text-red-400' : 'text-amber-400'}">${fmt}</span>
          </div>`;
        }).join('');
      } else {
        upcomingEl.innerHTML = '<p class="text-gray-600 text-sm text-center py-4">Tidak ada deadline</p>';
      }

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

      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(t => {
          const title = t.title.toLowerCase();
          const category = (t.custom_category || CAT_LABEL[t.category] || t.category).toLowerCase();
          return title.includes(searchQuery) || category.includes(searchQuery);
        });
      }

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
              ${t.deadline ? `<span class="inline-flex items-center gap-1 text-xs font-medium ${isOverdue(t.deadline, t.status) ? 'text-red-400' : 'text-amber-400'}">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                ${isOverdue(t.deadline, t.status) ? 'Lewat · ' : ''}${formatDeadline(t.deadline)}
              </span>` : ''}
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
    let selectedCategory = null;

    function setActiveMenu(menu) {
      document.querySelectorAll('.sidebar-menu-item').forEach(item => {
        item.classList.remove('active');
      });
      event.target.closest('.sidebar-menu-item').classList.add('active');
      
      document.getElementById('dashboard-content').classList.toggle('hidden', menu !== 'dashboard');
      document.getElementById('task-content').classList.toggle('hidden', menu !== 'task');
      document.getElementById('kategori-content').classList.toggle('hidden', menu !== 'kategori');
      document.getElementById('profile-content').classList.toggle('hidden', menu !== 'profil');
      
      const titles = { dashboard: 'Dashboard', task: 'Task', kategori: 'Kategori', profil: 'Profil' };
      document.querySelector('nav h1').textContent = titles[menu] || 'Dashboard';
      
      if (menu === 'profil') loadProfile();
      if (menu === 'kategori') renderCategoryPage();
      
      if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('show');
      }
    }

    // ── Category Filter ──────────────────────────────────────
    function renderCategoryPage() {
      const categoryCounts = { work: 0, study: 0, personal: 0, finance: 0, social: 0, other: 0 };
      tasks.forEach(t => {
        if (categoryCounts.hasOwnProperty(t.category)) {
          categoryCounts[t.category]++;
        }
      });
      
      Object.keys(categoryCounts).forEach(cat => {
        const el = document.getElementById(`count-${cat}`);
        if (el) el.textContent = categoryCounts[cat];
      });
      
      if (selectedCategory) {
        filterByCategory(selectedCategory);
      }
    }

    function filterByCategory(category) {
      selectedCategory = category;
      const filtered = tasks.filter(t => t.category === category);
      const cat = getCatData(category);
      
      document.getElementById('selected-category-icon').innerHTML = cat.icon;
      document.getElementById('selected-category-name').textContent = cat.label;
      document.getElementById('category-tasks-section').classList.remove('hidden');
      
      const list = document.getElementById('category-task-list');
      const empty = document.getElementById('category-empty');
      
      if (!filtered.length) {
        list.innerHTML = '';
        empty.style.display = 'flex';
        empty.classList.remove('hidden');
        return;
      }
      
      empty.style.display = 'none';
      empty.classList.add('hidden');
      
      list.innerHTML = filtered.map(t => {
        const isDone = t.status === 'done';
        const catLabel = t.custom_category || CAT_LABEL[t.category] || t.category;
        const catColor = CAT_COLOR[t.category] || CAT_COLOR.other;
        const dateStr = t.created_at
          ? new Date(t.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})
          : '';
        return `
        <div class="task-item ${isDone?'task-done':''} group flex items-start gap-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-xl px-4 py-3 transition">
          <div class="flex-1 min-w-0">
            <p class="task-title text-sm font-medium text-white leading-snug">${esc(t.title)}</p>
            <div class="flex items-center gap-2 mt-1.5 flex-wrap">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${catColor}">${esc(catLabel)}</span>
              ${dateStr ? `<span class="text-gray-600 text-xs">${dateStr}</span>` : ''}
              ${t.deadline ? `<span class="inline-flex items-center gap-1 text-xs font-medium ${isOverdue(t.deadline, t.status) ? 'text-red-400' : 'text-amber-400'}">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                ${isOverdue(t.deadline, t.status) ? 'Lewat · ' : ''}${formatDeadline(t.deadline)}
              </span>` : ''}
              ${isDone ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-900/30 text-green-400">Selesai</span>' : '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-900/30 text-yellow-400">Belum Selesai</span>'}
            </div>
          </div>
        </div>`;
      }).join('');
    }

    function clearCategoryFilter() {
      selectedCategory = null;
      document.getElementById('category-tasks-section').classList.add('hidden');
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

    // ── Notification ─────────────────────────────────────────
    // Ubah di sini untuk ganti waktu notifikasi
    const NOTIF_LEVELS = [
      { key: '7d',  menit: 7 * 24 * 60, label: '7 hari lagi'    },
      { key: '3d',  menit: 3 * 24 * 60, label: '3 hari lagi'    },
      { key: '1d',  menit: 1 * 24 * 60, label: '1 hari lagi'    },
      { key: '3h',  menit: 3 * 60,      label: '3 jam lagi'     },
      { key: '1h',  menit: 1 * 60,      label: '1 jam lagi'     },
      { key: '30m', menit: 30,          label: '30 menit lagi'  },
    ];

    async function requestNotificationPermission() {
      if (!('Notification' in window)) return false;
      if (Notification.permission === 'granted') return true;
      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    }

    // Key pakai taskId + level + tanggal deadline
    // → tiap level hanya notif sekali
    // → kalau deadline diubah, key berbeda → bisa notif lagi
    function getNotifKey(taskId, levelKey, deadline) {
      const user   = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || 'guest';
      return `notif_${userId}_${taskId}_${levelKey}_${deadline}`;
    }

    function sudahDinotif(taskId, levelKey, deadline) {
      return !!localStorage.getItem(getNotifKey(taskId, levelKey, deadline));
    }

    function tandaiDinotif(taskId, levelKey, deadline) {
      localStorage.setItem(getNotifKey(taskId, levelKey, deadline), '1');
    }

    function checkDeadlineNotifications() {
      if (Notification.permission !== 'granted') return;

      const now = new Date();

      tasks.forEach(task => {
        if (task.status === 'done' || !task.deadline) return;

        const deadline  = new Date(task.deadline);
        const sisaMs    = deadline - now;
        const sisaMenit = sisaMs / 60000;

        // Cari level notifikasi yang paling sesuai (terdekat dengan sisa waktu)
        let levelTerdekat = null;
        
        for (let i = NOTIF_LEVELS.length - 1; i >= 0; i--) {
          const level = NOTIF_LEVELS[i];
          // Cek apakah sisa waktu >= level ini dan belum dinotif
          if (sisaMenit > 0 && sisaMenit <= level.menit && !sudahDinotif(task.id, level.key, task.deadline)) {
            levelTerdekat = level;
            break; // Ambil level terkecil yang cocok
          }
        }

        // Kirim notifikasi hanya untuk level terdekat
        if (levelTerdekat) {
          showNotification(task, levelTerdekat.label);
          tandaiDinotif(task.id, levelTerdekat.key, task.deadline);
        }

        // Notif overdue — hanya sekali
        if (sisaMs < 0 && !sudahDinotif(task.id, 'overdue', task.deadline)) {
          showOverdueNotification(task);
          tandaiDinotif(task.id, 'overdue', task.deadline);
        }
      });
    }

    function showNotification(task, sisaLabel) {
      // Browser notification
      if (Notification.permission === 'granted') {
        const notification = new Notification('⏰ Deadline Mendekat!', {
          body: `${task.title}\n${sisaLabel}`,
          icon: '/static/img/icon.png',
          tag: `deadline_${task.id}_${sisaLabel}`,
          requireInteraction: false,
        });
        notification.onclick = () => { window.focus(); notification.close(); };
      }
      
      // In-app notification
      showInAppNotification('⏰', 'Deadline Mendekat!', `${task.title} - ${sisaLabel}`, 'warning');
    }

    function showOverdueNotification(task) {
      // Browser notification
      if (Notification.permission === 'granted') {
        const notification = new Notification('🚨 Deadline Terlewat!', {
          body: `${task.title}\nDeadline sudah terlewat!`,
          icon: '/static/img/icon.png',
          tag: `overdue_${task.id}`,
          requireInteraction: true,
        });
        notification.onclick = () => { window.focus(); notification.close(); };
      }
      
      // In-app notification
      showInAppNotification('🚨', 'Deadline Terlewat!', `${task.title} - Deadline sudah terlewat!`, 'danger');
    }

    function showInAppNotification(icon, title, message, type = 'info') {
      const container = document.getElementById('notification-container');
      const notifId = 'notif_' + Date.now();
      
      const colors = {
        info: { icon: 'text-blue-400', border: 'border-blue-500/30' },
        warning: { icon: 'text-amber-400', border: 'border-amber-500/30' },
        danger: { icon: 'text-red-400', border: 'border-red-500/30' },
      };
      const color = colors[type] || colors.info;
      
      const notifEl = document.createElement('div');
      notifEl.id = notifId;
      notifEl.className = `notification-item ${color.border}`;
      notifEl.innerHTML = `
        <div class="text-2xl ${color.icon} flex-shrink-0">${icon}</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-white mb-0.5">${esc(title)}</p>
          <p class="text-xs text-gray-400 leading-relaxed">${esc(message)}</p>
        </div>
        <button onclick="removeInAppNotification('${notifId}')" class="text-gray-500 hover:text-white transition flex-shrink-0">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      `;
      
      container.appendChild(notifEl);
      
      // Auto remove after 8 seconds
      setTimeout(() => removeInAppNotification(notifId), 8000);
    }

    function removeInAppNotification(notifId) {
      const notifEl = document.getElementById(notifId);
      if (!notifEl) return;
      
      notifEl.classList.add('removing');
      setTimeout(() => notifEl.remove(), 300);
    }

    // ── Init ─────────────────────────────────────────────────
    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('show');
    }

    function closeSidebarOnMobile() {
      if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('show');
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('cat-btn-label').textContent = 'Pilih Kategori';
      document.getElementById('cat-select').value = '';
      
      // Request notification permission
      requestNotificationPermission();
      
      document.getElementById('task-input').addEventListener('keydown', e => { if(e.key==='Enter') addTask(); });
      document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });
      
      // Close sidebar when clicking outside on mobile
      document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const burgerBtn = e.target.closest('button[onclick="toggleSidebar()"]');
        
        if (window.innerWidth < 768 && sidebar.classList.contains('show')) {
          if (!sidebar.contains(e.target) && !burgerBtn) {
            sidebar.classList.remove('show');
          }
        }
      });
      
      loadTasks();
      
      // Check notifications every 30 minutes
      setInterval(checkDeadlineNotifications, 30 * 60 * 1000);
    });