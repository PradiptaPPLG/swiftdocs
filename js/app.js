// Configure PDF.js Worker (Same-origin local worker = true multi-threaded speed)
if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf-tools/pdf.worker.min.js';
}

// =========================================================================
// THEME & SETTINGS MANAGER (Default + 5 ColorHunt Palettes)
// =========================================================================
const THEMES = [
    {
        id: 'default',
        name: 'Retro Pop (Default)',
        desc: 'Cyan, Oranye & Pink',
        colors: ['#3EC1D3', '#F6F7D7', '#FF9A00', '#FF165D']
    },
    {
        id: 'manga-paper',
        name: 'Manga Paper',
        desc: 'Kuning & Sage klasik',
        colors: ['#F5F7F8', '#F4CE14', '#495E57', '#45474B']
    },
    {
        id: 'cyber-purple',
        name: 'Cyber Purple',
        desc: 'Hitam & Ungu Neon',
        colors: ['#000000', '#52057B', '#892CDC', '#BC6FF1']
    },
    {
        id: 'midnight-indigo',
        name: 'Midnight Indigo',
        desc: 'Navy & Periwinkle',
        colors: ['#070F2B', '#1B1A55', '#535C91', '#9290C3']
    },
    {
        id: 'matcha-sakura',
        name: 'Matcha Sakura',
        desc: 'Pastel Pink & Matcha',
        colors: ['#FFC5C5', '#FFEBD8', '#C7DCA7', '#89B9AD']
    },
    {
        id: 'lavender-dream',
        name: 'Lavender Dream',
        desc: 'Ungu & Candy Pink',
        colors: ['#937DC2', '#C689C6', '#FFABE1', '#FFE6F7']
    }
];

let currentTheme = 'default';
let sfxEnabled = true;
let popEnabled = true;
let audioCtx = null;
const MANGA_POPS = ['POP!', 'CLICK!', 'SNAP!', 'ZAP!', '✦', '★'];

function loadSettings() {
    try {
        currentTheme = localStorage.getItem('swiftdocs_theme') || 'default';
        if (currentTheme === 'retro-pop') currentTheme = 'default';
        const savedSfx = localStorage.getItem('swiftdocs_sfx');
        const savedPop = localStorage.getItem('swiftdocs_pop');
        sfxEnabled = savedSfx === null ? true : savedSfx === '1';
        popEnabled = savedPop === null ? true : savedPop === '1';
    } catch (e) {}
    applyTheme(currentTheme, false);
    updateEffectLabels();
}

function applyTheme(themeId, save = true) {
    currentTheme = themeId;
    if (themeId === 'default') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', themeId);
    }
    if (save) {
        try { localStorage.setItem('swiftdocs_theme', themeId); } catch (e) {}
    }
    renderThemeGrid();
}

function renderThemeGrid() {
    const grid = document.getElementById('theme-grid');
    if (!grid) return;
    grid.innerHTML = THEMES.map(t => {
        const isActive = t.id === currentTheme;
        const dots = t.colors.map(c =>
            `<span class="w-5 h-5 rounded-full border-2 border-ink inline-block" style="background:${c};"></span>`
        ).join('');
        return `
            <button type="button" onclick="applyTheme('${t.id}')" class="theme-option-card ${isActive ? 'active' : ''}">
                <div class="flex items-center justify-between gap-2 mb-2">
                    <div class="flex items-center -space-x-1.5">${dots}</div>
                    ${isActive ? `<span class="sticker-badge dark text-[9px] py-0.5 px-2">AKTIF ✓</span>` : ''}
                </div>
                <div class="text-xs font-black">${t.name}</div>
                <div class="text-[10px] opacity-75 font-semibold">${t.desc}</div>
            </button>
        `;
    }).join('');
}

function openSettings() {
    renderThemeGrid();
    updateEffectLabels();
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function resetSettings() {
    applyTheme('default');
    sfxEnabled = true;
    popEnabled = true;
    try {
        localStorage.setItem('swiftdocs_sfx', '1');
        localStorage.setItem('swiftdocs_pop', '1');
    } catch (e) {}
    updateEffectLabels();
}

function toggleSound() {
    sfxEnabled = !sfxEnabled;
    try { localStorage.setItem('swiftdocs_sfx', sfxEnabled ? '1' : '0'); } catch (e) {}
    updateEffectLabels();
    if (sfxEnabled) playClickSfx(620);
}

function togglePopEffect() {
    popEnabled = !popEnabled;
    try { localStorage.setItem('swiftdocs_pop', popEnabled ? '1' : '0'); } catch (e) {}
    updateEffectLabels();
}

function updateEffectLabels() {
    const sfxStatus = document.getElementById('settings-sfx-status');
    const sfxPill = document.getElementById('settings-sfx-pill');
    const popStatus = document.getElementById('settings-pop-status');
    const popPill = document.getElementById('settings-pop-pill');

    if (sfxStatus) sfxStatus.textContent = sfxEnabled ? 'Aktif' : 'Dimatikan';
    if (sfxPill) sfxPill.textContent = sfxEnabled ? 'ON' : 'OFF';
    if (popStatus) popStatus.textContent = popEnabled ? 'Aktif' : 'Dimatikan';
    if (popPill) popPill.textContent = popEnabled ? 'ON' : 'OFF';
}

function playClickSfx(freq = 520) {
    if (!sfxEnabled) return;
    try {
        if (!audioCtx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            audioCtx = new Ctx();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.45, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {}
}

function spawnMangaPop(x, y) {
    if (!popEnabled) return;
    const el = document.createElement('span');
    el.className = 'manga-click-pop';
    el.textContent = MANGA_POPS[Math.floor(Math.random() * MANGA_POPS.length)];
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 560);
}

document.addEventListener('click', (e) => {
    const modal = document.getElementById('settings-modal');
    if (modal && e.target === modal) {
        closeSettings();
        return;
    }
    const interactive = e.target.closest('button, a, .tool-card, .etalase-filter-pill, .theme-option-card');
    if (interactive) {
        playClickSfx();
        if (e.clientX || e.clientY) {
            spawnMangaPop(e.clientX, e.clientY);
        }
    }
});

function dismissRibbon() {
    const ribbon = document.getElementById('top-ribbon');
    if (ribbon) ribbon.style.display = 'none';
}

// =========================================================================
// TOOL METADATA & STATE
// =========================================================================
const TOOL_META = {
    merge: {
        title: 'Gabung PDF (Merge)',
        desc: 'Pilih 2 atau lebih file PDF, atur urutannya, lalu gabungkan menjadi 1 PDF utuh.',
        accept: '.pdf,application/pdf',
        multiple: true,
        acceptLabel: 'Pilih 2+ file PDF (.pdf) sekaligus atau tambahkan satu per satu',
        icon: 'layers',
        iconClass: 'bg-mangaYellow text-onAccent'
    },
    split: {
        title: 'Pisah PDF (Split & Extract)',
        desc: 'Klik halaman yang ingin diambil secara visual atau pecah setiap halaman jadi file terpisah.',
        accept: '.pdf,application/pdf',
        multiple: false,
        acceptLabel: 'Pilih 1 file PDF (.pdf)',
        icon: 'scissors',
        iconClass: 'bg-sage text-onSecondary'
    },
    compress: {
        title: 'Kompres & Optimasi PDF',
        desc: 'Kecilkan ukuran file PDF agar mudah diunggah dengan optimasi struktur atau rasterize gambar.',
        accept: '.pdf,application/pdf',
        multiple: false,
        acceptLabel: 'Pilih 1 file PDF (.pdf)',
        icon: 'minimize-2',
        iconClass: 'bg-mangaYellow text-onAccent'
    },
    pdf2img: {
        title: 'Konversi PDF ke Gambar (PNG/JPG)',
        desc: 'Ubah setiap halaman PDF menjadi gambar beresolusi tinggi dan unduh sebagai PNG/JPG atau ZIP.',
        accept: '.pdf,application/pdf',
        multiple: false,
        acceptLabel: 'Pilih 1 file PDF (.pdf)',
        icon: 'image',
        iconClass: 'bg-sage text-onSecondary'
    },
    img2pdf: {
        title: 'Konversi Gambar ke PDF',
        desc: 'Gabungkan beberapa foto JPG/PNG/WebP menjadi 1 file PDF rapi dengan ukuran kertas A4/Fit.',
        accept: 'image/png,image/jpeg,image/jpg,image/webp',
        multiple: true,
        acceptLabel: 'Pilih gambar (.jpg, .png, .webp) — bisa lebih dari 1',
        icon: 'file-image',
        iconClass: 'bg-mangaYellow text-onAccent'
    },
    organize: {
        title: 'Putar & Hapus Halaman PDF',
        desc: 'Putar halaman miring (90°/180°/270°) atau hapus halaman yang tidak diperlukan.',
        accept: '.pdf,application/pdf',
        multiple: false,
        acceptLabel: 'Pilih 1 file PDF (.pdf)',
        icon: 'rotate-cw',
        iconClass: 'bg-sage text-onSecondary'
    },
    watermark: {
        title: 'Watermark & Stempel PDF',
        desc: 'Beri tanda air teks (diagonal/mendatar) di seluruh halaman PDF Anda.',
        accept: '.pdf,application/pdf',
        multiple: false,
        acceptLabel: 'Pilih 1 file PDF (.pdf)',
        icon: 'stamp',
        iconClass: 'bg-mangaYellow text-onAccent'
    },
    office: {
        title: 'Office Reader & Cetak ke PDF',
        desc: 'Buka dokumen Word (.docx) atau Excel (.xlsx / .csv) dengan rapi dan cetak langsung sebagai PDF.',
        accept: '.docx,.xlsx,.xls,.csv',
        multiple: false,
        acceptLabel: 'Mendukung file Microsoft Word (.docx) dan Excel/CSV (.xlsx, .xls, .csv)',
        icon: 'file-spreadsheet',
        iconClass: 'bg-sage text-onSecondary'
    },
    'img-optimize': {
        title: 'Resize & Kompres Gambar',
        desc: 'Ubah dimensi piksel (lebar × tinggi) dan atur kualitas JPG/WebP/PNG untuk mengecilkan ukuran file.',
        accept: 'image/png,image/jpeg,image/jpg,image/webp',
        multiple: false,
        acceptLabel: 'Pilih 1 file gambar (.jpg, .png, .webp)',
        icon: 'scaling',
        iconClass: 'bg-mangaYellow text-onAccent'
    },
    'img-crop': {
        title: 'Crop & Putar Gambar',
        desc: 'Tarik area potong langsung di gambar, pilih rasio (1:1, 4:3, 16:9, Bebas), putar 90°, atau balik gambar.',
        accept: 'image/png,image/jpeg,image/jpg,image/webp',
        multiple: false,
        acceptLabel: 'Pilih 1 file gambar (.jpg, .png, .webp)',
        icon: 'crop',
        iconClass: 'bg-sage text-onSecondary'
    },
    'img-upscale': {
        title: 'Naikin Resolusi Gambar (HD)',
        desc: 'Perbesar resolusi foto 2x, 3x, atau 4x dengan interpolasi halus + filter penajam (sharpening).',
        accept: 'image/png,image/jpeg,image/jpg,image/webp',
        multiple: false,
        acceptLabel: 'Pilih 1 file gambar (.jpg, .png, .webp)',
        icon: 'sparkles',
        iconClass: 'bg-mangaYellow text-onAccent'
    },
    ocr: {
        title: 'OCR Ekstrak Teks (Gambar & PDF)',
        desc: 'Ekstrak teks dari foto, screenshot, atau PDF scan secara otomatis (Bahasa Indonesia & Inggris).',
        accept: 'image/png,image/jpeg,image/jpg,image/webp,.pdf,application/pdf',
        multiple: false,
        acceptLabel: 'Pilih 1 gambar (.jpg, .png, .webp) atau dokumen PDF scan (.pdf)',
        icon: 'scan-text',
        iconClass: 'bg-sage text-onSecondary'
    }
};

let activeTool = null;
let state = {
    files: [],
    pages: [],
    renderedImgs: [],
    singleFile: null
};

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function setStatus(type, msg) {
    const el = document.getElementById('ws-status');
    if (!msg) {
        el.classList.add('hidden');
        return;
    }
    el.classList.remove('hidden', 'bg-mangaYellow/30', 'bg-emerald-100', 'bg-red-100', 'text-ink', 'text-red-800');
    let icon = 'info';
    if (type === 'loading') {
        el.classList.add('bg-mangaYellow/30', 'text-ink');
        icon = 'loader-2';
    } else if (type === 'success') {
        el.classList.add('bg-emerald-100', 'text-slate-900');
        icon = 'check-circle-2';
    } else {
        el.classList.add('bg-red-100', 'text-red-800');
        icon = 'alert-circle';
    }
    el.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 shrink-0 ${type === 'loading' ? 'animate-spin' : ''}"></i><span>${escapeHtml(msg)}</span>`;
    lucide.createIcons();
}

function filterTools(category) {
    document.querySelectorAll('.etalase-filter-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === category);
    });
    let visibleIdx = 0;
    document.querySelectorAll('.tool-card').forEach(card => {
        const match = category === 'all' || card.dataset.category === category;
        card.classList.toggle('hidden', !match);
        if (match) {
            card.classList.remove('is-visible');
            card.style.setProperty('--reveal-delay', `${visibleIdx * 45}ms`);
            void card.offsetWidth;
            card.classList.add('is-visible');
            visibleIdx++;
        }
    });
}

function openTool(toolId) {
    if (!TOOL_META[toolId]) return;
    activeTool = toolId;
    const meta = TOOL_META[toolId];

    document.getElementById('tools-catalog-view').classList.add('hidden');
    document.getElementById('tool-workspace-view').classList.remove('hidden');

    const navHomeBtn = document.getElementById('nav-home-btn');
    const navCtaBtn = document.getElementById('nav-cta-btn');
    navHomeBtn.classList.remove('hidden');
    navHomeBtn.classList.add('inline-flex');
    if (navCtaBtn) navCtaBtn.classList.add('hidden');

    document.getElementById('ws-title').textContent = meta.title;
    document.getElementById('ws-desc').textContent = meta.desc;
    document.getElementById('ws-accept-label').textContent = meta.acceptLabel;

    const iconBox = document.getElementById('ws-icon-box');
    iconBox.className = `manga-icon-box shrink-0 ${meta.iconClass}`;
    iconBox.innerHTML = `<i data-lucide="${meta.icon}" class="w-6 h-6"></i>`;

    const input = document.getElementById('ws-file-input');
    input.accept = meta.accept;
    input.multiple = meta.multiple;
    input.value = '';

    if (window.location.hash !== `#${toolId}`) {
        history.replaceState(null, '', `#${toolId}`);
    }

    resetCurrentTool();
    lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeTool() {
    activeTool = null;
    document.getElementById('tool-workspace-view').classList.add('hidden');
    document.getElementById('tools-catalog-view').classList.remove('hidden');

    const navHomeBtn = document.getElementById('nav-home-btn');
    const navCtaBtn = document.getElementById('nav-cta-btn');
    navHomeBtn.classList.add('hidden');
    navHomeBtn.classList.remove('inline-flex');
    if (navCtaBtn) navCtaBtn.classList.remove('hidden');

    if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname);
    }

    resetCurrentTool();
}

function resetCurrentTool() {
    state = { files: [], pages: [], renderedImgs: [], singleFile: null };
    document.getElementById('ws-file-input').value = '';
    document.getElementById('ws-dropzone').classList.remove('hidden');
    document.getElementById('ws-body').classList.add('hidden');
    document.getElementById('ws-body').innerHTML = '';

    const resetBtn = document.getElementById('btn-ws-reset');
    resetBtn.classList.add('hidden');
    resetBtn.classList.remove('inline-flex');
    setStatus(null, '');
}

const dropzone = document.getElementById('ws-dropzone');
const fileInput = document.getElementById('ws-file-input');

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-active');
});
dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-active');
});
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-active');
    if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
    }
});
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFiles(e.target.files);
        e.target.value = '';
    }
});

async function handleFiles(fileList) {
    if (!activeTool) return;
    const filesArr = Array.from(fileList);

    try {
        if (activeTool === 'merge') {
            setStatus('loading', 'Membaca file PDF...');
            for (const f of filesArr) {
                if (!f.name.toLowerCase().endsWith('.pdf')) continue;
                const bytes = await f.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
                state.files.push({ file: f, name: f.name, size: f.size, bytes, pageCount: pdfDoc.getPageCount() });
            }
            setStatus(null, '');
            if (state.files.length === 0) return setStatus('error', 'Harap pilih file PDF yang valid.');
            renderMergeUI();
        } else if (activeTool === 'img2pdf') {
            for (const f of filesArr) {
                if (!f.type.startsWith('image/')) continue;
                const dataUrl = await readFileAsDataURL(f);
                state.files.push({ file: f, name: f.name, size: f.size, dataUrl });
            }
            if (state.files.length === 0) return setStatus('error', 'Harap pilih file gambar JPG/PNG/WebP.');
            renderImg2PdfUI();
        } else if (activeTool === 'split' || activeTool === 'organize') {
            const f = filesArr[0];
            if (!f.name.toLowerCase().endsWith('.pdf')) return setStatus('error', 'Harap pilih file PDF.');
            await loadSinglePdfWithThumbnails(f, activeTool);
        } else if (activeTool === 'compress' || activeTool === 'watermark') {
            const f = filesArr[0];
            if (!f.name.toLowerCase().endsWith('.pdf')) return setStatus('error', 'Harap pilih file PDF.');
            const bytes = await f.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
            state.singleFile = { file: f, name: f.name, size: f.size, bytes, pageCount: pdfDoc.getPageCount() };
            if (activeTool === 'compress') renderCompressUI();
            else renderWatermarkUI();
        } else if (activeTool === 'pdf2img') {
            const f = filesArr[0];
            if (!f.name.toLowerCase().endsWith('.pdf')) return setStatus('error', 'Harap pilih file PDF.');
            const bytes = await f.arrayBuffer();
            state.singleFile = { file: f, name: f.name, size: f.size, bytes };
            renderPdf2ImgUI();
        } else if (activeTool === 'office') {
            await handleOfficeFile(filesArr[0]);
        } else if (activeTool === 'img-optimize' || activeTool === 'img-crop' || activeTool === 'img-upscale') {
            const f = filesArr[0];
            if (!f.type.startsWith('image/')) return setStatus('error', 'Harap pilih file gambar JPG/PNG/WebP.');
            await loadSingleImageTool(f, activeTool);
        } else if (activeTool === 'ocr') {
            await handleOcrFile(filesArr[0]);
        }
    } catch (err) {
        console.error(err);
        setStatus('error', 'Gagal memproses file: ' + (err.message || 'Format file tidak didukung atau terenkripsi.'));
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function showWorkspaceBody() {
    document.getElementById('ws-dropzone').classList.add('hidden');
    document.getElementById('ws-body').classList.remove('hidden');
    const resetBtn = document.getElementById('btn-ws-reset');
    resetBtn.classList.remove('hidden');
    resetBtn.classList.add('inline-flex');
}

// =========================================================================
// 1. MERGE PDF
// =========================================================================
function renderMergeUI() {
    showWorkspaceBody();
    const body = document.getElementById('ws-body');
    const listHtml = state.files.map((item, idx) => `
        <div class="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-paper border-2 border-ink shadow-[3px_3px_0_var(--ink)]">
            <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-lg bg-mangaYellow border-2 border-ink text-onAccent font-black text-xs flex items-center justify-center shrink-0">${idx + 1}</div>
                <div class="min-w-0">
                    <div class="text-xs font-extrabold text-ink truncate">${escapeHtml(item.name)}</div>
                    <div class="text-[11px] text-muted font-semibold">${item.pageCount} halaman • ${formatBytes(item.size)}</div>
                </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
                <button type="button" onclick="moveMergeFile(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} class="p-1.5 rounded-lg bg-surface border-2 border-ink text-ink hover:bg-mangaYellow hover:text-onAccent disabled:opacity-40 cursor-pointer" title="Naikkan">
                    <i data-lucide="arrow-up" class="w-3.5 h-3.5"></i>
                </button>
                <button type="button" onclick="moveMergeFile(${idx}, 1)" ${idx === state.files.length - 1 ? 'disabled' : ''} class="p-1.5 rounded-lg bg-surface border-2 border-ink text-ink hover:bg-mangaYellow hover:text-onAccent disabled:opacity-40 cursor-pointer" title="Turunkan">
                    <i data-lucide="arrow-down" class="w-3.5 h-3.5"></i>
                </button>
                <button type="button" onclick="removeMergeFile(${idx})" class="p-1.5 rounded-lg bg-red-100 border-2 border-ink text-red-700 hover:bg-red-200 cursor-pointer" title="Hapus">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
            </div>
        </div>
    `).join('');

    body.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="text-xs font-black text-ink">Daftar File PDF (${state.files.length} file • Total ${state.files.reduce((a, b) => a + b.pageCount, 0)} halaman)</div>
            <label class="btn-pill btn-pill-white px-3.5 py-2 text-xs">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>Tambah PDF Lagi</span>
                <input type="file" accept=".pdf" multiple class="hidden" onchange="if(this.files.length) handleFiles(this.files)" />
            </label>
        </div>
        <div class="space-y-3">${listHtml}</div>
        <div class="pt-2 flex flex-wrap items-center justify-end gap-3">
            <button type="button" onclick="executeMerge()" ${state.files.length < 2 ? 'disabled' : ''} class="btn-pill btn-pill-yellow px-6 py-3 text-xs">
                <i data-lucide="layers" class="w-4 h-4"></i>
                <span>Gabung & Unduh PDF</span>
            </button>
        </div>
    `;
    lucide.createIcons();
}

function moveMergeFile(idx, dir) {
    const target = idx + dir;
    if (target < 0 || target >= state.files.length) return;
    [state.files[idx], state.files[target]] = [state.files[target], state.files[idx]];
    renderMergeUI();
}

function removeMergeFile(idx) {
    state.files.splice(idx, 1);
    if (state.files.length === 0) resetCurrentTool();
    else renderMergeUI();
}

async function executeMerge() {
    try {
        setStatus('loading', 'Menggabungkan halaman PDF...');
        const mergedPdf = await PDFLib.PDFDocument.create();
        for (const item of state.files) {
            const srcDoc = await PDFLib.PDFDocument.load(item.bytes, { ignoreEncryption: true });
            const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
            copiedPages.forEach((p) => mergedPdf.addPage(p));
        }
        const outBytes = await mergedPdf.save();
        downloadBlob(new Blob([outBytes], { type: 'application/pdf' }), 'merged_swiftdocs.pdf');
        setStatus('success', `Berhasil menggabungkan ${state.files.length} file PDF (${mergedPdf.getPageCount()} halaman)!`);
    } catch (err) {
        setStatus('error', 'Gagal menggabungkan PDF: ' + err.message);
    }
}

// =========================================================================
// 2. SPLIT & 6. ORGANIZE
// =========================================================================
async function loadSinglePdfWithThumbnails(file, mode) {
    setStatus('loading', 'Merender pratinjau halaman PDF...');
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;

    state.singleFile = { file, name: file.name, size: file.size, bytes, pageCount: pdf.numPages };
    state.pages = [];

    const maxPreviewPages = Math.min(pdf.numPages, 40);
    for (let i = 1; i <= pdf.numPages; i++) {
        let thumbUrl = null;
        if (i <= maxPreviewPages) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.3 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
            thumbUrl = canvas.toDataURL('image/jpeg', 0.72);
        }
        state.pages.push({ pageNum: i, thumbUrl, rotation: 0, selected: true, deleted: false });
    }

    setStatus(null, '');
    if (mode === 'split') renderSplitUI();
    else renderOrganizeUI();
}

function renderSplitUI() {
    showWorkspaceBody();
    const body = document.getElementById('ws-body');
    const selectedCount = state.pages.filter(p => p.selected).length;

    const gridHtml = state.pages.map((p, idx) => `
        <div onclick="toggleSplitPage(${idx})" class="cursor-pointer rounded-xl border-2 p-2 text-center transition-all ${p.selected ? 'border-ink bg-mangaYellow/25 shadow-[3px_3px_0_var(--ink)]' : 'border-ink/30 bg-surface opacity-60 hover:opacity-100'}">
            <div class="relative bg-paper rounded-lg overflow-hidden aspect-[3/4] flex items-center justify-center mb-1.5 border border-ink/20">
                ${p.thumbUrl ? `<img src="${p.thumbUrl}" class="w-full h-full object-contain" />` : `<span class="text-xs font-bold text-muted">Hal ${p.pageNum}</span>`}
                <div class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border border-ink ${p.selected ? 'bg-mangaYellow text-onAccent' : 'bg-white text-slate-400'}">
                    ${p.selected ? '✓' : ''}
                </div>
            </div>
            <span class="text-[11px] font-extrabold text-ink">Hal ${p.pageNum}</span>
        </div>
    `).join('');

    body.innerHTML = `
        <div class="p-4 rounded-xl bg-paper border-2 border-ink flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
                <div class="text-xs font-black text-ink">${escapeHtml(state.singleFile.name)}</div>
                <div class="text-[11px] text-muted font-semibold">${state.singleFile.pageCount} halaman • ${selectedCount} halaman dipilih</div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <button type="button" onclick="selectAllSplit(true)" class="btn-pill btn-pill-white px-3 py-1.5 text-[11px]">Pilih Semua</button>
                <button type="button" onclick="selectAllSplit(false)" class="btn-pill btn-pill-white px-3 py-1.5 text-[11px]">Kosongkan</button>
            </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[420px] overflow-y-auto p-1">${gridHtml}</div>

        <div class="pt-3 border-t-2 border-dashed border-ink/20 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onclick="executeSplitZip()" class="btn-pill btn-pill-white px-4 py-2.5 text-xs">
                <i data-lucide="archive" class="w-4 h-4"></i>
                <span>Pecah Semua Jadi File Terpisah (.ZIP)</span>
            </button>
            <button type="button" onclick="executeExtractSelected()" ${selectedCount === 0 ? 'disabled' : ''} class="btn-pill btn-pill-sage px-6 py-2.5 text-xs">
                <i data-lucide="scissors" class="w-4 h-4"></i>
                <span>Ekstrak ${selectedCount} Halaman Terpilih (1 PDF)</span>
            </button>
        </div>
    `;
    lucide.createIcons();
}

function toggleSplitPage(idx) {
    state.pages[idx].selected = !state.pages[idx].selected;
    renderSplitUI();
}

function selectAllSplit(val) {
    state.pages.forEach(p => { p.selected = val; });
    renderSplitUI();
}

async function executeExtractSelected() {
    try {
        const indices = state.pages.filter(p => p.selected).map(p => p.pageNum - 1);
        if (!indices.length) return;
        setStatus('loading', 'Mengekstrak halaman terpilih...');
        const srcDoc = await PDFLib.PDFDocument.load(state.singleFile.bytes, { ignoreEncryption: true });
        const outDoc = await PDFLib.PDFDocument.create();
        const copied = await outDoc.copyPages(srcDoc, indices);
        copied.forEach(p => outDoc.addPage(p));
        const outBytes = await outDoc.save();
        downloadBlob(new Blob([outBytes], { type: 'application/pdf' }), `extracted_${state.singleFile.name}`);
        setStatus('success', `Berhasil mengekstrak ${indices.length} halaman menjadi PDF baru!`);
    } catch (err) {
        setStatus('error', 'Gagal mengekstrak halaman: ' + err.message);
    }
}

async function executeSplitZip() {
    try {
        setStatus('loading', 'Memecah setiap halaman menjadi file terpisah (.ZIP)...');
        const srcDoc = await PDFLib.PDFDocument.load(state.singleFile.bytes, { ignoreEncryption: true });
        const zip = new JSZip();
        const baseName = state.singleFile.name.replace(/\.pdf$/i, '');
        for (let i = 0; i < srcDoc.getPageCount(); i++) {
            const singleDoc = await PDFLib.PDFDocument.create();
            const [page] = await singleDoc.copyPages(srcDoc, [i]);
            singleDoc.addPage(page);
            const bytes = await singleDoc.save();
            zip.file(`${baseName}_hal_${i + 1}.pdf`, bytes);
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(zipBlob, `${baseName}_split_pages.zip`);
        setStatus('success', `Berhasil memecah ${srcDoc.getPageCount()} halaman ke dalam arsip ZIP!`);
    } catch (err) {
        setStatus('error', 'Gagal memecah PDF: ' + err.message);
    }
}

// =========================================================================
// 3. COMPRESS PDF
// =========================================================================
function renderCompressUI() {
    showWorkspaceBody();
    const body = document.getElementById('ws-body');
    body.innerHTML = `
        <div class="p-4 rounded-xl bg-paper border-2 border-ink flex items-center justify-between">
            <div>
                <div class="text-xs font-black text-ink">${escapeHtml(state.singleFile.name)}</div>
                <div class="text-[11px] text-muted font-semibold">Ukuran Asli: <strong class="text-ink">${formatBytes(state.singleFile.size)}</strong> • ${state.singleFile.pageCount} halaman</div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label id="lbl-comp-raster" class="p-4 rounded-xl border-2 border-ink bg-mangaYellow/25 shadow-[3px_3px_0_var(--ink)] cursor-pointer flex items-start gap-3 transition-all">
                <input type="radio" name="compress_mode" value="raster" checked onchange="toggleCompressMode('raster')" class="mt-1" />
                <div>
                    <div class="text-xs font-black text-ink">Kompresi Cerdas (Rekomendasi untuk Scan/Foto)</div>
                    <div class="text-[11px] text-muted font-medium mt-1">Mengompres ulang resolusi & kualitas gambar di tiap halaman sehingga ukuran turun drastis (50–85%).</div>
                </div>
            </label>
            <label id="lbl-comp-lossless" class="p-4 rounded-xl border-2 border-ink bg-surface cursor-pointer flex items-start gap-3 transition-all">
                <input type="radio" name="compress_mode" value="lossless" onchange="toggleCompressMode('lossless')" class="mt-1" />
                <div>
                    <div class="text-xs font-black text-ink">Optimasi Struktur (Teks Tetap Tajam 100%)</div>
                    <div class="text-[11px] text-muted font-medium mt-1">Membersihkan metadata berlebih dan memampatkan object stream PDF tanpa mengubah teks jadi gambar.</div>
                </div>
            </label>
        </div>

        <div id="compress-quality-box" class="p-4 rounded-xl bg-paper border-2 border-ink space-y-2">
            <div class="flex items-center justify-between text-xs font-extrabold text-ink">
                <span>Tingkat Kompresi / Kualitas Gambar</span>
                <span id="compress-q-label" class="font-black">Sedang (Kualitas 65% • Scale 1.3x)</span>
            </div>
            <input type="range" id="compress-q-range" min="1" max="3" value="2" class="w-full" oninput="updateCompressLabel(this.value)" />
            <div class="flex justify-between text-[10px] text-muted font-bold">
                <span>Ukuran Terkecil (45%)</span>
                <span>Seimbang (65%)</span>
                <span>Kualitas Tinggi (82%)</span>
            </div>
        </div>

        <div class="flex justify-end">
            <button type="button" onclick="executeCompress()" class="btn-pill btn-pill-yellow px-6 py-3 text-xs">
                <i data-lucide="minimize-2" class="w-4 h-4"></i>
                <span>Kompres & Unduh PDF</span>
            </button>
        </div>
    `;
    lucide.createIcons();
}

function toggleCompressMode(mode) {
    const box = document.getElementById('compress-quality-box');
    const lRaster = document.getElementById('lbl-comp-raster');
    const lLoss = document.getElementById('lbl-comp-lossless');
    const activeCls = 'p-4 rounded-xl border-2 border-ink bg-mangaYellow/25 shadow-[3px_3px_0_var(--ink)] cursor-pointer flex items-start gap-3 transition-all';
    const inactiveCls = 'p-4 rounded-xl border-2 border-ink bg-surface cursor-pointer flex items-start gap-3 transition-all';

    box.classList.toggle('hidden', mode !== 'raster');
    lRaster.className = mode === 'raster' ? activeCls : inactiveCls;
    lLoss.className = mode === 'raster' ? inactiveCls : activeCls;
}

function updateCompressLabel(val) {
    const lbl = document.getElementById('compress-q-label');
    if (val == 1) lbl.textContent = 'Ekstrem (Kualitas 45% • Scale 1.0x)';
    else if (val == 2) lbl.textContent = 'Sedang (Kualitas 65% • Scale 1.3x)';
    else lbl.textContent = 'Ringan (Kualitas 82% • Scale 1.6x)';
}

async function executeCompress() {
    try {
        const mode = document.querySelector('input[name="compress_mode"]:checked').value;
        let outBytes;

        if (mode === 'lossless') {
            setStatus('loading', 'Mengoptimalkan struktur object stream PDF...');
            const srcDoc = await PDFLib.PDFDocument.load(state.singleFile.bytes, { ignoreEncryption: true });
            srcDoc.setTitle('');
            srcDoc.setAuthor('');
            srcDoc.setSubject('');
            srcDoc.setKeywords([]);
            srcDoc.setProducer('SwiftDocs PDF Optimizer');
            outBytes = await srcDoc.save({ useObjectStreams: true });
        } else {
            const level = parseInt(document.getElementById('compress-q-range').value);
            const scale = level === 1 ? 1.0 : (level === 2 ? 1.3 : 1.6);
            const quality = level === 1 ? 0.45 : (level === 2 ? 0.65 : 0.82);

            const pdf = await pdfjsLib.getDocument({ data: state.singleFile.bytes.slice(0) }).promise;
            const newPdf = await PDFLib.PDFDocument.create();

            for (let i = 1; i <= pdf.numPages; i++) {
                setStatus('loading', `Mengompres halaman ${i} dari ${pdf.numPages}...`);
                const page = await pdf.getPage(i);
                const origVp = page.getViewport({ scale: 1.0 });
                const renderVp = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                canvas.width = renderVp.width;
                canvas.height = renderVp.height;
                await page.render({ canvasContext: canvas.getContext('2d'), viewport: renderVp }).promise;

                const jpgDataUrl = canvas.toDataURL('image/jpeg', quality);
                const jpgImage = await newPdf.embedJpg(jpgDataUrl);
                const newPage = newPdf.addPage([origVp.width, origVp.height]);
                newPage.drawImage(jpgImage, { x: 0, y: 0, width: origVp.width, height: origVp.height });
            }
            outBytes = await newPdf.save({ useObjectStreams: true });
        }

        const origSize = state.singleFile.size;
        const newSize = outBytes.byteLength;
        const diffPct = Math.round(((origSize - newSize) / origSize) * 100);
        const infoText = diffPct > 0
            ? `Berhasil dikompres dari ${formatBytes(origSize)} → ${formatBytes(newSize)} (Hemat ${diffPct}%)!`
            : `Optimasi selesai (${formatBytes(newSize)}). File asli sudah sangat terkompresi.`;

        downloadBlob(new Blob([outBytes], { type: 'application/pdf' }), `compressed_${state.singleFile.name}`);
        setStatus('success', infoText);
    } catch (err) {
        setStatus('error', 'Gagal mengompres PDF: ' + err.message);
    }
}

// =========================================================================
// 4. PDF TO IMAGE
// =========================================================================
function renderPdf2ImgUI() {
    showWorkspaceBody();
    const body = document.getElementById('ws-body');
    body.innerHTML = `
        <div class="p-4 rounded-xl bg-paper border-2 border-ink flex flex-wrap items-center justify-between gap-4">
            <div>
                <div class="text-xs font-black text-ink">${escapeHtml(state.singleFile.name)}</div>
                <div class="text-[11px] text-muted font-semibold">Ukuran: ${formatBytes(state.singleFile.size)}</div>
            </div>
            <div class="flex flex-wrap items-center gap-3">
                <select id="p2i-format" class="px-3 py-2 rounded-xl border-2 border-ink bg-surface text-xs font-bold text-ink">
                    <option value="png">Format: PNG (Tajam)</option>
                    <option value="jpeg">Format: JPG (Ringan)</option>
                </select>
                <select id="p2i-scale" class="px-3 py-2 rounded-xl border-2 border-ink bg-surface text-xs font-bold text-ink">
                    <option value="1.5">Resolusi: Standard (1.5x)</option>
                    <option value="2.5" selected>Resolusi: HD (2.5x)</option>
                </select>
                <button type="button" onclick="executePdf2Img()" class="btn-pill btn-pill-sage px-5 py-2.5 text-xs">
                    <i data-lucide="image" class="w-4 h-4"></i>
                    <span>Konversi Sekarang</span>
                </button>
            </div>
        </div>
        <div id="p2i-results" class="hidden space-y-4"></div>
    `;
    lucide.createIcons();
}

async function executePdf2Img() {
    try {
        const fmt = document.getElementById('p2i-format').value;
        const scale = parseFloat(document.getElementById('p2i-scale').value);
        const ext = fmt === 'png' ? 'png' : 'jpg';
        const mime = fmt === 'png' ? 'image/png' : 'image/jpeg';

        const pdf = await pdfjsLib.getDocument({ data: state.singleFile.bytes.slice(0) }).promise;
        state.renderedImgs = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            setStatus('loading', `Merender halaman ${i} dari ${pdf.numPages} ke ${ext.toUpperCase()}...`);
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
            const dataUrl = canvas.toDataURL(mime, 0.92);
            state.renderedImgs.push({ pageNum: i, dataUrl, ext });
        }

        const resultsEl = document.getElementById('p2i-results');
        resultsEl.classList.remove('hidden');
        resultsEl.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-xs font-black text-ink">Hasil Konversi (${state.renderedImgs.length} Gambar)</span>
                <button type="button" onclick="downloadAllImagesZip()" class="btn-pill btn-pill-yellow px-4 py-2 text-xs">
                    <i data-lucide="download" class="w-3.5 h-3.5"></i>
                    <span>Unduh Semua (.ZIP)</span>
                </button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                ${state.renderedImgs.map(img => `
                    <div class="rounded-xl border-2 border-ink bg-surface p-2.5 flex flex-col gap-2 shadow-[3px_3px_0_var(--ink)]">
                        <img src="${img.dataUrl}" class="w-full aspect-[3/4] object-contain bg-paper rounded-lg border border-ink/20" />
                        <a href="${img.dataUrl}" download="halaman_${img.pageNum}.${img.ext}" class="btn-pill btn-pill-white w-full py-1.5 text-[11px]">
                            Unduh Hal ${img.pageNum}
                        </a>
                    </div>
                `).join('')}
            </div>
        `;
        lucide.createIcons();
        setStatus('success', `Berhasil mengonversi ${state.renderedImgs.length} halaman PDF menjadi gambar ${ext.toUpperCase()}!`);
    } catch (err) {
        setStatus('error', 'Gagal mengonversi PDF ke gambar: ' + err.message);
    }
}

async function downloadAllImagesZip() {
    const zip = new JSZip();
    const baseName = state.singleFile.name.replace(/\.pdf$/i, '');
    state.renderedImgs.forEach(img => {
        const base64 = img.dataUrl.split(',')[1];
        zip.file(`${baseName}_hal_${img.pageNum}.${img.ext}`, base64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${baseName}_images.zip`);
}

// =========================================================================
// 5. IMAGE TO PDF
// =========================================================================
function renderImg2PdfUI() {
    showWorkspaceBody();
    const body = document.getElementById('ws-body');
    const listHtml = state.files.map((item, idx) => `
        <div class="rounded-xl border-2 border-ink bg-surface p-2.5 flex flex-col justify-between gap-2 shadow-[3px_3px_0_var(--ink)]">
            <div class="relative bg-paper rounded-lg overflow-hidden aspect-square flex items-center justify-center border border-ink/20">
                <img src="${item.dataUrl}" class="w-full h-full object-contain" />
                <span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-mangaYellow border border-ink text-onAccent text-[10px] font-black">${idx + 1}</span>
            </div>
            <div class="text-[11px] font-bold text-ink truncate">${escapeHtml(item.name)}</div>
            <div class="flex items-center justify-between gap-1">
                <button type="button" onclick="moveImgFile(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} class="p-1 rounded bg-paper border border-ink hover:bg-mangaYellow hover:text-onAccent disabled:opacity-40 cursor-pointer"><i data-lucide="chevron-left" class="w-3.5 h-3.5"></i></button>
                <button type="button" onclick="removeImgFile(${idx})" class="p-1 rounded bg-red-100 border border-ink text-red-700 hover:bg-red-200 cursor-pointer"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                <button type="button" onclick="moveImgFile(${idx}, 1)" ${idx === state.files.length - 1 ? 'disabled' : ''} class="p-1 rounded bg-paper border border-ink hover:bg-mangaYellow hover:text-onAccent disabled:opacity-40 cursor-pointer"><i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></button>
            </div>
        </div>
    `).join('');

    body.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="text-xs font-black text-ink">${state.files.length} Gambar Terpilih</div>
            <div class="flex flex-wrap items-center gap-2">
                <select id="i2p-size" class="px-3 py-2 rounded-xl border-2 border-ink bg-surface text-xs font-bold text-ink">
                    <option value="a4">Ukuran Kertas: A4</option>
                    <option value="fit">Ukuran Asli Gambar (Fit)</option>
                </select>
                <select id="i2p-margin" class="px-3 py-2 rounded-xl border-2 border-ink bg-surface text-xs font-bold text-ink">
                    <option value="20">Margin: Kecil</option>
                    <option value="0">Tanpa Margin</option>
                </select>
                <label class="btn-pill btn-pill-white px-3.5 py-2 text-xs">
                    <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                    <span>Tambah Gambar</span>
                    <input type="file" accept="image/*" multiple class="hidden" onchange="if(this.files.length) handleFiles(this.files)" />
                </label>
            </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">${listHtml}</div>
        <div class="pt-2 flex justify-end">
            <button type="button" onclick="executeImg2Pdf()" class="btn-pill btn-pill-yellow px-6 py-3 text-xs">
                <i data-lucide="file-image" class="w-4 h-4"></i>
                <span>Buat & Unduh PDF</span>
            </button>
        </div>
    `;
    lucide.createIcons();
}

function moveImgFile(idx, dir) {
    const target = idx + dir;
    if (target < 0 || target >= state.files.length) return;
    [state.files[idx], state.files[target]] = [state.files[target], state.files[idx]];
    renderImg2PdfUI();
}

function removeImgFile(idx) {
    state.files.splice(idx, 1);
    if (state.files.length === 0) resetCurrentTool();
    else renderImg2PdfUI();
}

async function executeImg2Pdf() {
    try {
        setStatus('loading', 'Menyusun gambar ke dalam halaman PDF...');
        const sizeOpt = document.getElementById('i2p-size').value;
        const margin = parseInt(document.getElementById('i2p-margin').value);
        const pdfDoc = await PDFLib.PDFDocument.create();

        for (const item of state.files) {
            const imgBytes = await convertImageToStandardBytes(item.dataUrl, item.file.type);
            const embedded = imgBytes.type === 'png'
                ? await pdfDoc.embedPng(imgBytes.bytes)
                : await pdfDoc.embedJpg(imgBytes.bytes);

            const imgW = embedded.width;
            const imgH = embedded.height;

            if (sizeOpt === 'fit') {
                const page = pdfDoc.addPage([imgW + margin * 2, imgH + margin * 2]);
                page.drawImage(embedded, { x: margin, y: margin, width: imgW, height: imgH });
            } else {
                const isLandscape = imgW > imgH;
                const pageW = isLandscape ? 841.89 : 595.28;
                const pageH = isLandscape ? 595.28 : 841.89;
                const page = pdfDoc.addPage([pageW, pageH]);

                const availW = pageW - margin * 2;
                const availH = pageH - margin * 2;
                const ratio = Math.min(availW / imgW, availH / imgH);
                const drawW = imgW * ratio;
                const drawH = imgH * ratio;
                const x = (pageW - drawW) / 2;
                const y = (pageH - drawH) / 2;
                page.drawImage(embedded, { x, y, width: drawW, height: drawH });
            }
        }

        const outBytes = await pdfDoc.save();
        downloadBlob(new Blob([outBytes], { type: 'application/pdf' }), 'images_to_pdf_swiftdocs.pdf');
        setStatus('success', `Berhasil membuat PDF dari ${state.files.length} gambar!`);
    } catch (err) {
        setStatus('error', 'Gagal membuat PDF: ' + err.message);
    }
}

function convertImageToStandardBytes(dataUrl, mime) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            const isPng = mime === 'image/png';
            if (!isPng) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0);
            const outMime = isPng ? 'image/png' : 'image/jpeg';
            canvas.toBlob(async (blob) => {
                const bytes = await blob.arrayBuffer();
                resolve({ type: isPng ? 'png' : 'jpg', bytes });
            }, outMime, 0.92);
        };
        img.src = dataUrl;
    });
}

// =========================================================================
// 6. ORGANIZE & ROTATE PDF
// =========================================================================
function renderOrganizeUI() {
    showWorkspaceBody();
    const body = document.getElementById('ws-body');
    const activeCount = state.pages.filter(p => !p.deleted).length;

    const gridHtml = state.pages.map((p, idx) => `
        <div class="rounded-xl border-2 border-ink p-2.5 flex flex-col justify-between gap-2 transition-all ${p.deleted ? 'bg-red-50 opacity-50' : 'bg-surface shadow-[3px_3px_0_var(--ink)]'}">
            <div class="relative bg-paper rounded-lg overflow-hidden aspect-[3/4] flex items-center justify-center border border-ink/20">
                ${p.thumbUrl ? `<img src="${p.thumbUrl}" style="transform: rotate(${p.rotation}deg);" class="w-full h-full object-contain transition-transform" />` : `<span class="text-xs font-bold text-muted">Hal ${p.pageNum}</span>`}
                ${p.deleted ? `<span class="absolute inset-0 bg-red-900/50 text-white text-[10px] font-black flex items-center justify-center">DIHAPUS</span>` : ''}
            </div>
            <div class="text-center text-[11px] font-extrabold text-ink">Hal ${p.pageNum} ${p.rotation ? `(${p.rotation}°)` : ''}</div>
            <div class="flex items-center justify-center gap-1.5">
                <button type="button" onclick="rotatePageItem(${idx})" ${p.deleted ? 'disabled' : ''} class="flex-1 py-1.5 rounded-lg bg-mangaYellow border border-ink text-onAccent text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40" title="Putar 90°">
                    <i data-lucide="rotate-cw" class="w-3 h-3"></i>
                    <span>90°</span>
                </button>
                <button type="button" onclick="toggleDeletePageItem(${idx})" class="p-1.5 rounded-lg border border-ink ${p.deleted ? 'bg-slate-200 text-slate-900' : 'bg-red-100 text-red-700 hover:bg-red-200'} cursor-pointer" title="${p.deleted ? 'Pulihkan' : 'Hapus'}">
                    <i data-lucide="${p.deleted ? 'undo-2' : 'trash-2'}" class="w-3.5 h-3.5"></i>
                </button>
            </div>
        </div>
    `).join('');

    body.innerHTML = `
        <div class="p-4 rounded-xl bg-paper border-2 border-ink flex flex-wrap items-center justify-between gap-3">
            <div>
                <div class="text-xs font-black text-ink">${escapeHtml(state.singleFile.name)}</div>
                <div class="text-[11px] text-muted font-semibold">${activeCount} halaman aktif dari ${state.pages.length} halaman</div>
            </div>
            <button type="button" onclick="rotateAllPages()" class="btn-pill btn-pill-white px-3.5 py-2 text-xs">
                <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
                <span>Putar Semua 90°</span>
            </button>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[420px] overflow-y-auto p-1">${gridHtml}</div>
        <div class="pt-2 flex justify-end">
            <button type="button" onclick="executeOrganize()" ${activeCount === 0 ? 'disabled' : ''} class="btn-pill btn-pill-sage px-6 py-3 text-xs">
                <i data-lucide="save" class="w-4 h-4"></i>
                <span>Simpan & Unduh PDF Baru</span>
            </button>
        </div>
    `;
    lucide.createIcons();
}

function rotatePageItem(idx) {
    state.pages[idx].rotation = (state.pages[idx].rotation + 90) % 360;
    renderOrganizeUI();
}

function rotateAllPages() {
    state.pages.forEach(p => { if (!p.deleted) p.rotation = (p.rotation + 90) % 360; });
    renderOrganizeUI();
}

function toggleDeletePageItem(idx) {
    state.pages[idx].deleted = !state.pages[idx].deleted;
    renderOrganizeUI();
}

async function executeOrganize() {
    try {
        const activePages = state.pages.filter(p => !p.deleted);
        if (!activePages.length) return;
        setStatus('loading', 'Menyimpan perubahan orientasi dan halaman...');
        const srcDoc = await PDFLib.PDFDocument.load(state.singleFile.bytes, { ignoreEncryption: true });
        const outDoc = await PDFLib.PDFDocument.create();
        for (const pInfo of activePages) {
            const [copied] = await outDoc.copyPages(srcDoc, [pInfo.pageNum - 1]);
            if (pInfo.rotation !== 0) {
                const currentRot = copied.getRotation().angle;
                copied.setRotation(PDFLib.degrees((currentRot + pInfo.rotation) % 360));
            }
            outDoc.addPage(copied);
        }
        const outBytes = await outDoc.save();
        downloadBlob(new Blob([outBytes], { type: 'application/pdf' }), `organized_${state.singleFile.name}`);
        setStatus('success', `Berhasil menyimpan PDF baru (${activePages.length} halaman)!`);
    } catch (err) {
        setStatus('error', 'Gagal menyimpan PDF: ' + err.message);
    }
}

// =========================================================================
// 7. WATERMARK PDF
// =========================================================================
function renderWatermarkUI() {
    showWorkspaceBody();
    const body = document.getElementById('ws-body');
    body.innerHTML = `
        <div class="p-4 rounded-xl bg-paper border-2 border-ink">
            <div class="text-xs font-black text-ink">${escapeHtml(state.singleFile.name)}</div>
            <div class="text-[11px] text-muted font-semibold">${state.singleFile.pageCount} halaman akan diberi watermark teks</div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-extrabold text-ink mb-1.5">Teks Watermark</label>
                <input type="text" id="wm-text" value="DOKUMEN RAHASIA - SWIFTDOCS" class="w-full px-3.5 py-2.5 rounded-xl border-2 border-ink bg-surface text-xs font-bold text-ink focus:outline-none" />
            </div>
            <div>
                <label class="block text-xs font-extrabold text-ink mb-1.5">Warna Teks</label>
                <select id="wm-color" class="w-full px-3.5 py-2.5 rounded-xl border-2 border-ink bg-surface text-xs font-bold text-ink">
                    <option value="red">Merah (#e11d48)</option>
                    <option value="slate">Hitam / Charcoal</option>
                    <option value="blue">Biru Korporat</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-extrabold text-ink mb-1.5">Ukuran Font: <span id="wm-size-val">42</span>pt</label>
                <input type="range" id="wm-size" min="20" max="80" value="42" class="w-full" oninput="document.getElementById('wm-size-val').textContent=this.value" />
            </div>
            <div>
                <label class="block text-xs font-extrabold text-ink mb-1.5">Transparansi (Opacity): <span id="wm-op-val">25</span>%</label>
                <input type="range" id="wm-opacity" min="10" max="80" value="25" class="w-full" oninput="document.getElementById('wm-op-val').textContent=this.value" />
            </div>
        </div>
        <div class="pt-2 flex justify-end">
            <button type="button" onclick="executeWatermark()" class="btn-pill btn-pill-yellow px-6 py-3 text-xs">
                <i data-lucide="stamp" class="w-4 h-4"></i>
                <span>Terapkan Watermark & Unduh PDF</span>
            </button>
        </div>
    `;
    lucide.createIcons();
}

async function executeWatermark() {
    try {
        const text = document.getElementById('wm-text').value.trim().replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
        if (!text) return setStatus('error', 'Harap isi teks watermark (huruf/angka standar) terlebih dahulu.');
        const colorOpt = document.getElementById('wm-color').value;
        const fontSize = parseInt(document.getElementById('wm-size').value);
        const opacity = parseInt(document.getElementById('wm-opacity').value) / 100;

        setStatus('loading', 'Menambahkan watermark ke seluruh halaman...');
        const pdfDoc = await PDFLib.PDFDocument.load(state.singleFile.bytes, { ignoreEncryption: true });
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

        let rgbColor = PDFLib.rgb(0.88, 0.11, 0.28);
        if (colorOpt === 'slate') rgbColor = PDFLib.rgb(0.27, 0.28, 0.29);
        else if (colorOpt === 'blue') rgbColor = PDFLib.rgb(0.1, 0.35, 0.85);

        const pages = pdfDoc.getPages();
        pages.forEach(page => {
            const { width, height } = page.getSize();
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            page.drawText(text, {
                x: width / 2 - (textWidth * Math.cos(Math.PI / 4)) / 2,
                y: height / 2 - (textWidth * Math.sin(Math.PI / 4)) / 2,
                size: fontSize,
                font,
                color: rgbColor,
                opacity,
                rotate: PDFLib.degrees(45)
            });
        });

        const outBytes = await pdfDoc.save();
        downloadBlob(new Blob([outBytes], { type: 'application/pdf' }), `watermarked_${state.singleFile.name}`);
        setStatus('success', `Watermark berhasil diterapkan pada ${pages.length} halaman!`);
    } catch (err) {
        setStatus('error', 'Gagal menambahkan watermark: ' + err.message);
    }
}

// =========================================================================
// 8. OFFICE VIEWER & PRINT TO PDF
// =========================================================================
async function handleOfficeFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    setStatus('loading', 'Membaca dan merender dokumen Office...');
    const bytes = await file.arrayBuffer();
    let htmlPreview = '';

    if (ext === 'docx') {
        const result = await mammoth.convertToHtml({ arrayBuffer: bytes });
        htmlPreview = `<div class="office-prose max-w-none text-slate-900 space-y-2">${result.value}</div>`;
    } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
        const workbook = XLSX.read(bytes, { type: 'array' });
        htmlPreview = workbook.SheetNames.map(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const tableHtml = XLSX.utils.sheet_to_html(sheet);
            return `
                <div class="mb-6">
                    ${workbook.SheetNames.length > 1 ? `<div class="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-t-lg border-2 border-b-0 border-slate-300">Sheet: ${escapeHtml(sheetName)}</div>` : ''}
                    <div class="overflow-x-auto office-table-wrapper">${tableHtml}</div>
                </div>
            `;
        }).join('');
    } else if (ext === 'doc') {
        return setStatus('error', 'Format .doc lama (Word 97-2003) belum didukung. Harap Save As ke .docx terlebih dahulu.');
    } else {
        return setStatus('error', 'Format tidak didukung. Harap pilih .docx, .xlsx, .xls, atau .csv');
    }

    setStatus(null, '');
    showWorkspaceBody();
    const body = document.getElementById('ws-body');
    body.innerHTML = `
        <div class="p-4 rounded-xl bg-paper border-2 border-ink flex flex-wrap items-center justify-between gap-3">
            <div>
                <div class="text-xs font-black text-ink">${escapeHtml(file.name)}</div>
                <div class="text-[11px] text-muted font-semibold">Ukuran: ${formatBytes(file.size)} • Pratinjau Siap Cetak ke PDF</div>
            </div>
            <button type="button" onclick="printOfficePreview()" class="btn-pill btn-pill-sage px-5 py-2.5 text-xs">
                <i data-lucide="printer" class="w-4 h-4"></i>
                <span>Cetak / Simpan sebagai PDF</span>
            </button>
        </div>
        <div id="office-print-area" class="p-6 sm:p-10 bg-white text-slate-900 border-2 border-ink rounded-xl shadow-[4px_4px_0_var(--ink)] max-h-[520px] overflow-y-auto text-sm leading-relaxed">
            ${htmlPreview}
        </div>
    `;
    lucide.createIcons();
}

function printOfficePreview() {
    const content = document.getElementById('office-print-area').innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cetak Dokumen Office - SwiftDocs</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; color: #0f172a; line-height: 1.6; }
                table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 12px; }
                th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
                th { background: #f1f5f9; font-weight: bold; }
                img { max-width: 100%; height: auto; }
            </style>
        </head>
        <body>${content}</body>
        </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
}

// =========================================================================
// 9, 10, 11. IMAGE TOOLS HELPER (RESIZE/COMPRESS, CROP, HD UPSCALE)
// =========================================================================
function loadImageElement(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Gagal memuat gambar.'));
        img.src = src;
    });
}

async function loadSingleImageTool(file, mode) {
    setStatus('loading', 'Memuat gambar...');
    const dataUrl = await readFileAsDataURL(file);
    const img = await loadImageElement(dataUrl);
    state.singleFile = {
        file,
        name: file.name,
        size: file.size,
        dataUrl,
        img,
        width: img.naturalWidth,
        height: img.naturalHeight
    };
    setStatus(null, '');
    if (mode === 'img-optimize') renderImgOptimizeUI();
    else if (mode === 'img-crop') renderImgCropUI();
    else if (mode === 'img-upscale') renderImgUpscaleUI();
}

// =========================================================================
// 9. RESIZE & KOMPRES GAMBAR
// =========================================================================
function renderImgOptimizeUI() {
    showWorkspaceBody();
    const f = state.singleFile;
    const body = document.getElementById('ws-body');
    body.innerHTML = `
        <div class="p-4 rounded-xl bg-paper border-2 border-ink flex flex-wrap items-center justify-between gap-3">
            <div>
                <div class="text-xs font-black text-ink">${escapeHtml(f.name)}</div>
                <div class="text-[11px] text-muted font-semibold">Dimensi Asli: <strong class="text-ink">${f.width} × ${f.height} px</strong> • Ukuran: <strong class="text-ink">${formatBytes(f.size)}</strong></div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <div class="rounded-xl border-2 border-ink bg-paper p-3 flex items-center justify-center max-h-[320px] overflow-hidden">
                <img src="${f.dataUrl}" class="max-h-[280px] object-contain rounded-lg" />
            </div>

            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-extrabold text-ink mb-1">Lebar (px)</label>
                        <input type="number" id="opt-width" value="${f.width}" min="16" max="8000" oninput="syncResizeDim('w')" class="w-full px-3 py-2 rounded-xl border-2 border-ink bg-surface text-xs font-bold text-ink" />
                    </div>
                    <div>
                        <label class="block text-xs font-extrabold text-ink mb-1">Tinggi (px)</label>
                        <input type="number" id="opt-height" value="${f.height}" min="16" max="8000" oninput="syncResizeDim('h')" class="w-full px-3 py-2 rounded-xl border-2 border-ink bg-surface text-xs font-bold text-ink" />
                    </div>
                </div>

                <label class="inline-flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
                    <input type="checkbox" id="opt-lock-ratio" checked class="w-4 h-4" />
                    <span>Kunci Rasio Asli (Proporsional)</span>
                </label>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-extrabold text-ink mb-1">Format Output</label>
                        <select id="opt-format" onchange="toggleOptQuality()" class="w-full px-3 py-2 rounded-xl border-2 border-ink bg-surface text-xs font-bold text-ink">
                            <option value="image/jpeg">JPG (Ringan)</option>
                            <option value="image/webp">WebP (Paling Hemat)</option>
                            <option value="image/png">PNG (Lossless)</option>
                        </select>
                    </div>
                    <div id="opt-quality-wrap">
                        <label class="block text-xs font-extrabold text-ink mb-1">Kualitas: <span id="opt-q-val">75</span>%</label>
                        <input type="range" id="opt-quality" min="15" max="100" value="75" class="w-full mt-2" oninput="document.getElementById('opt-q-val').textContent=this.value" />
                    </div>
                </div>

                <button type="button" onclick="executeImgOptimize()" class="btn-pill btn-pill-yellow w-full py-3 text-xs">
                    <i data-lucide="scaling" class="w-4 h-4"></i>
                    <span>Proses & Unduh Gambar</span>
                </button>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function syncResizeDim(changed) {
    const lock = document.getElementById('opt-lock-ratio').checked;
    if (!lock) return;
    const wEl = document.getElementById('opt-width');
    const hEl = document.getElementById('opt-height');
    const ratio = state.singleFile.width / state.singleFile.height;
    if (changed === 'w') {
        const w = parseInt(wEl.value) || 1;
        hEl.value = Math.max(1, Math.round(w / ratio));
    } else {
        const h = parseInt(hEl.value) || 1;
        wEl.value = Math.max(1, Math.round(h * ratio));
    }
}

function toggleOptQuality() {
    const fmt = document.getElementById('opt-format').value;
    document.getElementById('opt-quality-wrap').classList.toggle('opacity-40', fmt === 'image/png');
}

function executeImgOptimize() {
    const w = Math.max(16, parseInt(document.getElementById('opt-width').value) || state.singleFile.width);
    const h = Math.max(16, parseInt(document.getElementById('opt-height').value) || state.singleFile.height);
    const fmt = document.getElementById('opt-format').value;
    const q = parseInt(document.getElementById('opt-quality').value) / 100;
    const ext = fmt === 'image/png' ? 'png' : (fmt === 'image/webp' ? 'webp' : 'jpg');

    setStatus('loading', 'Mengubah ukuran & mengompres gambar...');
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (fmt === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(state.singleFile.img, 0, 0, w, h);

    canvas.toBlob((blob) => {
        if (!blob) return setStatus('error', 'Gagal memproses gambar.');
        const baseName = state.singleFile.name.replace(/\.[^.]+$/, '');
        downloadBlob(blob, `${baseName}_${w}x${h}.${ext}`);
        const diffPct = Math.round(((state.singleFile.size - blob.size) / state.singleFile.size) * 100);
        const msg = diffPct > 0
            ? `Selesai! ${w}×${h}px • ${formatBytes(state.singleFile.size)} → ${formatBytes(blob.size)} (Hemat ${diffPct}%)`
            : `Selesai! ${w}×${h}px • Ukuran baru: ${formatBytes(blob.size)}`;
        setStatus('success', msg);
    }, fmt, q);
}

// =========================================================================
// 10. CROP & PUTAR GAMBAR
// =========================================================================
let cropState = {
    rot: 0,
    flipH: false,
    aspect: 0,
    box: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 }, // Normalized 0..1
    dragging: false,
    startX: 0,
    startY: 0,
    workCanvas: null
};

function renderImgCropUI() {
    showWorkspaceBody();
    cropState.rot = 0;
    cropState.flipH = false;
    cropState.aspect = 0;
    cropState.box = { x: 0.08, y: 0.08, w: 0.84, h: 0.84 };

    const body = document.getElementById('ws-body');
    body.innerHTML = `
        <div class="p-4 rounded-xl bg-paper border-2 border-ink flex flex-wrap items-center justify-between gap-3">
            <div class="text-xs font-black text-ink">${escapeHtml(state.singleFile.name)} <span class="text-muted font-semibold">(${state.singleFile.width}×${state.singleFile.height}px)</span></div>
            <div class="flex flex-wrap items-center gap-2">
                <button type="button" onclick="cropRotate()" class="btn-pill btn-pill-white px-3 py-1.5 text-[11px]"><i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i> Putar 90°</button>
                <button type="button" onclick="cropFlip()" class="btn-pill btn-pill-white px-3 py-1.5 text-[11px]"><i data-lucide="flip-horizontal" class="w-3.5 h-3.5"></i> Flip</button>
                <button type="button" onclick="setCropAspect(0)" class="btn-pill btn-pill-white px-3 py-1.5 text-[11px]">Bebas</button>
                <button type="button" onclick="setCropAspect(1)" class="btn-pill btn-pill-white px-3 py-1.5 text-[11px]">1:1</button>
                <button type="button" onclick="setCropAspect(4/3)" class="btn-pill btn-pill-white px-3 py-1.5 text-[11px]">4:3</button>
                <button type="button" onclick="setCropAspect(16/9)" class="btn-pill btn-pill-white px-3 py-1.5 text-[11px]">16:9</button>
            </div>
        </div>

        <div class="text-[11px] font-bold text-muted text-center">Klik & geser pada gambar di bawah untuk menentukan area crop!</div>

        <div class="flex justify-center bg-paper border-2 border-ink rounded-2xl p-3 overflow-hidden">
            <canvas id="crop-canvas" class="max-w-full max-h-[420px] cursor-crosshair rounded-lg touch-none"></canvas>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-3">
            <select id="crop-format" class="px-3 py-2.5 rounded-xl border-2 border-ink bg-surface text-xs font-bold text-ink">
                <option value="image/png">Format: PNG</option>
                <option value="image/jpeg">Format: JPG</option>
            </select>
            <button type="button" onclick="executeImgCrop()" class="btn-pill btn-pill-sage px-6 py-3 text-xs">
                <i data-lucide="crop" class="w-4 h-4"></i>
                <span>Potong & Unduh Gambar</span>
            </button>
        </div>
    `;
    lucide.createIcons();
    buildTransformedCropSource();
    bindCropCanvasEvents();
    drawCropCanvas();
}

function buildTransformedCropSource() {
    const img = state.singleFile.img;
    const swap = cropState.rot % 180 !== 0;
    const w = swap ? img.naturalHeight : img.naturalWidth;
    const h = swap ? img.naturalWidth : img.naturalHeight;
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const ctx = off.getContext('2d');
    ctx.translate(w / 2, h / 2);
    ctx.rotate((cropState.rot * Math.PI) / 180);
    if (cropState.flipH) ctx.scale(-1, 1);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    cropState.workCanvas = off;
}

function cropRotate() {
    cropState.rot = (cropState.rot + 90) % 360;
    buildTransformedCropSource();
    drawCropCanvas();
}

function cropFlip() {
    cropState.flipH = !cropState.flipH;
    buildTransformedCropSource();
    drawCropCanvas();
}

function setCropAspect(aspect) {
    cropState.aspect = aspect;
    if (aspect > 0 && cropState.workCanvas) {
        const cw = cropState.workCanvas.width;
        const ch = cropState.workCanvas.height;
        let bw = 0.7;
        let bh = (bw * cw) / (aspect * ch);
        if (bh > 0.85) {
            bh = 0.85;
            bw = (bh * ch * aspect) / cw;
        }
        cropState.box = { x: (1 - bw) / 2, y: (1 - bh) / 2, w: bw, h: bh };
    } else {
        cropState.box = { x: 0.08, y: 0.08, w: 0.84, h: 0.84 };
    }
    drawCropCanvas();
}

function drawCropCanvas() {
    const canvas = document.getElementById('crop-canvas');
    const src = cropState.workCanvas;
    if (!canvas || !src) return;
    canvas.width = src.width;
    canvas.height = src.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(src, 0, 0);

    // Darken outside crop box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bx = cropState.box.x * canvas.width;
    const by = cropState.box.y * canvas.height;
    const bw = cropState.box.w * canvas.width;
    const bh = cropState.box.h * canvas.height;

    ctx.drawImage(src, bx, by, bw, bh, bx, by, bw, bh);
    ctx.strokeStyle = '#FF9A00';
    ctx.lineWidth = Math.max(3, canvas.width / 220);
    ctx.strokeRect(bx, by, bw, bh);
}

function bindCropCanvasEvents() {
    const canvas = document.getElementById('crop-canvas');
    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
            y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
        };
    };

    const start = (e) => {
        const p = getPos(e);
        cropState.dragging = true;
        cropState.startX = p.x;
        cropState.startY = p.y;
    };

    const move = (e) => {
        if (!cropState.dragging) return;
        const p = getPos(e);
        let x = Math.min(cropState.startX, p.x);
        let y = Math.min(cropState.startY, p.y);
        let w = Math.abs(p.x - cropState.startX);
        let h = Math.abs(p.y - cropState.startY);
        if (cropState.aspect > 0 && cropState.workCanvas) {
            h = (w * cropState.workCanvas.width) / (cropState.aspect * cropState.workCanvas.height);
            if (y + h > 1) h = 1 - y;
        }
        if (w > 0.03 && h > 0.03) {
            cropState.box = { x, y, w, h };
            drawCropCanvas();
        }
    };

    const end = () => { cropState.dragging = false; };

    canvas.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: true });
    canvas.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', end);
}

function executeImgCrop() {
    const src = cropState.workCanvas;
    if (!src) return;
    const sx = Math.round(cropState.box.x * src.width);
    const sy = Math.round(cropState.box.y * src.height);
    const sw = Math.max(10, Math.round(cropState.box.w * src.width));
    const sh = Math.max(10, Math.round(cropState.box.h * src.height));
    const fmt = document.getElementById('crop-format').value;
    const ext = fmt === 'image/png' ? 'png' : 'jpg';

    const out = document.createElement('canvas');
    out.width = sw;
    out.height = sh;
    const ctx = out.getContext('2d');
    if (fmt === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sw, sh);
    }
    ctx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);

    out.toBlob((blob) => {
        const baseName = state.singleFile.name.replace(/\.[^.]+$/, '');
        downloadBlob(blob, `${baseName}_cropped.${ext}`);
        setStatus('success', `Gambar berhasil dipotong (${sw}×${sh} px)!`);
    }, fmt, 0.94);
}

// =========================================================================
// 11. NAIKIN RESOLUSI GAMBAR (HD UPSCALE + SHARPEN)
// =========================================================================
function renderImgUpscaleUI() {
    showWorkspaceBody();
    const f = state.singleFile;
    const body = document.getElementById('ws-body');
    body.innerHTML = `
        <div class="p-4 rounded-xl bg-paper border-2 border-ink flex flex-wrap items-center justify-between gap-3">
            <div>
                <div class="text-xs font-black text-ink">${escapeHtml(f.name)}</div>
                <div class="text-[11px] text-muted font-semibold">Resolusi Asli: <strong class="text-ink">${f.width} × ${f.height} px</strong></div>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-extrabold text-ink mb-1.5">Faktor Perbesaran Resolusi</label>
                <select id="up-scale" class="w-full px-3.5 py-2.5 rounded-xl border-2 border-ink bg-surface text-xs font-bold text-ink">
                    <option value="2">2× HD (${f.width * 2} × ${f.height * 2} px)</option>
                    <option value="3">3× Ultra (${f.width * 3} × ${f.height * 3} px)</option>
                    <option value="4">4× Max (${f.width * 4} × ${f.height * 4} px)</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-extrabold text-ink mb-1.5">Filter Penajam (Sharpening)</label>
                <select id="up-sharp" class="w-full px-3.5 py-2.5 rounded-xl border-2 border-ink bg-surface text-xs font-bold text-ink">
                    <option value="0.25">Halus (Natural)</option>
                    <option value="0.45" selected>Tajam (Rekomendasi)</option>
                    <option value="0">Tanpa Penajam</option>
                </select>
            </div>
        </div>

        <div class="flex justify-end">
            <button type="button" onclick="executeImgUpscale()" class="btn-pill btn-pill-yellow px-6 py-3 text-xs">
                <i data-lucide="sparkles" class="w-4 h-4"></i>
                <span>Naikkan Resolusi & Unduh PNG</span>
            </button>
        </div>
    `;
    lucide.createIcons();
}

function applySharpenFilter(ctx, width, height, mix) {
    if (mix <= 0) return;
    const imgData = ctx.getImageData(0, 0, width, height);
    const src = imgData.data;
    const out = new Uint8ClampedArray(src.length);
    const w4 = width * 4;
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = (y * width + x) * 4;
            for (let c = 0; c < 3; c++) {
                const center = src[i + c] * 5;
                const neighbors = src[i - 4 + c] + src[i + 4 + c] + src[i - w4 + c] + src[i + w4 + c];
                const sharp = center - neighbors;
                out[i + c] = Math.min(255, Math.max(0, src[i + c] * (1 - mix) + sharp * mix));
            }
            out[i + 3] = src[i + 3];
        }
    }
    imgData.data.set(out);
    ctx.putImageData(imgData, 0, 0);
}

async function executeImgUpscale() {
    try {
        const scale = parseInt(document.getElementById('up-scale').value);
        const sharpMix = parseFloat(document.getElementById('up-sharp').value);
        const targetW = Math.min(8000, state.singleFile.width * scale);
        const targetH = Math.min(8000, state.singleFile.height * scale);

        setStatus('loading', `Meningkatkan resolusi ke ${targetW}×${targetH} px...`);
        await new Promise(r => setTimeout(r, 40));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(state.singleFile.img, 0, 0, targetW, targetH);

        if (sharpMix > 0 && targetW * targetH <= 16000000) {
            applySharpenFilter(ctx, targetW, targetH, sharpMix);
        }

        canvas.toBlob((blob) => {
            const baseName = state.singleFile.name.replace(/\.[^.]+$/, '');
            downloadBlob(blob, `${baseName}_${scale}x_HD.png`);
            setStatus('success', `Resolusi berhasil dinaikkan menjadi ${targetW}×${targetH} px (${formatBytes(blob.size)})!`);
        }, 'image/png');
    } catch (err) {
        setStatus('error', 'Gagal menaikkan resolusi: ' + err.message);
    }
}

// =========================================================================
// 12. OCR EKSTRAK TEKS (Tesseract.js Lazy-Loaded)
// =========================================================================
function ensureTesseract() {
    if (window.Tesseract) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        s.onload = resolve;
        s.onerror = () => reject(new Error('Gagal memuat engine OCR Tesseract.js. Pastikan koneksi internet aktif.'));
        document.head.appendChild(s);
    });
}

async function handleOcrFile(file) {
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const isImg = file.type.startsWith('image/');
    if (!isPdf && !isImg) return setStatus('error', 'Harap pilih file gambar (JPG/PNG/WebP) atau PDF.');

    state.singleFile = { file, name: file.name, size: file.size, isPdf };
    showWorkspaceBody();
    const body = document.getElementById('ws-body');
    body.innerHTML = `
        <div class="p-4 rounded-xl bg-paper border-2 border-ink flex flex-wrap items-center justify-between gap-3">
            <div>
                <div class="text-xs font-black text-ink">${escapeHtml(file.name)}</div>
                <div class="text-[11px] text-muted font-semibold">${formatBytes(file.size)} • Siap diekstrak teksnya</div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <select id="ocr-lang" class="px-3 py-2 rounded-xl border-2 border-ink bg-surface text-xs font-bold text-ink">
                    <option value="ind+eng">Bahasa: Indonesia + Inggris</option>
                    <option value="ind">Bahasa: Indonesia</option>
                    <option value="eng">Bahasa: Inggris</option>
                </select>
                <button type="button" onclick="executeOcr()" class="btn-pill btn-pill-sage px-5 py-2.5 text-xs">
                    <i data-lucide="scan-text" class="w-4 h-4"></i>
                    <span>Mulai Ekstrak Teks</span>
                </button>
            </div>
        </div>
        <div id="ocr-result-box" class="hidden space-y-3">
            <div class="flex items-center justify-between">
                <span class="text-xs font-black text-ink">Hasil Teks (Bisa Diedit):</span>
                <div class="flex items-center gap-2">
                    <button type="button" onclick="copyOcrText()" class="btn-pill btn-pill-white px-3.5 py-1.5 text-xs"><i data-lucide="copy" class="w-3.5 h-3.5"></i> Salin Teks</button>
                    <button type="button" onclick="downloadOcrTxt()" class="btn-pill btn-pill-yellow px-3.5 py-1.5 text-xs"><i data-lucide="download" class="w-3.5 h-3.5"></i> Unduh .TXT</button>
                </div>
            </div>
            <textarea id="ocr-output" rows="10" class="w-full p-4 rounded-xl border-2 border-ink bg-paper text-xs font-semibold text-ink leading-relaxed focus:outline-none"></textarea>
        </div>
    `;
    lucide.createIcons();
}

async function executeOcr() {
    try {
        const lang = document.getElementById('ocr-lang').value;
        setStatus('loading', 'Memuat engine OCR...');
        await ensureTesseract();

        let imagesToScan = [];
        if (state.singleFile.isPdf) {
            setStatus('loading', 'Merender halaman PDF untuk OCR...');
            const bytes = await state.singleFile.file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
            const maxPages = Math.min(pdf.numPages, 10);
            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const vp = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                canvas.width = vp.width;
                canvas.height = vp.height;
                await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
                imagesToScan.push({ label: `Halaman ${i}`, src: canvas.toDataURL('image/png') });
            }
        } else {
            const dataUrl = await readFileAsDataURL(state.singleFile.file);
            imagesToScan.push({ label: 'Gambar', src: dataUrl });
        }

        let fullText = '';
        for (let i = 0; i < imagesToScan.length; i++) {
            const item = imagesToScan[i];
            const res = await Tesseract.recognize(item.src, lang, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        const pct = Math.round((m.progress || 0) * 100);
                        setStatus('loading', `Membaca teks (${item.label})... ${pct}%`);
                    }
                }
            });
            fullText += (imagesToScan.length > 1 ? `--- ${item.label} ---\n` : '') + (res.data.text || '').trim() + '\n\n';
        }

        document.getElementById('ocr-result-box').classList.remove('hidden');
        document.getElementById('ocr-output').value = fullText.trim();
        setStatus('success', 'Ekstraksi teks OCR selesai!');
    } catch (err) {
        setStatus('error', 'Gagal menjalankan OCR: ' + err.message);
    }
}

function copyOcrText() {
    const text = document.getElementById('ocr-output').value;
    navigator.clipboard.writeText(text).then(() => {
        setStatus('success', 'Teks berhasil disalin ke clipboard!');
    });
}

function downloadOcrTxt() {
    const text = document.getElementById('ocr-output').value;
    const baseName = state.singleFile.name.replace(/\.[^.]+$/, '');
    downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), `${baseName}_ocr.txt`);
}

// Initialize Card Reveal Observer (Staggered Manga Pop-in)
function initCardReveal() {
    const cards = document.querySelectorAll('.tool-card, .step-card');
    cards.forEach((card, idx) => {
        card.classList.add('reveal-card');
        card.style.setProperty('--reveal-delay', `${(idx % 4) * 70}ms`);
    });

    if (!('IntersectionObserver' in window)) {
        cards.forEach(c => c.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    cards.forEach(card => observer.observe(card));
}

// Initialize Lenis Smooth Scroll
function initLenis() {
    if (typeof Lenis === 'undefined') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.swiftLenis = lenis;
}

// Initialize Settings, Icons & Deep-Link Hash Routing
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initCardReveal();
    initLenis();
    lucide.createIcons();
    const hash = window.location.hash.replace('#', '');
    if (hash && TOOL_META[hash]) {
        openTool(hash);
    }
});
