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

    // ── Auth guard ───────────────────────────────────────────
    const token = localStorage.getItem('token');
    if (!token) location.href = '/login.html';

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.name) {
        document.getElementById('user-greeting-top').textContent = '👤 ' + user.name;
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
      } catch(e) { toast('⚠️ ' + e.message, 'err'); }
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
        toast('✅ Tugas ditambahkan!');
        await loadTasks();
      } catch(e) { toast('⚠️ '+e.message,'err'); }
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
        toast(newStatus==='done' ? '✅ Selesai!' : '↩ Belum selesai');
      } catch(e) { toast('⚠️ '+e.message,'err'); }
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
        toast('🗑 Tugas dihapus');
      } catch(e) { toast('⚠️ '+e.message,'err'); }
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
        toast('✏️ Tugas diperbarui!');
        await loadTasks();
      } catch(e) { toast('⚠️ '+e.message,'err'); }
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
      toast(`🗑 ${cnt} tugas dihapus`);
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
          return `<div class="flex items-center gap-2 text-sm py-2 border-b border-gray-700 last:border-0">
            <span class="${isDone ? 'text-green-400' : 'text-yellow-400'}">●</span>
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
              class="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-gray-700 transition text-xs">✏️</button>
            <button onclick="deleteTask(${t.id})" title="Hapus"
              class="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-700 transition text-xs">✕</button>
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